(function() {
  'use strict';

  angular
    .module('jandi.hybridApp', [])
    .config(config)
    .run(run);


  function config() {

  }

  function run(hybridAppHelper) {
    console.log('hybridAppHelper called :: ', hybridAppHelper);
  }
})();
