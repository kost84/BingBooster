let isRunning = false;
let searchTabId = null;

const motsCles = [
  "météo", "recette", "actualité", "définition", "histoire", "film",
  "musique", "sport", "science", "voyage", "technologie", "jeu vidéo",
  "livre", "cuisine", "voiture", "espace", "nature", "cinéma",
  "informatique", "économie", "santé", "architecture", "photographie",
  "astronomie", "géographie", "biologie", "physique", "littérature"
];

const sujets = [
  "France", "2026", "rapide", "facile", "meilleur", "guide", "tuto",
  "origine", "prix", "avis", "classement", "nouveauté", "explication",
  "Europe", "monde", "gratuit", "comparatif", "astuce", "top 10"
];

function genererRequete() {
  const m = motsCles[Math.floor(Math.random() * motsCles.length)];
  const s = sujets[Math.floor(Math.random() * sujets.length)];
  const n = Math.floor(Math.random() * 999);
  return `${m} ${s} ${n}`;
}

function attendre(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function lancerRecherches(total, delaySec) {
  isRunning = true;

  const tab = await chrome.tabs.create({ url: "https://www.bing.com", active: false });
  searchTabId = tab.id;

  for (let i = 1; i <= total; i++) {
    if (!isRunning) break;

    const query = encodeURIComponent(genererRequete());
    const url = `https://www.bing.com/search?q=${query}&form=QBLH`;

    try {
      await chrome.tabs.update(searchTabId, { url });
    } catch (e) {
      // Si l'utilisateur ferme l'onglet manuellement, on arrête proprement
      isRunning = false;
      break;
    }

    chrome.runtime.sendMessage({ type: 'progress', current: i, total }).catch(() => {});

    if (i < total && isRunning) {
      // Délai aléatoire entre (delaySec - 2) et (delaySec + 3) secondes
      const minMs = Math.max(3000, (delaySec - 2) * 1000);
      const maxMs = (delaySec + 3) * 1000;
      const randomDelay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
      await attendre(randomDelay);
    }
  }

  isRunning = false;
  chrome.runtime.sendMessage({ type: 'done' }).catch(() => {});
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'start' && !isRunning) {
    lancerRecherches(message.count, message.delay);
  } else if (message.action === 'stop') {
    isRunning = false;
  }
});