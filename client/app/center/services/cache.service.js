(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Cache', Cache);

  /* @ngInject */
  function Cache(TopicCacheManager, currentSessionHelper) {
    var _entityId;
    var _entityType;

    this.init = init;
    this.has = has;
    this.add = add;
    this.get = get;

    function init() {
      _entityId = currentSessionHelper.getCurrentEntityId();
      _entityType = currentSessionHelper.getCurrentEntityType();
    }

    function has() {
      return TopicCacheManager.has(_entityId);
    }

    function add(param) {

      TopicCacheManager.add(_entityId, param);
    }

    function get() {
      return TopicCacheManager.get(_entityId);
    }
  }
})();