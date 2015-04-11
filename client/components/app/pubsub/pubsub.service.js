(function() {
  'use strict';

  angular
    .module('app.pubsub')
    .service('jndPubSub', jndPubSub);

  /* @ngInject */
  function jndPubSub($rootScope) {

    this.pub = publish;

    function publish(event, param) {
      $rootScope.$broadcast(event, param);
    }
  }
})();