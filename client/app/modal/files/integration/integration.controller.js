(function() {
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandiApp')
    .controller('fileIntegrationModalCtrl', fileIntegrationModalCtrl);

  /* @ngInject */
  function fileIntegrationModalCtrl($scope, $modalInstance, $filter, data) {
    var descs = data.descs;
    var i;
    var len;

    $scope.close = function() {
      data.closeIntegration ? data.closeIntegration() : $modalInstance.dismiss('cancel');
    };

    $scope.integrate = function() {
      data.startIntegration && data.startIntegration();
    };

    $scope[data.cInterface] = true;
    $scope.title = $filter('translate')(data.title);
    for (i = 0, len = descs.length; i < len; ++i) {
      $scope['descClassName' + (i + 1)] = descs[i].className;
      $scope['descText' + (i + 1)] = $filter('translate')(descs[i].txt);
    }
  }
}());
