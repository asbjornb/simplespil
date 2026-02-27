if ('serviceWorker' in navigator) {
  const swUrl = new URL('../sw.js', document.currentScript.src);
  navigator.serviceWorker.register(swUrl);
}
