(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelSearchCtrl', rPanelSearchCtrl);

  /* @ngInject */
  function rPanelSearchCtrl($scope, $rootScope) {

    // scope function that gets called when user hits 'enter' in '.rpanel-body-search__input'.
    $scope.onFileTitleQueryEnter = function() {
      $rootScope.$broadcast('onrPanelFileTitleQueryChanged', $scope.keyword);
    };

    $scope.$on('rPanelSearchFocus', function() {
      _setFocus();
    });

    function _setFocus() {
      $('#right-panel-search-box').focus();
    }
  }
})();

