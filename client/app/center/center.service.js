(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('centerService', centerService);

  /* @ngInject */
  function centerService(memberService, publicService, currentSessionHelper) {

    this.preventChatWithMyself  = preventChatWithMyself;
    this.isIE9  = isIE9;
    this.isChat  = isChat;

    function preventChatWithMyself(entityId) {
      entityId = parseInt(entityId);
      if (entityId === memberService.getMemberId()) {
        publicService.goToDefaultTopic();
      }
    }

    function isIE9() {
      if (angular.isDefined(FileAPI.support)) {
        if (!FileAPI.support.html5)
          return true;
      }
      return false;
    }

    function isChat() {
      return currentSessionHelper.getCurrentEntityType() === 'users';
    }
  }
})();