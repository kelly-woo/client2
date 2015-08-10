/**
 * web_app에서 socket으로 일어나는 update들을 관리하기 위한 중앙 service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('NotificationManager', NotificationManager);

  /* @ngInject */
  function NotificationManager(currentSessionHelper, jndPubSub) {
    var _notificationMap;
    var _notificationAfterFocusMap;

    this.set = set;

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
      _notificationMap = {};
      _notificationAfterFocusMap = {};
    }

    /**
     * _notificationCount에 value만큼 더한다.
     * @param {number} value - 더하고 싶은 양
     */
    function set(entity, value) {
      _addToMap('withFocus', entity, value);

      if (currentSessionHelper.isBrowserHidden()) {
        _addToMap('afterFocus', entity, value);
        jndPubSub.pub('addAsteriskToTitle');
      }

    }

    /**
     * focus를 다시 찾았을 경우, _notificationCountAfterFcous를 0으로 만들어준다.
     */
    function resetNotificationCountOnFocus() {
      _notificationAfterFocusMap = {};
      // update title
      jndPubSub.pub('updateWindowTitle');
    }

    /**
     * _notificationCount가 있는지 없는지 확인한다.
     * @returns {boolean}
     */
    function hasNotification() {
      console.log(_getCount('withFocus') > 0)
      return _getCount('withFocus') > 0;
    }

    /**
     * focus를 잃은 후 들어온 노티피케이션이 있는지 없는지 확인한다.
     * @returns {boolean}
     */
    function hasNotificationAfterFocus() {
      return _getCount('afterFocus') > 0;
    }
    /**
     * 포커스가 있는 상태에서 들어온 노티피케이션(뱃지)의 숫자를 리턴한다.
     * @returns {*}
     */
    function getTotalNotificationCount() {
      return _getCount('withFocus');
    }

    /**
     * 포커스를 잃은 후부터 들어온 노티피케이션(뱃지)의 숫자를 리턴한다.
     * @returns {*}
     */
    function getTotalNotificationCountAfterFocus() {
      return _getCount('afterFocus');
    }

    /**
     * 노티피케이션 숫자를 리턴한다.
     * @param {string} type - 포커스를 잃은 후부터 체크할지 아니면 전체를 체크할지 알려주는 flag
     * @returns {number}
     * @private
     */
    function _getCount(type) {
      var _totalCount = 0;
      _.each(_getMap(type), function(notification) {
        _totalCount += notification;
      });

      console.log('::total count ', _totalCount);

      return _totalCount;
    }

    /**
     * 맵을 리턴한다.
     * @param {string} type - 선택하고싶은 맵의 타입
     * @returns {*}
     * @private
     */
    function _getMap(type) {
      if (type === 'withFocus') {
        return _notificationMap;
      } else if (type === 'afterFocus') {
        return _notificationAfterFocusMap;
      }
    }

    /**
     * 알맞는 타입의 맵에 뱃지카운트 정보를 추가한다.
     * @param {string} type - 맵의 타입
     * @param {object} entity - 뱃지의 주인 엔티티
     * @param {number} value - 뱃지의 숫자
     * @private
     */
    function _addToMap(type, entity, value) {
      var _map = _getMap(type);
      value = parseInt(value, 10);

      console.log('::', value)

      if (value === -1) {
        // 뱃지의 숫자가 -1 일 경우는 +1하라는 소리. 죄송. 제가 처음에 이따위로 만들었어요. -JiHoon
        _map[entity.id] = !!_map[entity.id] ? _map[entity.id]++ : 0;
      } else if (value === 0) {
        // 0일경우에는 그냥 삭제
        delete _map[entity.id];
      } else {
        _map[entity.id] = value;
      }

    }
  }
})();
