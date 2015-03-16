(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelCtrl', rPanelCtrl);

  /* ngInject */
  function rPanelCtrl($scope, $rootScope) {

    $scope.onFileTabSelected = function() {
      $rootScope.$broadcast('onrPanelFileTabSelected');
    };

    $scope.showLoading = function() {
      $scope.isLoading = true;
    };
    $scope.hideLoading = function() {
      $scope.isLoading = false;
    };

  }

})();
