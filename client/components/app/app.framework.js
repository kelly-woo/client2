(function() {
  'use strict';

  angular
    .module('app.framework', [
      'base.framework',
      'app.config',
      'app.analytics',
      'app.language',
      'app.storage',
      'app.local.storage',
      'app.pubsub',
      'app.socket',
      'app.keyCode',
      'app.net',
      'app.desktop.notification'

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