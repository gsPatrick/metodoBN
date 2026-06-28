"use client";

import { useState } from "react";
import FoodArt from "@/components/atoms/FoodArt/FoodArt";
import styles from "./Fruit.module.css";

/* bump quando trocar/reprocessar imagens para furar o cache do navegador */
const ASSET_V = "3";

/* Mostra a imagem em /public/fruits/<name>.<ext> quando existir;
   enquanto não existir (ou der erro), cai no desenho SVG (FoodArt). */
export default function Fruit({ name, fallback, size = 48, ext = "png", className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <FoodArt name={fallback || name} size={size} className={className} />;
  }

  return (
    <img
      src={`/fruits/${name}.${ext}?v=${ASSET_V}`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={[styles.fruit, className].filter(Boolean).join(" ")}
      onError={() => setFailed(true)}
    />
  );
}
