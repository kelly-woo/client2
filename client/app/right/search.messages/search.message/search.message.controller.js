(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelMessageSearchCardCtrl', rPanelMessageSearchCardCtrl);

  function rPanelMessageSearchCardCtrl($scope) {
    $scope.prev = $scope.message.prev;
    $scope.current = $scope.message.current;
    $scope.next = $scope.message.next;
    $scope.entity = $scope.message.entity;

    $scope.onMessageCardClick = onMessageCardClick;

    function onMessageCardClick() {
      console.log('you clicked me ')
      console.log($scope.message.entity.name);
      console.log($scope.message.entity);
    }
  }
})();