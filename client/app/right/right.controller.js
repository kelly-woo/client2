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
      _isSearchQueryEmpty();
    });

    $scope.$on('onrPanelFileTitleQueryChanged', function(event, keyword) {
      _isSearchQueryEmpty(keyword);
    });

    function _isSearchQueryEmpty(keyword) {
      $scope.isSearchQueryEmpty =  !keyword;
    }
    $scope.$on('setFileTabActive', function() {
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
      _logCurrentTabStatus();
    }
    function _setMessageTabStatus() {
      $scope.isFileTabActive = false;
      $scope.isMessageTabActive = true;
      _logCurrentTabStatus();
    }

    $scope.showLoading = function() {
      $scope.isLoading = true;
    };
    $scope.hideLoading = function() {
      $scope.isLoading = false;
    };

    function _logCurrentTabStatus() {
      if (false) {
        console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
        console.log('file tab:', $scope.isFileTabActive)
        console.log('message tab:', $scope.isMessageTabActive)
        console.log('------------------------------------------------------------------------------------------------------------------')
      }
    }
  }

})();
