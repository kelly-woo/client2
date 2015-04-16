(function() {
  'use strict';

  angular
    .module('app.pubsub')
    .service('jndPubSub', jndPubSub);

  /* @ngInject */
  function jndPubSub($rootScope) {

    this.pub = publish;

    this.updateLeftPanel = updateLeftPanel;
    this.updateChatList = updateChatList;

    function publish(event, param) {
      $rootScope.$broadcast(event, param);
    }

    function updateLeftPanel() {
      $rootScope.$broadcast('updateLeftPanelCaller');
    }

    function updateChatList() {
      $rootScope.$broadcast('updateChatList');
    }
  }
})();