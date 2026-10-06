# Fundo de grade com movimento

`data-sui-grade`

Grade técnica de 1px com blocos que derivam lentamente por cima, com máscara radial para não virar moldura. Dá profundidade a seções escuras sem competir com o conteúdo.

**Quando usar:** Fundo de seções escuras. No máximo duas ou três por página — se estiver em toda seção, deixa de ser detalhe.

## Arquivos

```
fundo-grade-movimento/
├── fundo-grade-movimento.css
├── fundo-grade-movimento.js
├── demo.html
└── README.md
```

## Instalação

```html
<link rel="stylesheet" href="_core/tokens.css">
<link rel="stylesheet" href="fundo-grade-movimento/fundo-grade-movimento.css">

<script src="_core/sui-core.js" defer></script>
<script src="fundo-grade-movimento/fundo-grade-movimento.js" defer></script>
```

## Marcação

```html
<section class="secao">   <!-- position:relative; overflow:hidden -->
  <div class="sui-grade" data-sui-grade data-density="20"></div>
  <div class="conteudo">…</div>
</section>
```

## Atributos

| Atributo | Padrão | Para que serve |
|---|---|---|
| `data-density` | `18` | Quantidade de blocos. Cai pela metade sozinho abaixo de 720px. |
| `data-min-size` | `4` | Menor bloco em px. |
| `data-max-size` | `14` | Maior bloco em px. |
| `data-grid` | `64` | Módulo da malha em px. |

## Cuidados

- A seção que contém precisa de `position: relative` e `overflow: hidden`, senão os blocos vazam.
- O elemento tem que ser o **primeiro filho**. A regra `.sui-grade ~ *` é o que sobe o conteúdo acima dele.
- A animação pausa sozinha fora da viewport. Não adicione outra lógica de pausa por cima.

## Tema

Todas as cores vêm de `_core/tokens.css`. Para mudar de cliente, sobrescreva
num wrapper — não edite o CSS do componente.

```css
.cliente-x { --sui-accent: #C9A227; --sui-accent-2: #E4C25C; }
```
