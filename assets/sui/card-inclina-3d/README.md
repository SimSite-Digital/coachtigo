# Card que inclina em 3D

`data-sui-inclina`

Cartão que inclina acompanhando o cursor, com brilho que segue o ponteiro, cantos técnicos que aparecem e número grande ao fundo.

**Quando usar:** Etapas de método, pilares, áreas de atuação. Poucos cartões e muito espaço em volta — o efeito depende de respiro para não virar bagunça.

## Arquivos

```
card-inclina-3d/
├── card-inclina-3d.css
├── card-inclina-3d.js
├── demo.html
└── README.md
```

## Instalação

```html
<link rel="stylesheet" href="_core/tokens.css">
<link rel="stylesheet" href="card-inclina-3d/card-inclina-3d.css">

<script src="_core/sui-core.js" defer></script>
<script src="card-inclina-3d/card-inclina-3d.js" defer></script>
```

## Marcação

```html
<article class="sui-inclina" data-sui-inclina data-numero="04">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="2" y="2" width="6" height="6" rx="1"/>
  </svg>
  <h3>Estratégia</h3>
  <p>Visão de longo prazo, proteção patrimonial e planejamento que vai
  além do problema imediato.</p>
</article>
```

## Atributos

| Atributo | Padrão | Para que serve |
|---|---|---|
| `data-grau` | `10` | Inclinação máxima em graus. |
| `data-eleva` | `6` | Quanto o cartão sobe no hover, em px. |
| `data-numero` | `—` | Número grande ao fundo. Some se não informar. |

## Cuidados

- Você escreve só o conteúdo. A JS envolve tudo em `.sui-inclina__corpo` e injeta brilho, cantos e número — a marcação da página fica limpa.
- No toque não há inclinação: sem cursor, o efeito não tem o que seguir e o cartão ficaria tremendo. Fica só o estado de destaque.
- O número ao fundo é decorativo e recebe `aria-hidden`. Se a ordem importa para quem usa leitor de tela, ela tem que estar no texto.
- A inclinação roda sem transição enquanto o mouse se move, senão fica com atraso. A transição volta quando o cursor sai.

## Tema

Todas as cores vêm de `_core/tokens.css`. Para mudar de cliente, sobrescreva
num wrapper — não edite o CSS do componente.

```css
.cliente-x { --sui-accent: #C9A227; --sui-accent-2: #E4C25C; }
```
