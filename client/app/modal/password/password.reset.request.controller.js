(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('PasswordRequestCtrl', PasswordRequestCtrl);

  /* @ngInject */
  function PasswordRequestCtrl($scope, modalHelper, AuthApi, $filter) {
    $scope.onLoadDone = true;
    $scope.email = '';
    $('#passwordResetEmailInput').focus();

    $scope.cancel = modalHelper.closeModal;

    $scope.onPasswordResetRequestClick = function(email) {
      if ($scope.isLoading) return;
      $scope.isLoading = !$scope.isLoading;

      AuthApi.requestPasswordEmail(email)
        .success(function(response) {
          $scope.emailSent = true;
        })
        .error(function(response) {
          console.log(response);
          alert($filter('translate')('@password-reset-email-fail'));
        })
        .finally(function() {
          $scope.isLoading = !$scope.isLoading;
        });
    };
  }
})();
