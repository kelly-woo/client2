(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelCtrl', rPanelCtrl);

  /* ngInject */
  function rPanelCtrl($scope, $rootScope) {

    $scope.isSearchQueryEmpty = true;

    $scope.$on('onrPanelFileTitleQueryChanged', function(event, keyword) {
      $scope.isSearchQueryEmpty = keyword ? false : true;
    });
    $scope.onFileTabSelected = function() {
      _setFileTabStatus();
      $rootScope.$broadcast('onrPanelFileTabSelected');
    };
    $scope.onMessageTabSelected = function() {
      _setMessageTabStatus();
      $rootScope.$broadcast('onrPanelFileTabSelected');
    };
    function _setFileTabStatus() {
      $scope.isFileTabActive = true;
      $scope.isMessageTabActive = false;
    }
    function _setMessageTabStatus() {
      $scope.isFileTabActive = false;
      $scope.isMessageTabActive = true;
    }

    $scope.showLoading = function() {
      $scope.isLoading = true;
    };
    $scope.hideLoading = function() {
      $scope.isLoading = false;
    };

    $scope.messageTab = true;

  }

})();
