/**
 * @fileoverview message controller에서 사용가능하도록 message data convert
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RightMessage', RightMessage);

  /* @ngInject */
  function RightMessage() {
    var that = this;

    that.convert = convert;

    function convert(type, messageData) {
      var data = {};

      if (type === 'message') {
        data.type = type;

        data.roomId = messageData.id;
        data.roomType = messageData.extContentType;

        data.writerId = messageData.memberId;
        data.contentType = messageData.type;
        data.contentTitle = messageData.name;
        data.contentBody = messageData.type.indexOf('sticker') > -1 ? '(sticker)' : messageData.text;

        data.feedbackId = null;
        data.feedbackTitle = messageData.file ? messageData.file.title : '';
        data.linkId = messageData.linkId;

        data.id = messageData.messageId;
        data.preventRedirect = true;

        data.hasStar = messageData.hasStar;
        data.isStarred = messageData.isStarred;

        data.isSimple = true;
      } else if (type === 'mention' || type === 'star') {
        data.type = type;

        if (messageData.room) {
          data.roomId = messageData.room.id;
          data.roomType = messageData.room.type;
          data.roomName = messageData.room.name;
        }

        data.writerId = messageData.message.writerId;
        data.createdAt = messageData.message.createdAt;
        data.mentions = messageData.message.mentions;
        data.contentType = messageData.message.contentType;
        data.contentTitle = messageData.message.content.title;
        data.contentBody = messageData.message.content.body;

        data.feedbackId = messageData.message.feedbackId;
        data.feedbackTitle = messageData.message.feedbackTitle;
        data.linkId = messageData.linkId;

        data.id = messageData.message.id;
        if (type === 'star') {
          data.hasStar = true;
          data.isStarred = true;
        }
      }

      return data;
    }
  }
})();
