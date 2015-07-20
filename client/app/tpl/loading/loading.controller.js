(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('LoadingCtrl', LoadingCtrl);

  /* @ngInject */
  function LoadingCtrl($scope) {
    $scope.isLoading = false;

    $scope.$on('showLoading', _showLoading);
    $scope.$on('hideLoading', _hideLoading);

    function _showLoading(event) {
      $scope.isLoading = true;
    }

    function _hideLoading(event) {
      $scope.isLoading = false;
    }
  }
})();
