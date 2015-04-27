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
    this.updateMessageList = updateMessageList;
    this.updateRightFileDetailPanel = updateRightFileDetailPanel;

    this.toDefaultTopic = toDefaultTopic;

    this.updateLeftChatList = updateLeftChatList;

    function publish(event, param) {
      $rootScope.$broadcast(event, param);
    }

    function updateLeftPanel() {
      $rootScope.$broadcast('updateLeftPanelCaller');
    }

    function updateChatList() {
      $rootScope.$broadcast('centerUpdateChatList');
    }
    function updateMessageList() {
      $rootScope.$broadcast('updateMessageList');
    }

    function updateRightFileDetailPanel() {
      $rootScope.$broadcast('updateRightFileDetailPanel');
    }

    function toDefaultTopic() {
      $rootScope.$broadcast('toDefaultTopic');
    }

    function updateLeftChatList() {
      $rootScope.$broadcast('updateMessageList');
    }
  }
})();