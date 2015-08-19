/**
 * NotificationManager를 도와주는 helper 서비스이다.
 */
(function() {
'use strict';

  angular
    .module('jandiApp')
    .service('NotificationHelper', NotificationHelper);

  /* @ngInject */
  function NotificationHelper(logger) {
    var _notificationMap;
    var _notificationAfterFocusMap;

    this.init = init;
    this.add = add;
    this.remove = remove;
    this.getCount = getCount;
    this.resetNotificationAfterFocusMap = resetNotificationAfterFocusMap;

    var _typeMap;

    function init() {
      _notificationMap = {};
      _notificationAfterFocusMap = {};

      _typeMap = {
        total : _notificationMap,
        focus: _notificationAfterFocusMap
      };
    }

    /**
     * map 에 entity의 id를 key로 value를 value로 하는 pair를 추가한다.
     * @param {string} mapType - map의 type
     * @param {object} entity - 추가하고싶은 엔티티
     * @param {number} value - value to add
     */
    function add(mapType, entity, value) {
      value = parseInt(value, 10);
      var map = _getMap(mapType);

      if (value === 0) {
        remove(entity.id);
      } else if (value === -1) {
        _increment(map, entity);
      } else {
        map[entity.id] = value;
      }
    }

    /**
     * 해당하는 맵을 리턴한다.
     * @param {string} mapType - 선택하려는 맵의 종류
     * @returns {*}
     * @private
     */
    function _getMap(mapType) {
      return _typeMap[mapType];
    }

    /**
     * 맵으로부터 entity에 해당하는 정보를 지운다.
     * @param {object} entity - 지우려고하는 엔티티
     * @private
     */
    function remove(id) {
      delete _notificationAfterFocusMap[id];
      delete _notificationMap[id];
    }

    /**
     * 맵에 있는 entity를 찾아 value를 1 혹은 +1시킨다.
     * @param {object} map - 해당하는 맵
     * @param {object} entity - 증가시키고 싶은 엔티티
     * @private
     */
    function _increment(map, entity) {
      map[entity.id] = map[entity.id] ? map[entity.id]++ : 1;
    }

    /**
     * 해당하는 맵을 쭈욱 돈 후 각각의 value들의 총합을 리턴한다.
     * @param {string} type - type of a map to iterate
     * @returns {number}
     */
    function getCount(type) {
      var map = _getMap(type);
      var totalCount = 0 ;

      _.each(map, function(notification) {
        totalCount += notification;
      });

      return totalCount;
    }

    function resetNotificationAfterFocusMap() {
      _notificationAfterFocusMap = {};
      _typeMap['focus'] = _notificationAfterFocusMap;
    }

  }
})();
