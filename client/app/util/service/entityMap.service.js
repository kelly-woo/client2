/**
 * @fileoverview 모든 entity들을 관리하는 map을 관리하는 service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('EntityMapManager', EntityMapManager);

  /* @ngInject */
  function EntityMapManager() {
    // 모든 엔티티(토픽/멤버)를 가지고 있는 맵, (id-entity) pair
    var _totalEntityMap = {};

    // join한 public topic (id-entity) pair
    var _joinedTopicMap = {};

    // join한 private topic (id-entity) pair
    var _privateTopicMap = {};

    // 모든 member (id-entity) pair
    var _memberMap = {};

    // 모든 member with entityId (entityId-entity) pair
    var _memberEntityIdMap = {};

    var maps = {
      'total': _totalEntityMap,
      'joined': _joinedTopicMap,
      'private': _privateTopicMap,
      'member': _memberMap,
      'memberEntityId': _memberEntityIdMap
    };

    this.add = add;
    this.get = get;
    this.reset = reset;

    /**
     * entity 를 mapType에 해당하 맵에 entity의 id(or entityId)를 이용해서 넣어준다.
     * @param {string} mapType - map의 키워드는
     * @param {object} entity - value로 들어갈 entity object
     */
    function add(mapType, entity) {
      var _key = mapType === 'memberEntityId' ? entity.entityId : entity.id;
      if (!!_key) {
        maps[mapType][_key] = entity;
      }
    }

    /**
     * 특정 map에서 key를 가져온다.
     * @param {string} mapType - maps에서 look-up할 mapType의 value
     * @param {number|string} key - 가져오고싶은 entity의 key value
     * @returns {object} entity - entity
     */
    function get(mapType, key) {
      key = parseInt(key, 10);
      return maps[mapType][key];
    }

    /**
     *  해당하는 map을 초기화한다.
     * @param {string} mapType - 초기화할 map의 키워
     */
    function reset(mapType) {
      maps[mapType] = {};
    }
  }
})();
