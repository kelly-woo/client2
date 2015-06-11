(function() {
  'use strict';

  angular
    .module('app.framework', [
      'app.config',
      'app.analytics',
      'app.language',
      'app.storage',
      'app.local.storage',
      'app.pubsub',
      'app.desktop.notification',
      'app.socket'
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