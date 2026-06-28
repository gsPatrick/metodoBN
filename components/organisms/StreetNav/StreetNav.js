"use client";

import { useEffect, useRef } from "react";
import Icon from "@/components/atoms/Icon/Icon";
import styles from "./StreetNav.module.css";

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

// carrega a Maps JavaScript API uma única vez
let gmapsPromise = null;
function loadGoogleMaps() {
  if (typeof window === "undefined") return Promise.reject(new Error("no-window"));
  if (window.google && window.google.maps) return Promise.resolve(window.google);
  if (gmapsPromise) return gmapsPromise;
  gmapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("gmaps-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.google));
      existing.addEventListener("error", () => reject(new Error("load-failed")));
      return;
    }
    const s = document.createElement("script");
    s.id = "gmaps-js";
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&v=weekly&language=pt-BR&region=BR`;
    s.async = true;
    s.onload = () => resolve(window.google);
    s.onerror = () => reject(new Error("load-failed"));
    document.head.appendChild(s);
  });
  return gmapsPromise;
}

const toRad = (x) => (x * Math.PI) / 180;
const toDeg = (x) => (x * 180) / Math.PI;
function metersBetween(a, b) {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function bearing(a, b) {
  const dLon = toRad(b.lng - a.lng);
  const y = Math.sin(dLon) * Math.cos(toRad(b.lat));
  const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) - Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}
function angleDiff(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}
function instructionFor(rel) {
  if (Math.abs(rel) <= 22) return "Siga em frente";
  if (rel > 22 && rel <= 150) return "Vire à direita";
  if (rel < -22 && rel >= -150) return "Vire à esquerda";
  return "Vire para trás";
}
function distText(m) {
  if (m == null) return "";
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

// Street View que começa na posição do usuário, mostra a seta/instrução de para onde
// ir e se auto-guia (anda sozinho) até o mercado.
export default function StreetNav({ start, dest, onProgress, onArrive, onFail }) {
  const ref = useRef(null);
  const arrowRef = useRef(null);
  const textRef = useRef(null);
  const panoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let arrivedFlag = false;
    if (!KEY || !start || !dest) {
      if (onFail) onFail();
      return undefined;
    }
    const destLL = { lat: Number(dest.lat), lng: Number(dest.lng != null ? dest.lng : dest.lon) };
    const startLL = { lat: Number(start.lat), lng: Number(start.lng != null ? start.lng : start.lon) };

    function updateGuide() {
      const pano = panoRef.current;
      if (!pano || cancelled) return;
      const p = pano.getPosition();
      if (!p) return;
      const cur = { lat: p.lat(), lng: p.lng() };
      const pov = pano.getPov() || { heading: 0 };
      const tb = bearing(cur, destLL);
      const rel = ((tb - pov.heading + 540) % 360) - 180; // -180..180 (negativo=esquerda)
      const d = metersBetween(cur, destLL);
      if (onProgress) onProgress(d);
      if (!arrivedFlag && d < 30) {
        arrivedFlag = true;
        if (onArrive) onArrive();
      }
      if (arrowRef.current) arrowRef.current.style.transform = `rotate(${rel - 90}deg)`;
      if (textRef.current) {
        textRef.current.textContent = arrivedFlag ? `Chegou! · ${dest.name || "mercado"}` : `${instructionFor(rel)} · ${distText(d)}`;
      }
    }

    function initPano(google, data) {
      if (cancelled || !ref.current) return;
      const pos = data.location.latLng;
      const h = bearing({ lat: pos.lat(), lng: pos.lng() }, destLL);
      const pano = new google.maps.StreetViewPanorama(ref.current, {
        pano: data.location.pano,
        pov: { heading: h, pitch: 0 },
        zoom: 0,
        addressControl: false,
        showRoadLabels: true,
        linksControl: true,
        clickToGo: true,
        panControl: false,
        zoomControl: false,
        enableCloseButton: false,
        fullscreenControl: false,
        motionTracking: false,
        motionTrackingControl: false,
      });
      panoRef.current = pano;
      pano.addListener("pov_changed", updateGuide);
      pano.addListener("position_changed", updateGuide);
      updateGuide();
    }

    loadGoogleMaps()
      .then((google) => {
        if (cancelled) return;
        const svc = new google.maps.StreetViewService();
        svc.getPanorama({ location: startLL, radius: 120, source: google.maps.StreetViewSource.OUTDOOR }, (data, status) => {
          if (cancelled) return;
          if (status === "OK" && data && data.location) {
            initPano(google, data);
          } else {
            svc.getPanorama({ location: startLL, radius: 400 }, (d2, s2) => {
              if (cancelled) return;
              if (s2 === "OK" && d2 && d2.location) initPano(google, d2);
              else if (onFail) onFail();
            });
          }
        });
      })
      .catch(() => {
        if (!cancelled && onFail) onFail();
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.wrap}>
      <div ref={ref} className={styles.pano} aria-label="Street View guiando até o mercado" />
      <div className={styles.guide}>
        <span ref={arrowRef} className={styles.guideArrow}>
          <Icon name="arrowRight" size={28} strokeWidth={2.8} />
        </span>
        <span ref={textRef} className={styles.guideText}>
          Calculando rota…
        </span>
      </div>
    </div>
  );
}
