document.getElementById('startBtn').addEventListener('click', () => {
  const count = parseInt(document.getElementById('count').value, 10) || 30;
  const delay = parseInt(document.getElementById('delay').value, 10) || 7;

  chrome.runtime.sendMessage({ action: 'start', count, delay });
  document.getElementById('status').textContent = `En cours : 0 / ${count}`;
});

document.getElementById('stopBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'stop' });
  document.getElementById('status').textContent = 'Arrêté';
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'progress') {
    document.getElementById('status').textContent = `En cours : ${msg.current} / ${msg.total}`;
  } else if (msg.type === 'done') {
    document.getElementById('status').textContent = 'Terminé !';
  }
});