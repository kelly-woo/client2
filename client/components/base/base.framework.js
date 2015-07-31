/**
 * @fileoverview Basic components/frameworks that can be used across all angular projects.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('base.framework', [
      'ui.bootstrap',
      'angularFileUpload',
      'ngResource',
      'ngSanitize',
      'ngAnimate',
      'ngImgCrop',
      'monospaced.elastic',
      'base.highlight',
      'base.logger'
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