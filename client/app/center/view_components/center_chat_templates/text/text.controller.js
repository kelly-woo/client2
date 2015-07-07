/**
 * @fileoverview 센터페널 메세지중 단순 텍스트일때만 관리하는 컨트롤러
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TextMessageCtrl', TextMessageCtrl);

  /* @ngInject */
  function TextMessageCtrl($scope, memberService, $filter, messageAPIservice, currentSessionHelper, AnalyticsHelper, 
                           MessageCollection, jndPubSub) {
    // 현재 로그인되어있는 멤버(나)의 아이디
    var myId = memberService.getMemberId();
    // 현재 디렉티브가 가지고 있는 메시지 객체
    var message = $scope.msg;
    // 현재 토픽의 타입
    var _entityType = currentSessionHelper.getCurrentEntityType();
    // 현재 토픽의 아이디
    var _entityId = currentSessionHelper.getCurrentEntityId();
    // text 작성자
    var writer = message.message.writer;

    // 현재 메시지가 나의 메시지인지 알려주는 flag
    $scope.isMyMessage = myId === message.fromEntity;

    $scope.deleteMessage = deleteMessage;
    $scope.onUserClick = onUserClick;

    /**
     * 메시지를 삭제한다.
     */
    function deleteMessage() {
      if (confirm($filter('translate')('@web-notification-body-messages-confirm-delete'))) {
        if (message.status === 'sending') {
          //MessageCollection.
          MessageCollection.remove(message.messageId, true);
        } else {
          if (message.message.contentType === 'sticker') {
            messageAPIservice.deleteSticker(message.messageId);
          } else {
            messageAPIservice.deleteMessage(_entityType, _entityId, message.messageId)
              .success(function () {
                try {
                  AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_DELETE, {
                    'MESSAGE_ID': message.messageId,
                    'RESPONSE_SUCCESS': true
                  });
                } catch (e) {
                }
              })
              .error(function (response) {
                try {
                  AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_DELETE, {
                    'RESPONSE_SUCCESS': false,
                    'ERROR_CODE': response.code
                  });
                } catch (e) {
                }
              });
          }

        }
      }
    }

    /**
     * user profile event trigger
     */
    function onUserClick() {
      jndPubSub.pub('onUserClick', writer);
    }
  }
})();