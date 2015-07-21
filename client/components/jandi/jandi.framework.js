/**
 * @fileoverview Jandi components/frameworks that can be used across all 'jandi' angular projects.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 *
 */
(function() {
  'use strict';

  angular
    .module('jandi.framework', [
      'jandi.pcApp',
      'jandi.preloader',
      'jandi.browser',
      'jandi.active.notifier'
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
