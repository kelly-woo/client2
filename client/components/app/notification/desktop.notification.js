(function() {
  'use strict';

  angular
    .module('app.desktop.notification', [])
    .config(config)
    .run(run);

  /* @ngInject */
  function config() {
  }

  /* @ngInject */
  function run(DesktopNotification, configuration) {
    DesktopNotification.config(configuration);
  }
})();
