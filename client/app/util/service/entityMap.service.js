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
    // 엔티티(토픽/멤버)를 가지고 있는 맵. 단, memberEntityId는 제외함, (id-entity) pair
    var _totalEntityMap = {};

    // join한 public topic (id-entity) pair
    var _joinedTopicMap = {};

    // unjoin한 public topic (id-entity) pair
    var _unjoinedTopicMap = {};

    // join한 private topic (id-entity) pair
    var _privateTopicMap = {};

    // 모든 member(user + bot) (id-entity) pair
    var _memberMap = {};

    // 모든 user (id-entity) pair
    var _userMap = {};

    // 모든 bot (id-entity) pair
    var _botMap = {};

    // 모든 member with entityId (entityId-entity) pair
    var _memberEntityIdMap = {};

    var maps = {
      'total': _totalEntityMap,
      'joined': _joinedTopicMap,
      'unjoined': _unjoinedTopicMap,
      'private': _privateTopicMap,
      'member': _memberMap,
      'user': _userMap,
      'bot': _botMap,
      'memberEntityId': _memberEntityIdMap
    };

    this.add = add;
    this.set = set;

    this.get = get;
    this.getMap = getMap;
    this.contains = contains;
    this.reset = reset;
    this.resetAll = resetAll;
    this.create = create;
    this.toArray = toArray;

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
     * key 와 value를 사용해서 mapType에 넣어준다.
     * @param {string} mapType - 사용하고 싶은 맵의 타입
     * @param {*} key - key로 사용되어질 값
     * @param {&} value - value로 사용되어질 값
     */
    function set(mapType, key, value) {
      maps[mapType][key] = value;
    }

    /**
     * 특정 map에서 key를 가져온다.
     * @param {string} mapType - maps에서 look-up할 mapType의 value
     * @param {number|string} key - 가져오고싶은 entity의 key value
     * @returns {object} entity - entity
     */
    function get(mapType, key) {
      key = parseInt(key, 10);
      return !!maps[mapType] && maps[mapType][key];
    }

    /**
     * mapType 에 해당하는 entityMap 를 반환한다
     * @param mapType
     * @returns {*}
     */
    function getMap(mapType) {
      return maps[mapType];
    }

    /**
     * 특정 map이 key를 가지고 있는지 안가지고 있는지만 확인한다.
     * @param {string} mapType - 특정맵을 지칭하는
     * @param key
     * @returns {boolean|*}
     */
    function contains(mapType, key) {
      key = parseInt(key, 10);
      return !!maps[mapType] && maps[mapType].hasOwnProperty(key);
    }
    /**
     *  해당하는 map을 초기화한다.
     * @param {string} mapType - 초기화할 map의 키워
     */
    function reset(mapType) {
      maps[mapType] = {};
    }

    /**
     * 모든 map을 초기화한다.
     */
    function resetAll() {
      var e;
      for (e in maps) {
        maps.hasOwnProperty(e) && (maps[e] = {});
      }
    }

    function create(type) {
      maps[type] = {};
      return maps[type];
    }

    /**
     * 특정 entity map의 object를 array로 변환하여 전달한다.
     * @param mapType
     * @returns {Array}
     */
    function toArray(mapType) {
      return _.values(maps[mapType]);
    }
  }
})();
