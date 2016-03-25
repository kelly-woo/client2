(function() {
  'use strict';

  angular
    .module('config.framework', [
      'jandi.config'
    ])
    .run(run)
    .config(config);

  /* @ngInject */
  function config() {
  }

  /* @ngInject */
  function run() {
  }

})();