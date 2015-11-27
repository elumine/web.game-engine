var System, client;

System = (function() {
  function System(options) {
    this.engine = new GameEngine(this);
  }

  return System;

})();

client = {};

$(document).ready(function() {
  return client = new System;
});
