/**
 * @fileoverview Sending 중이거나, 실패한 텍스트 메세지 컨트롤러
 * @author Young Park <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TextSendingCtrl', TextSendingCtrl);

  function TextSendingCtrl($scope, MessageSendingCollection) {
    $scope.retry = retry;

    console.log('TextSendingCtrl', this);
    /**
     * retry 버튼 눌렀을 경우 재 전송을 시도한다.
     */
    function retry() {
      var msg = $scope.msg;
      var payload = msg._payload;
      var contentType = msg.message.contentType;
      var content = payload.content;
      var sticker = payload.sticker;
      var mentions = payload.mentions;

      if (contentType === 'sticker') {
        content = '';
        mentions = null;
      } else {
        sticker = null;
      }

      $scope.$parent.post(content, sticker, mentions);
      MessageSendingCollection.remove(msg);
    }
  }
})();
