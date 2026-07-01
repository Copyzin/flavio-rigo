# Flávio Rigo — Sociedade Individual de Advocacia

Landing page institucional de alta fidelidade — site **estático, sem build**, pronto para publicar.
Desenvolvido por **Almeida Escala Digital**.

---

## Tecnologias

- **HTML5 semântico** + **CSS3** com *design tokens* (CSS custom properties) — **sem framework**, CSS puro.
- **JavaScript vanilla** (padrão IIFE, **sem etapa de build**).
- **GSAP 3.12.5 + ScrollTrigger** (via CDN) — entrada do título palavra a palavra, **parallax 3D em camadas na hero**, **luz que segue o cursor**, contadores e timeline do atendimento.
- **Google Fonts** (Playfair Display + Source Sans 3) via CDN.
- **Google Maps** (embed `iframe`) na seção Localização.
- **Sem backend**: contato por WhatsApp (`wa.me`), `tel:` e `mailto:`.

> Por ser 100% estático, para publicar basta **servir os arquivos** — não há dependências de servidor.

---

## Estrutura do projeto

```
.
├── index.html            # Landing principal (ponto de entrada)
├── 404.html              # Página de erro 404
├── styles.css            # Design tokens concatenados (1 unico request; ver nota abaixo)
├── tokens/               # Design tokens — SOMENTE REFERENCIA, nao lido em runtime
│   ├── fonts.css         #   nota sobre fontes (Google Fonts via <link> direto no <head>)
│   ├── colors.css        #   paleta (--fr-navy, --fr-mist, …)
│   ├── typography.css
│   ├── spacing.css       #   --container, espaçamentos
│   ├── base.css
│   ├── components.css
│   └── effects.css
├── assets/
│   ├── favicon.png
│   ├── css/
│   │   ├── landing.css   # todos os estilos da landing + 404 + chat WhatsApp
│   │   └── blog.css      # estilos do blog (index de categorias + artigos)
│   ├── js/
│   │   └── landing.js    # mecânicas (GSAP, parallax, luz, menu, FAB/chat, FAQ)
│   └── img/
│       ├── hero-arch.webp     # fachada clássica (duotone navy)
│       ├── hero-lines.webp    # linework editorial
│       └── hero-texture.webp  # textura de fundo da hero
├── blog/                 # índice de categorias + artigos (rotas estáticas)
├── .htaccess             # 404 custom, HTTPS, cache e gzip (Apache/Hostinger)
├── pagespeed.js           # roda PageSpeed Insights (mobile+desktop) contra o site publicado
└── README.md
```

> **Por que `styles.css` concatena os tokens em vez de `@import`-ar `tokens/*.css`?**
> `@import` dentro de CSS cria uma cadeia serial: o browser só descobre o próximo arquivo
> depois de parsear o anterior, e cada um é uma requisição HTTP bloqueando o render. Os
> arquivos em `tokens/` continuam no repo como referência organizada do design system, mas
> **editar lá não tem efeito no site** — a fonte viva é `styles.css`. Ao editar um token,
> replique a mudança no arquivo de referência correspondente para não perder a organização.

---

## Preview local

Qualquer servidor de arquivos estáticos serve. Com Node.js instalado:

```bash
npx http-server -p 8123 -c-1
# abra http://127.0.0.1:8123/
```

---

## Deploy na Hostinger

O site é estático e o `index.html` já está na **raiz** do repositório. Basta enviar **todos os arquivos para a pasta `public_html`** (a raiz do domínio) — o site abre direto em `https://seudominio.com`.

### Opção A — Git (recomendado, painel hPanel)

1. hPanel → **Avançado → Git**.
2. Em *Create a New Repository*, informe o repositório `https://github.com/Copyzin/flavio-rigo` e o branch **`main`**.
3. Em **Install Path**, use **`public_html`** (raiz do domínio).
4. **Create** → **Deploy**. Opcional: ative *Auto Deployment* para publicar a cada `git push`.
5. A cada atualização: novo `git push` e clique em **Deploy** (ou deixe automático).

### Opção B — Upload manual (Gerenciador de Arquivos ou FTP)

1. Baixe o projeto (**Code → Download ZIP**) e descompacte.
2. hPanel → **Arquivos → Gerenciador de Arquivos** → entre em **`public_html`**.
3. Envie **todo o conteúdo** — `index.html`, `404.html`, `styles.css`, `.htaccess` e as pastas **`tokens/`** e **`assets/`** — **preservando as pastas**.
4. Acesse `https://seudominio.com`.

> ⚠️ Mantenha a estrutura de pastas (`assets/`, `tokens/`) e o `index.html` na **raiz** de `public_html`.

O **`.htaccess`** incluído já cuida de: **404 personalizada**, **redirecionamento para HTTPS**, **cache** dos estáticos e **compressão gzip**.

---

## Google Tag Manager — onde colocar

Os marcadores do GTM já estão **prontos no `index.html`** (comentados). Para ativar:

1. Abra **`index.html`**.
2. No **`<head>`** (logo após a `<meta name="viewport">`) há o bloco `<!-- Google Tag Manager -->`: **descomente** e troque `GTM-XXXXXXX` pelo ID do seu container.
3. Logo após a tag **`<body>`** há o bloco `<!-- Google Tag Manager (noscript) -->`: **descomente** e troque o mesmo `GTM-XXXXXXX`.
4. Faça novo deploy.

> Para rastrear também a página de erro, replique os mesmos dois blocos em **`404.html`**.

---

## Pendências (placeholders no código)

- Nº **OAB/UF** real (hoje `000.000`).
- **E-mail** real (hoje `contato@flaviorigo.adv.br`).
- **Foto profissional** (a hero é tipográfica; a seção *Sobre* tem o slot pronto).
- ID do **Google Tag Manager**.
- **`og:image`** (imagem de compartilhamento em redes sociais).

---

## Conformidade

Conteúdo 100% informativo, em conformidade com o **Provimento nº 205/2021 da OAB**: sem promessa de resultado e sem captação indevida de clientela.
