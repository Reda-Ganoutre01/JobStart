# 📋 JobStart

JobStart is a lightweight job-offers front-end project built with plain HTML, CSS and JavaScript. It provides pages to list job offers, view offer details, and simple candidate/recruiter forms. The project is static (no backend required) and stores sample data in `data/offers.json`.

🎨 Frontend
🛠️ Technologies Used

- HTML
- CSS (styles in `css/`)
- Vanilla JavaScript (`js/`)
- Static assets in `assets/` (images, icons, sounds)

⚙️ Setup

There is no build step — open files directly in a browser or serve the folder with a static server for correct relative routing and fetch behavior.

Open `index.html` in your browser, or run a simple static server from the project root:

```bash
# using Python 3
python -m http.server 8000

# then open http://localhost:8000
```

Or use `serve` (Node):

```bash
npm install -g serve
serve -s . -l 8000
```

📁 Directory Structure

```
JobStart/
├── Apropos.html
├── Conseils.html
├── contact.html
├── form-candidat.html
├── form-recruteur.html
├── index.html
├── login.html
├── OfferDetail.html
├── Offers.html
├── SignUp.html
├── assets/
│   ├── bg/
│   ├── icons/
│   ├── images/
│   ├── logo/
│   └── sounds/
├── css/
│   ├── conseils.css
│   ├── contact.css
│   ├── footer.css
│   ├── form-candidat.css
│   ├── form-recruteur.css
│   ├── from-recruteur.css
│   ├── header.css
│   ├── index.css
│   ├── loader.css
│   ├── login.css
│   ├── offer_detail.css
│   ├── offers.css
│   ├── scrollbar.css
│   ├── signup.css
│   └── style.css
├── data/
│   ├── constants.global.js
│   └── offers.json          # Sample job offers data
├── docs/
│   └── Diagrams/
└── js/
	├── condidat.js
	├── contact.js
	├── darkmode.js
	├── loading.js
	├── login.js
	├── main.js
	├── offer_detail.js
	├── offers.js
	└── recruteur.js
```

🌐 Data

- `data/offers.json` contains sample job offers used by the front-end pages. Edit this file to adjust demo content.
- `data/constants.global.js` contains project constants (for example base URL placeholders) used by the JS modules.

✨ Features

- 📋 Browse job offers (`Offers.html`).
- 📖 View detailed offer information (`OfferDetail.html`).
- 📝 Candidate and recruiter forms (`form-candidat.html`, `form-recruteur.html`).
- 🌙 Dark mode support (see `js/darkmode.js`).
- 🔁 Client-side interactions and basic routing using vanilla JS.

🚀 Getting Started

✅ Prerequisites

- A modern browser (Chrome, Firefox, Edge)
- Optional: `python` (for `http.server`) or `node` + `serve` for static hosting

📥 Installation and Running

1. Clone the repository:

```bash
git clone https://github.com/Reda-Ganoutre01/JobStart.git
cd JobStart
```

2. Serve the project (choose one):

- Quick: open `index.html` directly in your browser.
- Using Python HTTP server:

```bash
python -m http.server 8000
# visit http://localhost:8000
```

- Using Node `serve`:

```bash
npm install -g serve
serve -s . -l 8000
# visit http://localhost:8000
```

⚙️ Configuration

- If you later add a backend API, update `data/constants.global.js` and adjust the JS modules to fetch from the API endpoint instead of the local JSON.

🔧 Troubleshooting

- 🚨 If JSON doesn't load when opening files directly, serve the project with a static server (browsers block `fetch` for local files).
- 📦 If assets are missing, verify the `assets/` contents and file paths in HTML.

🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Test locally
5. Submit a pull request

📝 Notes

- This repository is currently a static front-end. I can scaffold a Node/Express backend that serves `offers.json` (and add API endpoints) if you want persistent storage or an API layer.

---

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. ✏️ Make your changes
4. 🧪 Test thoroughly
5. 📤 Submit a pull request
