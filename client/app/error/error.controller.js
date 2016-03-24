(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('errorController', errorController);

  /* @ngInject */
  function errorController($scope, publicService) {
    $scope.on404ImageClicked = on404ImageClicked;

    _init();

    function _init() {
      publicService.hideDummyLayout();
    }

    function on404ImageClicked() {
      publicService.redirectTo('https://www.jandi.com');
    }
  }
})();
