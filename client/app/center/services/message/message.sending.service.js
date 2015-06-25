(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MessageSending', MessageSending);

  /* @ngInject */
  function MessageSending($rootScope) {
    var _sendingKey = 0;
    var that = this;

    this.queue = [];
    this.queueMap = {};

    this.enqueue = enqueue;
    this.splice = splice;
    this.reset = reset;
    this.isSending = isSending;

    function reset() {
      _sendingKey = 0;
      that.queue = [];
      that.queueMap = {};
    }

    function enqueue(content, sticker) {
      var messageList = [];
      that.queue.push({
        content: content,
        sticker: _.clone(sticker)
      });

      if (sticker) {
        messageList.push(_getSticker(sticker));
      }
      messageList.push(_getText(content));

      return messageList;
    }

    function splice(startIdx, length) {
      that.queue.splice(startIdx, length);
    }

    function isSending(msg) {
      return msg.status === 'sending';
    }

    function _getBaseSendingMsg() {
      _sendingKey++;
      var key = '_sending_' + _sendingKey;
      var obj = {
        status: 'sending',
        id: key,
        messageId: key,
        fromEntity: $rootScope.member.id,
        time: (new Date()).getTime(),
        message: {
          writerId: $rootScope.member.id
        }
      };
      return obj;
    }

    function _getSticker(sticker) {
      var obj = _getBaseSendingMsg();
      obj.message.content = {
        url: sticker.url
      };
      obj.message.contentType = 'sticker';

      return obj;
    }

    function _getText(msg) {
      var obj = _getBaseSendingMsg();
      obj.message.content = {
        body: msg
      };
      obj.message.contentType = 'text';
      return obj;
    }


  }
})();
