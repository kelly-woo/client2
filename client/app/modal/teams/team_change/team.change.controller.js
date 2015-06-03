(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TeamChangeController', TeamChangeController);

  function TeamChangeController($scope, modalHelper) {
    $scope.onModalClose = modalHelper.closeModal;
  }
})();