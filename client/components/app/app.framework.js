(function() {
  'use strict';

  angular
    .module('app.framework', [
      'base.framework',
      'app.config' //,
      // 'app.storage',
      // 'app.analytics',
      // 'app.language',
      // 'app.session'
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