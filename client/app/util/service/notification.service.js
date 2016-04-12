/**
 * web_app에서 socket으로 일어나는 update들을 관리하기 위한 중앙 service
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('NotificationManager', NotificationManager);

  /* @ngInject */
  function NotificationManager(currentSessionHelper, jndPubSub, NotificationHelper, UnreadBadge) {
    var _notificationMap;
    var _notificationAfterFocusMap;

    this.set = set;
    this.remove = remove;

    this.getTotalNotificationCount = getTotalNotificationCount;
    this.getTotalNotificationCountAfterFocus = getTotalNotificationCountAfterFocus;

    this.resetNotificationCountOnFocus =resetNotificationCountOnFocus;

    this.hasNotification = hasNotification;
    this.hasNotificationAfterFocus = hasNotificationAfterFocus;

    _init();

    /**
     * local variable들을 초기화한다.
     * @private
     */
    function _init() {
      NotificationHelper.init();

      _notificationMap = {};
      _notificationAfterFocusMap = {};
    }

    /**
     * _notificationCount에 value만큼 더한다.
     * @param {number} value - 더하고 싶은 양
     */
    function set(entity, value) {
      NotificationHelper.add('total', entity, value);

      if (currentSessionHelper.isBrowserHidden()) {
        NotificationHelper.add('focus', entity, value);
      }

      jndPubSub.pub('updateWindowTitle');
    }

    /**
     * _notificationMap 과 _notificationAfterFocusMap에서 해당 entity를 삭제한다.
     * @param {object} entity - 삭제하려는 엔티티
     */
    function remove(entity) {
      var id = entity;

      if (_.isObject(entity)) {
        id = entity.id
      }

      NotificationHelper.remove(id);

      // update title
      jndPubSub.pub('updateWindowTitle');
    }

    /**
     * focus를 다시 찾았을 경우, _notificationCountAfterFcous를 0으로 만들어준다.
     */
    function resetNotificationCountOnFocus() {
      NotificationHelper.resetNotificationAfterFocusMap();

      // update title
      jndPubSub.pub('updateWindowTitle');
    }

    /**
     * 노티피케이션이 있는지 없는지 확인한다.
     * @returns {boolean}
     */
    function hasNotification() {
      return UnreadBadge.getTotalCount() > 0;
    }

    /**
     * focus를 잃은 후 들어온 노티피케이션이 있는지 없는지 확인한다.
     * @returns {boolean}
     */
    function hasNotificationAfterFocus() {
      return NotificationHelper.getCount('focus') > 0;
    }

    /**
     * 전체 노티피케이션(뱃지)의 숫자를 리턴한다.
     * @returns {*}
     */
    function getTotalNotificationCount() {
      return UnreadBadge.getTotalCount();
    }

    /**
     * 포커스를 잃은 후부터 들어온 노티피케이션(뱃지)의 숫자를 리턴한다.
     * @returns {*}
     */
    function getTotalNotificationCountAfterFocus() {
      return NotificationHelper.getCount('focus');
    }
  }
})();
