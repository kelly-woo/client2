(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('jndWebSocketCommon', jndWebSocketCommon);

  /* @ngInject */
  function jndWebSocketCommon(jndPubSub) {
    this.updateLeft = updateLeft;

    function updateLeft() {
      jndPubSub.updateLeftPanel();
    }
  }
})();
