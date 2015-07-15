/**
 *
 */
(function() {
  'use strict';

  angular
    .module('app.cache')
    .service('TopicCache', TopicCache);

  /* @ngInject */
  function TopicCache() {
    var topicCacheMap;

    this.init = init;

    this.get = get;
    this.add = add;
    this.remove = remove;
    this.has = has;

    function init() {
      topicCacheMap = {};
    }

    function get(key) {
      return topicCacheMap[key];
    }

    function add(key, value) {
      topicCacheMap[key] = value;
    }

    function remove(key) {
      delete topicCacheMap[key];
    }

    function has(key) {
      return !!topicCacheMap[key];
    }
  }
})();
