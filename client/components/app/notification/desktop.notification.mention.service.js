/**
 * @fileoverview Mention Notification 생성하는 service
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('MentionNotification', MentionNotification);

  /* @ngInject */
  function MentionNotification(memberService, DesktopNotificationUtil, DesktopNotification) {
    var that = this;

    that.show = show;

    /**
     * show mention notification
     * @param {object} socketEvent
     * @param {object} writerEntity
     * @param {object} roomEntity
     */
    function show(socketEvent, writerEntity, roomEntity) {
      var notificationData;
      var options = {};
      var message;
      var isUser = roomEntity.type === 'users';

      if (DesktopNotificationUtil.validateNotificationParams(socketEvent, writerEntity, roomEntity)) {
        options.icon = memberService.getProfileImage(writerEntity.id, 'small');
        message = decodeURIComponent(socketEvent.message);

        if (DesktopNotificationUtil.isAllowShowContent(roomEntity.id)) {
          options.body = _getBodyForMentionWithMessage(writerEntity, roomEntity, message);
        } else {
          options.body = DesktopNotificationUtil.getBodyWithoutMessage(isUser, writerEntity, roomEntity);
        }

        options.tag = isUser ? writerEntity.id : roomEntity.id;
        options.data = _.extend(socketEvent, {
          id: roomEntity.id,
          type: roomEntity.type
        });

        if (notificationData = DesktopNotificationUtil.getData()) {
          options.sound = notificationData.soundMention;
        }

        DesktopNotification.show(options);
      }
    }

    /**
     * mention 의 notification을 위한 내용이다.
     * @param {object} writerEntity - 나를 멘션한 사람
     * @param {object} roomEntity - 나를 멘션한 곳
     * @param {string} message - 멘션이 포함된 메세지
     * @returns {string}
     * @private
     */
    function _getBodyForMentionWithMessage(writerEntity, roomEntity, message) {
      var myName = memberService.getMember().name;
      return '@' + myName + ' [' + roomEntity.name + '] ' + writerEntity.name + ': ' + message;
    }
  }
})();
