(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelMessageSearchCardCtrl', rPanelMessageSearchCardCtrl);

  function rPanelMessageSearchCardCtrl($scope) {
    $scope.prev = $scope.message.prev;
    $scope.current = $scope.message.current;
    $scope.next = $scope.message.next;
  }
})();