// INVITE USER TO TEAM
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('invitationTeamCtrl', invitationTeamCtrl);

  /* @ngInject */
  function invitationTeamCtrl($scope, $modalInstance, teamInfo, configuration, currentSessionHelper) {
    var currentTeamAdmin;

    $scope.disabledImage = configuration.assets_url + 'assets/images/invite-disabled.png';
    $scope.doneImage = configuration.assets_url + 'assets/images/invite-done.png';
    $scope.membersImage = configuration.assets_url + 'assets/images/invite-members.png';

    $scope.seedUri = teamInfo.invitationUrl || '';                            // invite public link
    $scope.inviteDisabled = teamInfo.invitationStatus === 'disabled';   // invite status
    $scope.disableSeedUri = $scope.seedUri === '';

    // team의 admin
    currentTeamAdmin = currentSessionHelper.getCurrentTeamAdmin();
    $scope.adminName = currentTeamAdmin ? currentTeamAdmin.name : '';

    $scope.add = function() {
      $scope.invitation.add();
    };
    $scope.send = function($event) {
      $scope.invitation.send($event);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.toggleLoading = function() {
      $scope.isLoading = !$scope.isLoading;
    }
  }
})();
