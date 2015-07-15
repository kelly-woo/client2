/**
 *
 */
(function() {
  'use strict';

  angular
    .module('app.cache')
    .service('TopicCacheManager', TopicCacheManager);

  /* @ngInject */
  function TopicCacheManager() {
    var Cache;

    this.init = init;

    this.get = get;
    this.add = add;
    this.remove = remove;
    this.has = has;

    function init() {
      Cache = {};
    }

    function get(key) {
      return Cache[key];
    }

    function add(key, value) {
      Cache[key] = value;
    }

    function remove(key) {
      delete Cache[key];
    }

    function has(key) {
      return !!Cache[key];
    }
  }
})();
