(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectCtrl', JndConnectCtrl);

  /* @ngInject */
  function JndConnectCtrl($scope, JndConnect) {
    $scope.historyBack = historyBack;
    $scope.close = close;


    function close() {
      JndConnect.hide();
    }

    function historyBack() {
      JndConnect.hide();
    }
  }
})();
