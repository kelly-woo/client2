(function() {
  'use strict';

  angular
    .module('base.framework', [
      'ui.router',
      'ui.bootstrap',
      'angularFileUpload',
      'ngResource',
      'ngSanitize',
      'ngAnimate',
      'ngImgCrop',
      'monospaced.elastic',
      'base.highlight'
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