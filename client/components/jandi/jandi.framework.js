(function() {
  'use strict';

  angular
    .module('jandi.framework', [
      'jandi.pcApp',
      'jandi.preloader'
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