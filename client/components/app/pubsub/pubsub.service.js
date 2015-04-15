(function() {
  'use strict';

  angular
    .module('app.pubsub')
    .service('jndPubSub', jndPubSub);

  /* @ngInject */
  function jndPubSub($rootScope) {

    this.pub = publish;

    function publish(event, param) {
      console.log('broadcasting ', event)
      $rootScope.$broadcast(event, param);
    }
  }
})();