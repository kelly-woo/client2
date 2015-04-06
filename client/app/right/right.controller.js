(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelCtrl', rPanelCtrl);

  /* ngInject */
  function rPanelCtrl($scope, $rootScope) {
    var fileTab;
    var messageTab;

    (function() {
      _init();
    })();

    /**
     * Default set-up.
     * @private
     */
    function _init() {
      $scope.isSearchQueryEmpty = true;

      fileTab = {
        active: true
      };
      messageTab = {
        active: false
      };

      $scope.tabs = [fileTab, messageTab];
    }


    $scope.$on('resetRPanelSearchStatusKeyword', function() {
      _updateSearchQueryEmptyStatus();
    });

    $scope.$on('onrPanelFileTitleQueryChanged', function(event, keyword) {
      _updateSearchQueryEmptyStatus(keyword);
    });

    $scope.$on('setFileTabActive', function() {
      _setFileTabStatus();
    });

    $scope.onFileTabSelected = function(a) {
      $rootScope.$broadcast('onrPanelFileTabSelected');
    };
    $scope.onMessageTabSelected = function() {
      $rootScope.$broadcast('onrPanelMessageTabSelected');
    };


    function _updateSearchQueryEmptyStatus(keyword) {
      $scope.isSearchQueryEmpty =  !keyword;
    }
    function _setFileTabStatus() {
      fileTab.active = true;
    }
    function _setMessageTabStatus() {
      messageTab.active = true;
    }

    $scope.showLoading = function() {
      $scope.isLoading = true;
    };
    $scope.hideLoading = function() {
      $scope.isLoading = false;
    };

    $scope.isFileTabActive = function() {
      return fileTab.active;
    };
    $scope.isMessageTabActive = function() {
      return messageTab.active;
    };

  }

})();
