"use client";

import { useRef, useState } from "react";
import styles from "./PhotoEditor.module.css";
import Icon from "@/components/atoms/Icon/Icon";
import Button from "@/components/atoms/Button/Button";

const BOX = 280;
const OUT = 256;

export default function PhotoEditor({ src, onSave, onCancel }) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [nat, setNat] = useState({ w: 1, h: 1 });
  const imgRef = useRef(null);
  const drag = useRef(null);

  const cover = nat.w && nat.h ? BOX / Math.min(nat.w, nat.h) : 1;
  const dispW = nat.w * cover * scale;
  const dispH = nat.h * cover * scale;
  const left = BOX / 2 + pan.x - dispW / 2;
  const top = BOX / 2 + pan.y - dispH / 2;

  function clamp(p, s) {
    const dw = nat.w * cover * s;
    const dh = nat.h * cover * s;
    const maxX = Math.max(0, (dw - BOX) / 2);
    const maxY = Math.max(0, (dh - BOX) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, p.x)), y: Math.max(-maxY, Math.min(maxY, p.y)) };
  }

  function point(e) {
    return e.touches ? e.touches[0] : e;
  }
  function onDown(e) {
    const pt = point(e);
    drag.current = { x: pt.clientX, y: pt.clientY, px: pan.x, py: pan.y };
  }
  function onMove(e) {
    if (!drag.current) return;
    const pt = point(e);
    setPan(clamp({ x: drag.current.px + (pt.clientX - drag.current.x), y: drag.current.py + (pt.clientY - drag.current.y) }, scale));
  }
  function onUp() {
    drag.current = null;
  }

  function save() {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUT;
    canvas.height = OUT;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(OUT / 2, OUT / 2, OUT / 2, 0, Math.PI * 2);
    ctx.clip();
    const k = OUT / BOX;
    ctx.drawImage(img, left * k, top * k, dispW * k, dispH * k);
    onSave(canvas.toDataURL("image/png"));
  }

  return (
    <div className={styles.overlay} onMouseMove={onMove} onMouseUp={onUp} onTouchEnd={onUp}>
      <div className={styles.modal}>
        <span className={styles.title}>Ajustar foto</span>
        <span className={styles.hint}>Arraste para posicionar e use o zoom.</span>
        <div className={styles.box} onMouseDown={onDown} onTouchStart={onDown} onTouchMove={onMove}>
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            className={styles.img}
            style={{ "--l": `${left}px`, "--t": `${top}px`, "--w": `${dispW}px`, "--h": `${dispH}px` }}
            onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          />
          <span className={styles.mask} />
        </div>
        <div className={styles.zoomRow}>
          <Icon name="image" size={18} />
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={scale}
            className={styles.zoom}
            onChange={(e) => {
              const s = Number(e.target.value);
              setScale(s);
              setPan((p) => clamp(p, s));
            }}
          />
          <Icon name="zoomIn" size={18} />
        </div>
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={save} iconLeft={<Icon name="check" size={18} />}>
            Salvar foto
          </Button>
        </div>
      </div>
    </div>
  );
}
