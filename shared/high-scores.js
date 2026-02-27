// Shared high-score utility (localStorage-backed)
const SimplespilHighScores = (() => {
  function key(game) {
    return game + '_highscore';
  }

  function get(game) {
    return parseInt(localStorage.getItem(key(game))) || 0;
  }

  // Save score if it beats the current high score.
  // Returns { highScore, isNew } so callers can react to new records.
  function save(game, score) {
    let hs = get(game);
    let isNew = false;
    if (score > hs) {
      hs = score;
      localStorage.setItem(key(game), hs);
      isNew = true;
    }
    return { highScore: hs, isNew };
  }

  return { get, save };
})();
