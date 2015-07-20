// INVITE USER TO TEAM
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TeamInviteCtrl', TeamInviteCtrl);

  /* @ngInject */
  function TeamInviteCtrl($scope, $modalInstance, $filter, teamInfo, configuration, memberService, publicService, currentSessionHelper, jndPubSub) {
    var currentTeamAdmin;

    $scope.disabledImage = configuration.assets_url + 'assets/images/invite-disabled.png';
    $scope.doneImage = configuration.assets_url + 'assets/images/invite-done.png';
    $scope.membersImage = configuration.assets_url + 'assets/images/invite-members.png';

    $scope.seedUri = teamInfo.invitationUrl || '';                            // invite public link
    $scope.inviteDisabled = teamInfo.invitationStatus === 'disabled';   // invite status
    $scope.disableSeedUri = $scope.seedUri === '';

    // current team name
    $scope.currentTeamName = currentSessionHelper.getCurrentTeam().name;

    // team의 admin
    currentTeamAdmin = currentSessionHelper.getCurrentTeamAdmin();
    $scope.adminName = currentTeamAdmin ? currentTeamAdmin.name : '';
    $scope.isAdmin = currentTeamAdmin.id === memberService.getMemberId();

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
      if ($scope.isLoading) {
        jndPubSub.hideLoading();
      } else {
        jndPubSub.showLoading();
      }
      $scope.isLoading = !$scope.isLoading;
    };

    $scope.toAdmin = function() {
      var teamName = $filter('getName')($scope.team);
      publicService.redirectTo(configuration.main_address + 'admin/' + teamName);
    };
  }
})();
