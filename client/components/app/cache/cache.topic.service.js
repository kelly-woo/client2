/**
 * @fileoverview topic에 대해서 cache 해야할 것들이 있다면 다 여기 들어간다.
 */
(function() {
  'use strict';

  angular
    .module('app.cache')
    .service('TopicMessageCache', TopicMessageCache);

  /* @ngInject */
  function TopicMessageCache() {
    var MAX_CACHE_ITEM_NUMBER = 15;

    var topicCacheMap;

    this.init = init;

    this.get = get;
    this.getValue = getValue;

    this.put = put;
    this.addValue = addValue;

    this.remove = remove;
    this.contains = contains;

    /**
     * 초기화.
     */
    function init() {
      topicCacheMap = {};
    }

    /**
     * topicCacheMap[key] 를 리턴한다.
     * @param {string} key
     * @returns {*}
     */
    function get(key) {
      return topicCacheMap[key];
    }

    /**
     *  topicCachMap[key]의 object 중에서 name 을 리턴한다.
     * @param {string} key - topicCacheMap에서 찾을 키(entity의 id)
     * @param {string|number} name - topicCacheMap내부 object 의 field중 하나
     * @returns {*}
     */
    function getValue(key, name) {
      return topicCacheMap[key][name];
    }
    /**
     * topicCacheMap 에 key-value pair를 저정한다.
     * @param {string} key - string to be used as a key, id of a topic
     * @param {object} value
     *    @param {array} list - message list
     *    @param {number} globalLastLinkId - global last link id
     *    @param {number} lastMessageId - lastMessageId equivalent.
     */
    function put(key, value) {
      if (_.size(topicCacheMap) >= MAX_CACHE_ITEM_NUMBER) {
        _extractOldValue();
      }

      value = _getDefaultValue(key, value);

      topicCacheMap[key] = value;
    }

    /**
     * topicCacheMap이 이미 topicCacheMap[key] 를 가지고 있다면 같은 object에 name-value pair 추가한다.
     * 만약 안가지고 있다면 새로 생성해서 topicCacheMap에 추가한다.
     * @param {string} key - key to look for in topicCacheMap
     * @param {string|number} name - new field to be added to topicCachMap[key]
     * @param {*} value - new value to new name in topicCacheMap[key], allow 'undefined' value
     */
    function addValue(key, name, value) {
      var _tempDefaultValue;

      if (contains(key)) {
        _tempDefaultValue = get(key);
      } else {
        _tempDefaultValue = _getDefaultValue(key);
      }

      _tempDefaultValue[name] = value;

      put(key, _tempDefaultValue);
    }

    /**
     * map에서 key에 해당하는 value를 지운다.
     * @param {string} key - key to remove
     */
    function remove(key) {
      delete topicCacheMap[key];
    }

    /**
     * topicCacheMap 에 key에 해당하는 value가 있는지 없는지 확인한다.
     * @param {string} key - key to look up
     * @returns {boolean}
     */
    function contains(key) {
      return !!topicCacheMap[key];
    }

    /**
     * topicCacheMap에서 가장 먼저 add 된 item을 뺀다.
     * @private
     */
    function _extractOldValue() {
      remove(_.sortByOrder(topicCacheMap, 'timeStamp')[0].key);
    }

    /**
     * topicCacheMap 에 들어갈 object들은 무조건 기본적으로 가지고 있어야할 field들을 설정한다.
     * @param {string} key - mostly id of a topic
     * @param {object} value - value to be added with default fields
     * @returns {object} value - new value with default fields
     * @private
     */
    function _getDefaultValue(key, value) {
      if (_.isUndefined(value)) {
        value = {};
      }

      value.timeStamp = _.now();
      value.key = key;
      return value;
    }

  }
})();
