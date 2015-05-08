(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('errorController', errorController);

  /* @ngInject */
  function errorController($scope, publicService) {
    $scope.on404ImageClicked = on404ImageClicked;

    function on404ImageClicked() {
      publicService.redirectTo('https://www.jandi.com');
    }
  }
})();
