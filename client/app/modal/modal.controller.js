'use strict';

var app = angular.module('jandiApp');

/*----------------------------

 Modal Controller
 - Everything happening when modal view is up is controlled by below controllers.

 ----------------------------*/

// DIRECT_MESSAGE
app.controller('userModalCtrl', function($scope, $modalInstance, $state) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onUserSelected = function(item) {
    $state.go('archives', {entityType:'users', entityId:item.id});
    this.cancel();
    item.visibility = true;
  };
});

// WHEN INVITING FROM DIRECT MESSAGE
app.controller('inviteUsertoChannelCtrl', function($scope, $modalInstance, entityheaderAPIservice, publicService, $rootScope) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.inviteOptions = publicService.getInviteOptions($rootScope.joinedChannelList, $rootScope.privateGroupList, $scope.currentEntity.id);

  $scope.onInviteClick = function(inviteTo) {

    if ($scope.isLoading) return;

    $scope.toggleLoading();

    var invitedId = [];
    invitedId.push($scope.currentEntity.id);

    $scope.isLoading = true;

    entityheaderAPIservice.inviteUsers(inviteTo.type, inviteTo.id, invitedId)
      .success(function(response) {
        $scope.updateLeftPanelCaller();
        $modalInstance.dismiss('cancel');
      })
      .error(function(error) {
        console.error(error.code, error.msg);
      })
      .finally(function() {
        $scope.toggleLoading();
      });
  }
});

// PASSWORD RESET CONTROLLER
app.controller('passwordRequestController', function($rootScope, $scope, $modalInstance, authAPIservice, $filter) {
  $scope.onLoadDone = true;

  $('#passwordResetEmailInput').focus();
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onPasswordResetRequstClick = function(email) {
    if ($scope.isLoading) return;
    $scope.toggleLoading();

    authAPIservice.requestPasswordEmail(email)
      .success(function(response) {
        $scope.emailSent = true;
      })
      .error(function(response) {
        console.log(response)
        alert($filter('translate')('@password-reset-email-fail'));
      })
      .finally(function() {
        $scope.toggleLoading();
      });


  }
});
