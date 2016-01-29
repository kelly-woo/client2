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
                                 entityAPIservice) {
    var that = this;

    that.show = show;

    /**
     * show file share notification
     * @param {object} socketEvent
     */
    function show(socketEvent) {
      var options;
      var user;

      if (DesktopNotificationUtil.canSendNotification()) {
        user = entityAPIservice.getEntityById('users', socketEvent.writer);
        options = {
          tag: 'tag',
          body: _getBody(socketEvent),
          icon: memberService.getProfileImage(user.id, 'small'),
          onClick: _onNotificationClicked,
          data: socketEvent
        };

        DesktopNotification.show(options);
      }
    }

    /**
     * file share notification을 위한 내용이다.
     * @param socketEvent
     * @returns {*}
     * @private
     */
    function _getBody(socketEvent) {
      var _fileTitle = DesktopNotificationUtil.getFileTitleFormat(socketEvent.message);
      var _writer = entityAPIservice.getEntityById('users', socketEvent.writer);
      var _writerName = _writer.name;
      var _bodyMessage;

      if (DesktopNotificationUtil.getShowNotificationContentFlag()) {
        // content를 보여준다.
        _bodyMessage = DesktopNotificationUtil.getSenderContentFormat(_writerName, _fileTitle);
        //_bodyMessage = _writerName + ': ' + $filter('translate')('web-notification-body-file-share') + ': ' + _fileTitle;

        if (!DesktopNotificationUtil.isChatType(socketEvent)) {
          // 1:1 창이 아닐 경우 토픽이름을 추가한다.
          _bodyMessage = DesktopNotificationUtil.getRoomFormat(entityAPIservice.getEntityById('total', socketEvent.room.id).name) + _bodyMessage;
        }
      } else {
        // content를 숨긴다.
        _bodyMessage = $filter('translate')('@web-notification-file-share');
      }

      return _bodyMessage;

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
