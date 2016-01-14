/**
 * Created by jihoonkim on 8. 25.2015.
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('FileShareDesktopNotification', FileShareDesktopNotification);

  /* @ngInject */
  function FileShareDesktopNotification(DesktopNotification, desktopNotificationHelper, memberService,
                                        entityAPIservice, $filter, $state, DesktopNotificationUtil) {
    this.addNotification = addNotification;

    function addNotification(socketEvent) {
      var notification;
      var options;
      var user;

      if (DesktopNotification.canSendNotification()) {
        user = entityAPIservice.getEntityById('users', socketEvent.writer);
        options = {
          tag: 'tag',
          body: _getBody(socketEvent),
          icon: memberService.getProfileImage(user.id, 'small'),
          callback: _onNotificationClicked,
          data: socketEvent
        };

        (notification = _createInstance(options)) && notification.show();
      }
    }

    function _getBody(socketEvent) {
      var _fileTitle = DesktopNotificationUtil.getFileTitleFormat(socketEvent.message);
      var _writer = entityAPIservice.getEntityById('users', socketEvent.writer);
      var _writerName = _writer.name;
      var _bodyMessage;

      if (DesktopNotification.getShowNotificationContentFlag()) {
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
      var _roomType = DesktopNotificationUtil.getRoomTypeForRoute(socketEvent);
      var _fileId = socketEvent.file.id;
      var _roomToGo = DesktopNotificationUtil.getRoomIdTogo(socketEvent);

      $state.go('messages.detail.files.redirect', {entityType: _roomType, itemId: _fileId,  entityId: _roomToGo});
    }

    /**
     * Notification object 생성
     *
     * @param {object} options - object options
     */
    function _createInstance(options) {
      return Object.create(desktopNotificationHelper.WebNotification).init(options);
    }
  }
})();
