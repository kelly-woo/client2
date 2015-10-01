/**
 * @fileoverview topic 에 invite되었을 때 날려주는 노티피케이션을 만든다.
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('TopicInvitedNotification', TopicInvitedNotification);

  /* @ngInject */
  function TopicInvitedNotification(DesktopNotification, $filter, entityAPIservice, DesktopNotificationUtil,
                                    memberService, accountService, desktopNotificationHelper, $state) {
    this.addNotification = addNotification;

    /**
     * 노티피케이션 오브젝트를 만든다.
     * @param {object} socketEvent - socket event parameter
     */
    function addNotification(socketEvent) {
      var notification;
      var options;

      if (DesktopNotification.canSendNotification()) {
        options = {
          tag: 'tag',
          body: _getBody(socketEvent),
          icon: $filter('getSmallThumbnail')(entityAPIservice.getEntityById('users', socketEvent.writer)),
          callback: _onNotificationClicked,
          data: socketEvent
        };
      }

      (notification = _createInstance(options)) && notification.show();

    }

    function _getBody(socketEvent) {
      var currentLanguage = accountService.getAccountLanguage();
      var body = '';
      var writerName = $filter('getName')(socketEvent.writer);
      var myName = $filter('getName')(memberService.getMember());
      var room =  entityAPIservice.getEntityById('total', socketEvent.room.id);
      var roomName;

      if (!_.isUndefined(room)) {
        roomName = DesktopNotificationUtil.getRoomFormat(room.name);
      }

      switch (currentLanguage) {
        case 'ko':
          body = writerName + $filter('translate')('@web-notification-body-topic-invited-mid') +
          myName + $filter('translate')('@web-notification-body-topic-invited-post');
          break;
        default:
          body =  writerName + $filter('translate')('@web-notification-body-topic-invited-post');
          break;
      }

      return roomName + ' ' + body;
    }

    /**
     * 노티피케이션이 클릭되면 불려진다.
     * @param {object} socketEvent - socket event parameter
     * @private
     */
    function _onNotificationClicked(socketEvent) {
      var roomId = socketEvent.room.id;
      var roomType = socketEvent.room.type;

      $state.go('archives', {entityType: roomType, entityId: roomId});

    }
    /**
     * Notification object 생성
     * @param {object} options - object options
     */
    function _createInstance(options) {
      return Object.create(desktopNotificationHelper.WebNotification).init(options);
    }
  }
})();
