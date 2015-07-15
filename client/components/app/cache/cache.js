/**
 * @fileoverview app내의 정보를 담아두기위한 module
 * @author JiHoon Kim <jihoonk@toslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.cache', [])
    .run(run)
    .config(config);

  /* @ngInject */
  function run(TopicCache) {
    TopicCache.init();
  }

  function config() {

  }

})();
