(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelSearchMessageCtrl', rPanelSearchMessageCtrl);

  function rPanelSearchMessageCtrl($scope) {
    $scope.prev = $scope.message.prev;
    $scope.current = $scope.message.current;
    $scope.next = $scope.message.next;

    processCurrentText();

    function processCurrentText() {
      var currentText = $scope.current.text.toLowerCase();
      var query = $scope.searchQuery.q.toLowerCase();

      console.log(currentText.indexOf(query))
    }
  }
})();