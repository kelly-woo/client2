(function() {
  'use strict';

  angular
    .module('app.framework', [
      'base.framework',
      'app.config',
      'app.analytics',
      'app.language',
      'app.storage',
      'app.socket',
      'app.pubsub',
      'app.net'
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