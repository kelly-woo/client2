(function() {
  'use strict';

  angular
    .module('app.socket', ['btford.socket-io'])
    .config(config)
    .run(run);

  /* @ngInject */
  function config() {

  }

  /* @ngInject */
  function run(jndWebSocket) {
    jndWebSocket.init();
  }
})();