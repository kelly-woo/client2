/**
 * @fileoverview Sample Notification 생성하는 service
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('FileShareNotification', FileShareNotification);

  /* @ngInject */
  function FileShareNotification($filter, $state, DesktopNotificationUtil, DesktopNotification, memberService,
                                 UserList, EntityHandler) {
    var that = this;

    that.show = show;

    /**
     * show file share notification
     * @param {object} socketEvent
     * @param {object} roomEntity - 메세지가 작성된 방의 entity
     */
    function show(socketEvent, roomEntity) {
      var isUser = DesktopNotificationUtil.isChatType(socketEvent);
      var notificationData;
      var options;
      var user;

      if (!DesktopNotificationUtil.isAllowDMnMentionOnly() || isUser) {
        if (DesktopNotificationUtil.isAllowSendNotification()) {
          user = UserList.get(socketEvent.writer);
          options = {
            tag: 'tag',
            body: _getBody(socketEvent, roomEntity),
            icon: memberService.getProfileImage(user.id, 'small'),
            onClick: _onNotificationClicked,
            data: socketEvent
          };

          if (isUser) {
            if (notificationData = DesktopNotificationUtil.getData()) {
              options.sound = notificationData.soundDM;
            }
          }

          DesktopNotification.show(options);
        }
      }
    }

    /**
     * file share notification을 위한 내용이다.
     * @param socketEvent
     * @param {object} roomEntity - 메세지가 작성된 방의 entity
     * @returns {*}
     * @private
     */
    function _getBody(socketEvent, roomEntity) {
      var fileTitle = DesktopNotificationUtil.getFileTitleFormat(socketEvent.message);
      var writer = UserList.get(socketEvent.writer);
      var bodyMessage;

      if (DesktopNotificationUtil.isAllowShowContent(roomEntity.id)) {
        // content를 보여준다.
        bodyMessage = DesktopNotificationUtil.getSenderContentFormat(writer.name, fileTitle);
        //bodyMessage = writerName + ': ' + $filter('translate')('web-notification-body-file-share') + ': ' + _fileTitle;

        if (!DesktopNotificationUtil.isChatType(socketEvent)) {
          // 1:1 창이 아닐 경우 토픽이름을 추가한다.
          bodyMessage = DesktopNotificationUtil.getRoomFormat(EntityHandler.get(socketEvent.room.id).name) + bodyMessage;
        }
      } else {
        // content를 숨긴다.
        bodyMessage = $filter('translate')('@web-notification-file-share');
      }

      return bodyMessage;

    }

    /**
     * browser notification을 클릭했을 때 호출되는 함수이다.
     * @param socketEvent
     * @private
     */
    function _onNotificationClicked(socketEvent) {
      var _roomType = _getRoomTypeForRoute(socketEvent);
      var _fileId = socketEvent.file.id;
      var _roomToGo = _getRoomIdTogo(socketEvent);

      $state.go('messages.detail.files.redirect', {entityType: _roomType, itemId: _fileId,  entityId: _roomToGo});
    }

    /**
     * route에 사용되어질 entityId를 리턴한다.
     * @param {object} socketEvent - socket event paramter
     * @returns {*}
     * @private
     */
    function _getRoomIdTogo(socketEvent) {
      if (DesktopNotificationUtil.isChatType(socketEvent)) {
        return socketEvent.writer;
      }

      return socketEvent.room.id;
    }

    /**
     * route에 사용되어질 entityType을 리턴한다.
     * @param {object} socketEvent - socket event parameter
     * @returns {string}
     * @private
     */
    function _getRoomTypeForRoute(socketEvent) {
      if (DesktopNotificationUtil.isChatType(socketEvent)) {
        return 'users';
      }
      return socketEvent.room.type + 's';
    }
  }
})();
