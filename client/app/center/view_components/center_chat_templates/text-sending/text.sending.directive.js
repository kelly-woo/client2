/**
 * @fileoverview 전송 중이거나 실패한 text 메세지 directive
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('textSending', textSending);

  function textSending() {
    return {
      restrict: 'E',
      link: link,
      scope: {
        msg: '=',
        entityId: '@',
        entityType: '@'
      },
      controller: 'TextSendingCtrl',
      templateUrl: 'app/center/view_components/center_chat_templates/text-sending/text.sending.html'
    };

    function link(scope, element, attrs) {
      scope.showAnnouncement = false;
      scope.isMyMessage = true;
      scope.hasStar = false;
    }
  }
})();
