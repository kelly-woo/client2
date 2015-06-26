/**
 * @fileoverview Sending Status Message 서비스
 */

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
    this.enqueue = enqueue;
    this.splice = splice;
    this.reset = reset;
    this.isSending = isSending;
    this.remove = remove;

    /**
     * sending queue 를 리셋한다.
     */
    function reset() {
      _sendingKey = 0;
      that.queue = [];
      that.queueMap = {};
    }

    /**
     * queue 에서 msg 를 제거한다.
     * @param {object} msg
     */
    function remove(msg) {
      var index = -1;
      var queue = that.queue;
      var contentType = msg.message.contentType;
      var queueItem = msg._queueItem;
      if (msg.status === 'sending') {
        _.forEach(queue, function(item, i) {
          if (item === queueItem) {
            index = i;
            return false;
          }
        });
        if (index !== -1) {
          if (contentType === 'sticker') {
            queue[index].sticker = null;
          } else if (contentType === 'text') {
            queue[index].content = null;
          }
          if (!queue[index].sticker && !queue[index].content) {
            splice(index, 1);
          }
        }
      }
    }

    /**
     * enqueue 한다.
     * @param {string} content
     * @param {object} sticker
     * @returns {Array}
     */
    function enqueue(content, sticker) {
      var messageList = [];
      var queueItem = {
        content: content,
        sticker: _.clone(sticker)
      };
      that.queue.push(queueItem);

      if (sticker) {
        messageList.push(_getSticker(queueItem));
      }
      if (content) {
        messageList.push(_getText(queueItem));
      }

      return messageList;
    }

    /**
     * queue 에서 splice 한다.
     * @param {number} startIdx
     * @param {number} length
     */
    function splice(startIdx, length) {
      that.queue.splice(startIdx, length);
    }

    /**
     * 현재 전송중 여부를 확인한다.
     * @param msg
     * @returns {boolean}
     */
    function isSending(msg) {
      return msg.status === 'sending';
    }

    /**
     * sending status message 의 기본 골격을 생성한다.
     * @param {object} queueItem
     * @returns {{_queueItem: *, status: string, id: string, messageId: string, fromEntity: *, time: number, message: {writerId: *}}}
     * @private
     */
    function _getBaseSendingMsg(queueItem) {
      _sendingKey++;
      var key = '_sending_' + _sendingKey;
      var obj = {
        _queueItem: queueItem,
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

    /**
     * status sending 인 sticker 메세지를 반환한다.
     * @param {object} queueItem
     * @returns {{_queueItem: *, status: string, id: string, messageId: string, fromEntity: *, time: number, message: {writerId: *}}}
     * @private
     */
    function _getSticker(queueItem) {
      var obj = _getBaseSendingMsg(queueItem);
      obj.message.content = {
        url: data.sticker.url
      };
      obj.message.contentType = 'sticker';

      return obj;
    }

    /**
     * status sending 인 text 메세지 object 를 반환한다.
     * @param {object} queueItem
     * @returns {{_queueItem: *, status: string, id: string, messageId: string, fromEntity: *, time: number, message: {writerId: *}}}
     * @private
     */
    function _getText(queueItem) {
      var obj = _getBaseSendingMsg(queueItem);
      obj.message.content = {
        body: data.content
      };
      obj.message.contentType = 'text';
      return obj;
    }
  }
})();
