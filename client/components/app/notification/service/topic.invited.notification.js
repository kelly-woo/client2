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
                                    memberService, desktopNotificationHelper, $state) {
    this.addNotification = addNotification;

    /**
     * 노티피케이션 오브젝트를 만든다.
     * @param {object} socketEvent - socket event parameter
     */
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

    /**
     * 노티피케이션 내용을 작성해서 리턴한다.
     * 초대된 토픽의 이름이 항상 있다는 것은 보장을 못한다. topic_joined event에서 left를 업데이트하기 때문이다.
     * @param {object} socketEvent - socket event parameter
     * @returns {string}
     * @private
     */
    function _getBody(socketEvent) {
      var body = '';
      var writerName = $filter('getName')(socketEvent.writer);
      var room = entityAPIservice.getEntityById('total', socketEvent.room.id);

      if (socketEvent.room.type === 'channel') {
        if (!_.isUndefined(room)) {
          body = DesktopNotificationUtil.getRoomFormat(room.name) + ' ' + writerName + $filter('translate')('@web-notification-body-topic-invited');
        } else {
          body = writerName + $filter('translate')('@web-notification-body-topic-invited');
        }
      } else {
        body = writerName + $filter('translate')('@web-notification-body-private-topic-invited');
      }
      return body;
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
