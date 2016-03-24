/**
 * @fileoverview profile image
 *
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.profileImage', [
      'ui.bootstrap',
      'jandiApp',
      'jandi.core',
      'jandi.config',
      'jandi.ui.dialog'
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
