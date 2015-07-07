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
    var _myId = memberService.getMemberId();
    // 현재 디렉티브가 가지고 있는 메시지 객체
    var _message = $scope.msg;
    var _messageId = _message.messageId;
    // 현재 토픽의 타입
    var _entityType = currentSessionHelper.getCurrentEntityType();
    // 현재 토픽의 아이디
    var _entityId = currentSessionHelper.getCurrentEntityId();
    // text 작성자
    var _writer = _message.message.writer;

    // 현재 메시지가 나의 메시지인지 알려주는 flag
    $scope.isMyMessage = (_myId === _message.fromEntity);
    $scope.showAnnouncement = _message.message.contentType !== 'sticker' && _entityType !== 'users';

    $scope.deleteMessage = deleteMessage;
    $scope.onUserClick = onUserClick;
    $scope.createAnnouncement = createAnnouncement;

    /**
     * 메시지를 삭제한다.
     */
    function deleteMessage() {
      if (confirm($filter('translate')('@web-notification-body-messages-confirm-delete'))) {
        if (_message.status === 'sending') {
          //MessageCollection.
          MessageCollection.remove(_messageId, true);
        } else {
          if (_message.message.contentType === 'sticker') {
            messageAPIservice.deleteSticker(_messageId);
          } else {
            messageAPIservice.deleteMessage(_entityType, _entityId, _messageId)
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
      jndPubSub.pub('onUserClick', _writer);
    }

    /**
     * 현재 메세지를 사용하여 announcement 을 만드는 펑션을 호출하라고 broadcast 한다.
     */
    function createAnnouncement() {
      var param = {
        'entityId': _entityId,
        'messageId': _messageId
      };

      jndPubSub.pub('createAnnouncement', param);
    }
  }
})();
