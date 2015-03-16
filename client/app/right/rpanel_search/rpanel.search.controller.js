(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelSearchCtrl', rPanelSearchCtrl);

  rPanelSearchCtrl.$inject = ['$scope', '$rootScope', 'storageAPIservice', 'messageList', 'entityAPIservice', 'publicService', '$filter'];

  /* @ngInject */
  function rPanelSearchCtrl($scope, $rootScope, storageAPIservice, messageList, entityAPIservice, publicService, $filter) {

    // scope function that gets called when user hits 'enter' in '.rpanel-body-search__input'.
    $scope.onFileTitleQueryEnter = function() {
      $rootScope.$broadcast('onrPanelFileTitleQueryChanged', $scope.keyword);
    };

  }
})();

