// Simple localStorage play counter
const SimplespilStats = (() => {
  const KEY = 'simplespil-play-counts';

  function getCounts() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  }

  function recordPlay(game) {
    const counts = getCounts();
    counts[game] = (counts[game] || 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(counts));
  }

  function getCount(game) {
    return getCounts()[game] || 0;
  }

  return { recordPlay, getCount, getCounts };
})();
