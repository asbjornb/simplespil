// Shared high-score utility for all games
const HighScores = (() => {
  // Migrate old keys from before we standardised naming
  const OLD_KEYS = {
    jump: 'jump_highscore',
    tetris: 'tetris_highscore',
    whacamole: 'whacamole_highscore',
    catch: 'catch_highscore',
  };

  function _key(game) {
    return 'simplespil_' + game + '_highscore';
  }

  function _migrate(game) {
    const oldKey = OLD_KEYS[game];
    if (!oldKey) return;
    const oldVal = localStorage.getItem(oldKey);
    if (oldVal !== null) {
      const cur = parseInt(localStorage.getItem(_key(game))) || 0;
      const old = parseInt(oldVal) || 0;
      if (old > cur) {
        localStorage.setItem(_key(game), old);
      }
      localStorage.removeItem(oldKey);
    }
  }

  function get(game) {
    _migrate(game);
    return parseInt(localStorage.getItem(_key(game))) || 0;
  }

  function save(game, score) {
    localStorage.setItem(_key(game), score);
  }

  /**
   * Check if score is a new high score. If so, save it.
   * Returns true if it was a new high score.
   */
  function check(game, score) {
    if (score > get(game)) {
      save(game, score);
      return true;
    }
    return false;
  }

  return { get, save, check };
})();
