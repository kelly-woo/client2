(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('PasswordRequestCtrl', PasswordRequestCtrl);

  /* @ngInject */
  function PasswordRequestCtrl($scope, modalHelper, authAPIservice, $filter) {
    $scope.onLoadDone = true;

    $('#passwordResetEmailInput').focus();

    $scope.cancel = modalHelper.closeModal;

    $scope.onPasswordResetRequestClick = function(email) {
      if ($scope.isLoading) return;
      $scope.toggleLoading();

      authAPIservice.requestPasswordEmail(email)
        .success(function(response) {
          $scope.emailSent = true;
        })
        .error(function(response) {
          console.log(response);
          alert($filter('translate')('@password-reset-email-fail'));
        })
        .finally(function() {
          $scope.toggleLoading();
        });


    }
  }
})();
