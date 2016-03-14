/**
 * @fileoverview Topic Room List Model
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RoomTopicList', RoomTopicList);

  /* @ngInject */
  function RoomTopicList(Collection) {

    var _collectionMap = {};

    this.setList = setList;
    this.add = add;
    this.remove = remove;
    this.reset = reset;
    this.get = get;
    this.toJSON= toJSON;

    this.isPrivate = isPrivate;
    this.isPublic = isPublic;

    _init();

    /**
     * id 에 해당하는 room 이 비공개인지 여부를 반환한다.
     * @param {number|string} id
     * @returns {boolean}
     */
    function isPrivate(id) {
      var topic = get(id);
      //@fixme: indexOf 대신 일치 연산자로 문자열 비교 필요
      return !!(topic && topic.type.indexOf('private') !== -1);
    }

    /**
     * id 에 해당하는 room 이 공개인지 여부를 반환한다.
     * @param {number|string} id
     * @returns {boolean}
     */
    function isPublic(id) {
      var topic = get(id);
      //@fixme: indexOf 대신 일치 연산자로 문자열 비교 필요
      return !!(topic && topic.type.indexOf('channel') !== -1);
    }
    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
      _collectionMap.join = new Collection({
        key: 'id'
      });
      _collectionMap.unjoin = new Collection({
        key: 'id'
      });
    }

    /**
     * collection 을 설정한다.
     * @param {Array} list - 설정할
     * @param {boolean} [isJoin=false] - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부
     */
    function setList(list, isJoin)  {
      var collection = _getCollection(isJoin);
      collection.setList(list);
    }

    /**
     * 인자 값에 해당하는 collection 을 반환한다.
     * @param {Boolean} [isJoin=false] - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부
     * @returns {*}
     * @private
     */
    function _getCollection(isJoin) {
      return isJoin ? _collectionMap.join : _collectionMap.unjoin;
    }

    /**
     * item 을 collection 에 추가한다.
     * @param {object} item
     * @param {Boolean} [isJoin=false] - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부
     */
    function add(item, isJoin) {
      var collection = _getCollection(isJoin);
      collection.add(item);
    }

    /**
     * collection 값을 초기화 한다.
     */
    function reset() {
      _collectionMap.join.reset();
      _collectionMap.unjoin.reset();
    }

    /**
     * id 에 해당하는 데이터를 반환한다.
     * @param {number|string} id
     * @param {boolean} [isJoin] - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부. 설정하지 않을 시 전체 리스트를 대상으로 한다.
     * @returns {*}
     */
    function get(id, isJoin) {
      var list;
      if (_.isBoolean(isJoin)) {
        list = _getCollection(isJoin).get(id);
      } else {
        list = _collectionMap.join.get(id) || _collectionMap.unjoin.get(id);
      }
      return list;
    }

    /**
     * id 에 해당하는 데이터를 제거한다.
     * @param {number|string} id
     * @returns {*}
     */
    function remove(id) {
      return _collectionMap.join.remove(id) || _collectionMap.unjoin.remove(id);
    }

    /**
     * 콜렉션을 데이터를 배열 형태로 반환한다.
     * @param {Boolean} isJoin - 대상 콜렉션이 사용자가 join 한 방에 대한 콜렉션인지 여부. 설정하지 않을 시 전체 리스트를 반환한다.
     * @returns {Array}
     */
    function toJSON(isJoin) {
      var list;
      if (_.isBoolean(isJoin)) {
        list = _getCollection(isJoin).toJSON();
      } else {
        list = _collectionMap.join.toJSON().concat(_collectionMap.unjoin.toJSON());
      }
      return list;
    }
  }
})();
