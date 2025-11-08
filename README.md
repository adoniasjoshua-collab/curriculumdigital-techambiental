# Currículo — Adonias Pereira da Silva

Site one‑page do currículo “Adonias PROD10X”, focado em leitura na web, impressão A4 e exportação em PDF.

Estrutura

```
/ (root)
  ├─ index.html
  ├─ assets/
  │  ├─ css/
  │  │  ├─ styles.css
  │  │  └─ print.css
  │  ├─ js/
  │  │  └─ script.js
  │  └─ images/  (imagens do site)
  ├─ node_modules/ (opcional, se usar npx serve)
  ├─ package.json (mínimo, para servir estaticamente)
  └─ README.md
```

Como rodar localmente

- Opção 1 — Live Server (VS Code)
  - Abra a pasta no VS Code e clique em “Go Live”.
  - Acesse `http://127.0.0.1:5500/index.html`.

- Opção 2 — npx serve (Node.js)
  - Requisitos: Node 16+.
  - Comando:
    ```bash
    npx serve -l 5500 .
    # depois abra http://127.0.0.1:5500/index.html
    ```

- Opção 3 — Python (qualquer)
  ```bash
  python -m http.server 5500
  # depois abra http://127.0.0.1:5500/index.html
  ```

Como gerar o PDF

- Método recomendado: impressão do navegador
  - Abra a página e use `Ctrl/Cmd+P`.
  - Destino: “Salvar como PDF”.
  - Tamanho do papel: A4 (210×297mm), margens 25mm.
  - Habilite “imprimir cores de fundo” e desative cabeçalho/rodapé do navegador.

- Método alternativo: botão “Baixar CV” (html2canvas + jsPDF)
  - Clique no botão “Baixar CV” no herói. 
  - O script faz captura do conteúdo e cria páginas A4 automaticamente.


Deploy

- GitHub Pages
  1) Faça push do conteúdo para a branch `main`.
  2) Em Settings → Pages, selecione “Deploy from a branch”, `main`, folder `/root`.
  3) Aguarde o build. A URL ficará algo como `https://<usuario>.github.io/<repo>/`.

- Netlify
  1) Clique em “New site from Git”.
  2) Conecte seu repositório GitHub.
  3) Build command: vazio (site estático). Publish directory: `/`.
  4) Deploy e associe um domínio se desejar.

Paleta e tipografia

- Cores (variáveis CSS principais):
  - `--color-primary`: Azul profundo (confiança, cabeçalho, CTAs)
  - `--color-secondary`: Verde executivo (títulos de seção)
  - `--color-accent`: Verde‑limão (realces e cartões)
  - `--color-text` / `--color-bg`: texto e fundo

- Fontes
  - Títulos: Poppins 500/700
  - Texto: Lato 300/400/700

Changelog

- feat: scaffold — estrutura base HTML/CSS/JS
- feat: pdf-export — impressão A4 + botão de exportação
- chore: seo — metatags otimizadas (title, description, Open Graph)
- feat: print — cabeçalho/rodapé de impressão e quebras de página
- feat: hero — visual premium com gradiente, avatar e CTAs

Notas
- Imagem social/preview: `assets/img/preview.png`.
- Foto de perfil: `assets/images/ADONIAS PERFIL.png` (usada no herói e no cabeçalho de impressão).
