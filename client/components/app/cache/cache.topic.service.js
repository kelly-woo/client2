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
    var MAX_CACHE_ITEM_NUMBER = 3;

    var topicCacheMap;

    this.init = init;

    this.get = get;
    this.add = add;
    this.remove = remove;
    this.has = has;

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
     * topicCacheMap 에 key-value pair를 저정한다.
     * @param {string} key - string to be used as a key, id of a topic
     * @param {object} value
     *    @param {array} list - message list
     *    @param {number} globalLastLinkId - global last link id
     *    @param {number} lastMessageId - lastMessageId equivalent.
     */
    function add(key, value) {
      if (_.size(topicCacheMap) >= MAX_CACHE_ITEM_NUMBER) {
        _extractOldValue();
      }

      value.timeStamp = _.now();
      value.key = key;

      topicCacheMap[key] = value;
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
    function has(key) {
      return !!topicCacheMap[key];
    }

    /**
     * topicCacheMap에서 가장 먼저 add 된 item을 뺀다.
     * @private
     */
    function _extractOldValue() {
      remove(_.sortByOrder(topicCacheMap, 'timeStamp')[0].key);
    }

  }
})();
