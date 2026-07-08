# Frutas (imagens)

Coloque aqui os PNGs das frutas (transparentes). O nome do arquivo = nome usado no código.

- Formato: **PNG transparente**, quadrado, **256×256** (ou 512×512 p/ mais nitidez), fruta centralizada com uma folga pequena.
- Enquanto o arquivo não existir, o sistema mostra o desenho SVG (fallback) automaticamente.

## Nomes esperados (use exatamente, minúsculo, em inglês)

Em uso hoje no dashboard:
- `strawberry.png` — morango
- `orange.png` — laranja
- `grapes.png` — uva
- `banana.png` — banana
- `avocado.png` — abacate

Outros que já têm fallback SVG (pode subir quando quiser):
- `apple.png` — maçã
- `lemon.png` — limão
- `watermelon.png` — melancia
- `broccoli.png` — brócolis
- `carrot.png` — cenoura

## Como usar no código
```jsx
import Fruit from "@/components/atoms/Fruit/Fruit";
<Fruit name="strawberry" size={64} />
```
`name` = nome do arquivo (sem `.png`). Se a imagem existir em /public/fruits, usa ela; senão, usa o SVG.
