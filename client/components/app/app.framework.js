(function() {
  'use strict';

  angular
    .module('app.framework', [
      'config.framework',
      'base.framework',
      'app.analytics',
      'app.language',
      'app.storage',
      'app.socket',
      'app.pubsub'
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