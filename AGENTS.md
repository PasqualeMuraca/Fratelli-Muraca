# AGENTS.md

Sito statico vanilla per la Società Agricola "Fratelli Muraca" (olio EVO, Lamezia Terme). Obiettivo del proprietario: **ammodernamento graduale mantenendo il sito elegante ed essenziale**.

## Stack e struttura
- Puro HTML/CSS/JS **senza build step**: niente `package.json`, npm, framework o bundler. Non installare dipendenze.
- `index.html` — tutto il markup, una sola pagina. Bootstrap 5.3.3 + Bootstrap Icons via jsDelivr CDN (SRI nel `<head>`). Nessun CSS locale.
- `script.js` — logica client: caricamento `products.json` via `fetch`, carrello (Map in memoria), card dei prodotti generate dinamicamente.
- `products.json` — catalogo: `[{ id, name, price, shipping, img_path }]`. Le immagini vivono in `products/` e `img_path` è **relativo a `products/`**.
- Contenuti in italiano; `README.md` e copia del sito sono in italiano.

## Deploy
- GitHub Pages, sorgente = branch `main` / root del repo. Nessuna CNAME, nessun workflow `.github`.
- Il sito è servito sotto `/Fratelli-Muraca/` (project page): **usare solo percorsi relativi** (`./media/`, `./products/`, `fetch('products.json')`). I percorsi assoluti romperebbero tutto.
- Nessun test, lint, CI o verifica locale; preview rapida = aprire `index.html` o servire la root (nota: `fetch('products.json')` fallisce via `file://`, serve un server statico tipo `python -m http.server`).

## Flusso ordini (da non rompere)
- Ordine via WhatsApp: bottone in `index.html` + `script.js` costruiscono un messaggio precompilato verso `wa.me/393384578681`.
- Il numero di telefono **compare in più punti**: `index.html` (footer, bottone ordine), `script.js` (`formatOrder`, `updateOrderLinks`). Se cambi numero, cerca tutte le occorrenze.

## Quirk verificati / obiettivi di ammodernamento
- `index.html` ha `lang="en"` ma i contenuti sono italiani.
- `products.json` referenzia solo `latt3l.png`, `5l.jpg`, `10l.jpg`; in `products/` giacciono immagini non usate (`2l.jpg`, `25l.jpg`, `latt5l.jpg`, `latt10l.jpg`).
- Tutti i `price`/`shipping` sono 0 (ultimo commit: "Update prices and shipping").
- Il bottone WhatsApp nel form ha `href="wa.me/393384578681?text="` malformato (manca `https://`); viene corretto a runtime da `updateOrderLinks()`.
- `og:image` in `index.html` punta a `raw.githubusercontent.com/PasqualeMuraca/...` (repository rinominato nel tempo; coerente con `origin`).
