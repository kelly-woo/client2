/**
 * @fileoverview 콜렉션 factory
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('Collection', Collection);

  /* @ngInject */
  function Collection(JndUtil) {

    /**
     * Collection 생성자
     * @param {Object} options
     *    @param {String} [options.key='id'] - key 값으로 사용할 field 명
     *    @param {Array} [options.list] - 생성과 동시에 설정할 콜렉션 list
     * @constructor
     */
    function CollectionClass(options) {
      var that = this;
      var _key = 'id';
      var _data = {
        list: [],
        map: {}
      };

      that.get = get;
      that.add = add;
      that.reset = reset;
      that.setList = setList;
      that.remove = remove;
      that.indexOf = indexOf;
      that.toJSON = toJSON;

      that.length = 0;

      _init(options);

      /**
       *
       * @param options
       * @private
       */
      function _init(options) {
        _reset();
        _initOptions(options);
      }

      /**
       * 인자로 받은 option 값에 대해 초기 세팅을 한다.
       * @param {Object} options
       *    @param {String} [options.key='id'] - key 값으로 사용할 field 명
       *    @param {Array} [options.list] - 생성과 동시에 설정할 콜렉션 list
       * @private
       */
      function _initOptions(options) {
        var list = JndUtil.pick(options, 'list');
        _key = JndUtil.pick(options, 'key') || _key;
        if (_.isArray(list)) {
          _.forEach(list, function(item) {
            add(item);
          });
        }
      }

      /**
       * id 값으로 데이터를 조회한다.
       * @param {number|string} id
       * @returns {*}
       */
      function get(id) {
        return _data.map[id];
      }

      /**
       * collection 에 item 을 추가한다.
       * @param {object} item
       */
      function add(item) {
        var id = JndUtil.pick(item, _key);
        if (!_.isUndefined(id)) {
          if (!_.isUndefined(get(id))) {
            update(item)
          } else {
            _data.list.push(item);
            _data.map[id] = item;
            that.length = _data.list.length;
          }
        } else {
          throw new Error('Collection.add(item) - item is invalid');
        }
      }

      /**
       * item 을 update 한다.
       * @param {object} item
       * @returns {boolean} update 성공/실패 여부
       */
      function update(item) {
        if (_data.map[item.id]) {
          _data.map[item.id] = item;
          return true;
        } else {
          return false;
        }
      }

      /**
       * 콜렉션을 초기화 하고 인자로 받은 list 로 재 구성 한다.
       * @param {Array} list
       */
      function setList(list) {
        reset();
        _.forEach(list, function(item) {
          add(item);
        });
      }

      /**
       * 인자로 item 을 받아 해당 item 이 콜렉션의 몇 번째 인덱스에 존재하는지 반환한다.
       * @param {object} targetItem
       * @returns {number}
       */
      function indexOf(targetItem) {
        var index = -1;
        _.forEach(_data.list, function(item, i) {
          if (item === targetItem) {
            index = i;
            return false;
          }
        });
        return index;
      }

      /**
       * 콜렉션의 length 를 0 으로 초기화 한다.
       */
      function reset() {
        _data.list.splice(0, that.length);
        _data.map = {};
        that.length = 0;
      }

      /**
       * id 에 해당하는 데이터를 제거한다.
       * @param {number|string} id
       * @returns {boolean} - 삭제 성공/실패 여부
       */
      function remove(id) {
        var index;
        var item;
        var result = false;

        if (!_.isUndefined(id)) {
          item = _data.map[id];
          if (item) {
            index = indexOf(item);
            _data.list.splice(index, 1);
            delete _data.map[id];
            that.length = _data.list.length;
            result = true;
          }
        }
        return result;
      }

      /**
       * 콜렉션의 결과 값을 반환한다.
       * @returns {Array}
       */
      function toJSON() {
        return _data.list;
      }

      /**
       * 모든 설정 정보를 초기화 한다.
       * @private
       */
      function _reset() {
        _key = 'id';
        reset();
      }
    }


    return CollectionClass;
  }
})();
