(function() {
  'use strict';

  angular
    .module('config.framework', [
      'config.common'
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