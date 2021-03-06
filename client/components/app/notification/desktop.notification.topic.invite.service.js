/**
 * @fileoverview Topic Invite Notification 생성하는 service
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('TopicInviteNotification', TopicInviteNotification);

  /* @ngInject */
  function TopicInviteNotification($state, $filter, DesktopNotificationUtil, DesktopNotification, memberService,
                                   UserList, EntityHandler) {
    var that = this;

    that.show = show;

    /**
     * show topic invite notification
     * @param socketEvent
     */
    function show(socketEvent) {
      var options;
      var user;

      if (!DesktopNotificationUtil.isAllowDMnMentionOnly()) {
        if (DesktopNotificationUtil.isAllowSendNotification()) {
          user = UserList.get(socketEvent.writer);
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
      var room = EntityHandler.get(socketEvent.room.id);

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
  }
})();
