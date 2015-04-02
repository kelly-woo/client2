(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelCtrl', rPanelCtrl);

  /* ngInject */
  function rPanelCtrl($scope, $rootScope) {

    $scope.isSearchQueryEmpty = true;

    $scope.isFileTabActive = true;
    $scope.isMessageTabActive = false;

    $scope.$on('resetRPanelSearchStatusKeyword', function() {
      $scope.isSearchQueryEmpty = _isSearchQueryEmpty();
    });

    $scope.$on('onrPanelFileTitleQueryChanged', function(event, keyword) {
      $scope.isSearchQueryEmpty = _isSearchQueryEmpty(keyword);
    });

    function _isSearchQueryEmpty(keyword) {
      return !keyword;
    }
    $scope.$on('setFileTabActive', function() {
      if (!$scope.isFileTabACitve)
        _setFileTabStatus();
    });

    $scope.onFileTabSelected = function() {
      _setFileTabStatus();
      $rootScope.$broadcast('onrPanelFileTabSelected');
    };
    $scope.onMessageTabSelected = function() {
      _setMessageTabStatus();
      $rootScope.$broadcast('onrPanelMessageTabSelected');
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

  }

})();
