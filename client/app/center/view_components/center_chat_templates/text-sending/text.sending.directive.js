/**
 * @fileoverview 전송 중이거나 실패한 text 메세지 directive
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('textSending', textSending);

  function textSending(MessageCollection, MessageText) {
    return {
      restrict: 'E',
      link: link,
      scope: {
        msg: '=',
        entityId: '@',
        entityType: '@',
        index: '='
      },
      controller: 'TextSendingCtrl',
      templateUrl: 'app/center/view_components/center_chat_templates/text-sending/text.sending.html'
    };

    function link(scope, el, attrs) {
      var lastMsg = MessageCollection.list[MessageCollection.list.length - 1];
      var hasProfile = false;
      if (!scope.index) {
        hasProfile = !MessageText.isChild(1, [lastMsg, scope.msg]);
      }
      if (!hasProfile) {
        el.addClass('text-child');
      }
      scope.hasProfile = hasProfile;
      scope.showAnnouncement = false;
      scope.isMyMessage = true;
      scope.hasStar = false;
    }
  }
})();
