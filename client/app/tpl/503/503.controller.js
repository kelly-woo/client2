(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('underConstructionCtrl', underConstructionCtrl);

  /* @ngInject */
  function underConstructionCtrl(publicService) {
    _init();

    function _init() {
      publicService.hideDummyLayout();
    }
  }
})();