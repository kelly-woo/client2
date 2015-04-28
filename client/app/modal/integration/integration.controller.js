(function() {
  'use strict';

  // FILE UPLOAD controller
  angular
    .module('jandiApp')
    .controller('fileIntegrationModalCtrl', fileIntegrationModalCtrl);

  /* @ngInject */
  function fileIntegrationModalCtrl($scope, $modalInstance, $filter, data, startIntegration) {
    console.log('file integration modal ctrl ::: ', $scope, data);
    var descs = data.descs;
    var i;
    var len;

    $scope.close = function() {
      $modalInstance.dismiss('cancel');
    };
    $scope.integrate = function() {
      startIntegration();
    };

    $scope.title = $filter('translate')(data.title);
    for (i = 0, len = descs.length; i < len; ++i) {
      $scope['descImage' + (i + 1)] = descs[i].img;
      $scope['descText' + (i + 1)] = $filter('translate')(descs[i].txt);
    }
  }
}());
