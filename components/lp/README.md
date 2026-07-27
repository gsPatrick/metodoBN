# components/lp — landing page do Método BN

Landing construída seção a seção seguindo a skill `senior-landing-design`.

**Arquétipo Darkroom** (`archetypes.md` §3) — escolha do cliente. É defensável
pela própria skill: Darkroom atende "health, premium services", e o blend table
manda clínica → Darkroom primário com seções bone do Editorial para confiança.
Quando entrarem seções claras, elas usam `--lp-sage` (o verde real da marca);
o escuro usa `--lp-glow`, o mesmo matiz elevado para brilhar sobre o void.

Namespace separado de `components/organisms/landing/`, que é a landing antiga —
as duas coexistem sem se tocar.

## Estrutura

```
components/lp/
├── atoms/        primitivos sem regra de negócio (Wordmark, ArrowButton)
├── molecules/    composição de 2–3 atoms (ainda vazio)
└── organisms/    uma pasta por SEÇÃO da página (Header, Hero, …)
```

Um organism = uma seção. Arquivo e pasta com o mesmo nome, export default:

```
organisms/Hero/Hero.js
organisms/Hero/Hero.module.css
```

## Tokens

Ficam em `app/lp/page.module.css`, no wrapper `.page`, com prefixo `--lp-*`.
São **escopados de propósito**: o app é dark e força `data-theme` no boot
(ver `app/layout.js`), então a landing não pode herdar os tokens globais. Nenhum
componente daqui deve usar token do app — só `--lp-*`.

## Tema do header por seção

Cada seção declara com que cor o header deve aparecer sobre ela:

```jsx
<section data-lp-nav="onDark">   {/* header claro, sobre o vídeo */}
<section data-lp-nav="onLight">  {/* header escuro, sobre seção bone */}
```

O `Header` observa o scroll e troca sozinho. Ao adicionar uma seção nova, basta
declarar o atributo.

## Backdrop pinado

O vídeo do `Hero` é `position: sticky` e o conteúdo sobe com `margin-top: -100svh`.
Isso é intencional: as próximas seções podem rolar **por cima** do mesmo vídeo
sem recarregá-lo, que é o padrão "sticky video backdrop" do arquétipo.

## ⚠️ Procedência dos assets

O vídeo do hero (`hero-verdes.mp4`) e a foto `cta-atmosphere.jpg` vieram de banco
de vídeos/imagens. **Confirmar que a licença cobre uso comercial** antes de publicar.

Fica um alerta sobre `public/videos/hero-loop.mp4`, que está no repositório mas
não é mais usado por nada: ele é **byte a byte idêntico** ao asset do projeto
`remake-integrated-biosciences`, cujo README diz "portfolio reinterpretations…
All rights to original designs and assets remain with their respective owners".
Não é asset da Beatriz — vale remover.

As telas do app (`tela-*.png`) são capturas reais das rotas `/app`,
`/app/refeicoes`, `/app/chat` e `/app/compras`. Se a interface mudar, recapturar
em vez de redesenhar.


## Regras que não se quebram (da skill)

- Uma única superfície de acento por viewport (aqui: o círculo do `ArrowButton`)
- Corpo de texto no máximo 65ch
- `prefers-reduced-motion` sempre respeitado
- Sem scroll horizontal em 375px
