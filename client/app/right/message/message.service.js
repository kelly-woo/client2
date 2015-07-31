/**
 * @fileoverview message controller에서 사용가능하도록 message data convert
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MessageData', MessageData);

  /* @ngInject */
  function MessageData() {
    var that = this;

    that.convert = convert;

    function convert(type, messageData) {
      var data = {};

      if (type === 'message') {
        data.roomId = messageData.id;
        data.roomType = messageData.extContentType;
        data.roomName = messageData.name;

        data.writerId = messageData.memberId;
        data.createdAt = messageData.time;
        data.contentType = messageData.file != null ? 'comment' : 'text' ;
        data.contentTitle = messageData.name;
        data.contentBody = messageData.type.indexOf('sticker') > -1 ? '(sticker)' : messageData.text;

        data.feedbackId = null;
        data.feedbackTitle = messageData.file ? messageData.file.title : '';
        data.linkId = messageData.linkId;

        data.id = messageData.messageId;
        data.preventRedirect = true;

        data.hasStar = messageData.hasStar;
        data.isStarred = messageData.isStarred;
      } else if (type === 'mention' || type === 'star') {
        data.roomId = messageData.room.id;
        data.roomType = messageData.room.type;
        data.roomName = messageData.room.name;

        data.writerId = messageData.message.writerId;
        data.createdAt = messageData.message.createdAt;
        data.mentions = messageData.message.mentions;
        data.contentType = messageData.message.contentType;
        data.contentTitle = messageData.message.contentTitle;
        data.contentBody = messageData.message.contentBody;

        data.feedbackId = messageData.message.feedbackId;
        data.feedbackTitle = messageData.message.feedbackTitle;
        data.linkId = messageData.linkId;

        if (type === 'star') {
          data.hasStar = true;
          data.isStarred = true;
        }
      }

      return data;
    }
  }
})();
