/**
 * Main reason for this service is to
 *  1. keep modal instance as a singleton object throughout the whole application
 *  2. Reduce unnecessary codes
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('modalHelper', modalWindowHelper);

  /* @ngInject */
  function modalWindowHelper($modal) {

    var modal;

    this.openMemberProfileModal = openMemberProfileModal;

    this.openTeamMemberListModal = openTeamMemberListModal;

    this.openInviteToCurrentEntityModal = openInviteToCurrentEntityModal;
    this.openInviteToTeamModal = openInviteToTeamModal;

    this.openCurrentMemberModal = openCurrentMemberModal;

    this.closeModal = closeModal;


    function openMemberProfileModal($scope, member) {
      var modalOption = {
        scope       :   $scope,
        templateUrl :   'app/modal/profile.view.html',
        controller  :   'profileViewerCtrl',
        windowClass :   'profile-view-modal',
        resolve     :   {
          curUser     : function getCurUser(){ return member; }
        }
      };

      modal = _modalOpener(modalOption);

    }
    function openTeamMemberListModal() {
      var modalOption = {
        templateUrl : 'app/modal/team_member_list/team.member.list.html',
        controller  : 'teamMemberListCtrl',
        size        : 'lg'
      };
      modal = _modalOpener(modalOption);
    }

    function openInviteToCurrentEntityModal() {
      var modalOption = {
        templateUrl :   'app/modal/invite.channel.html',
        controller  :   'inviteModalCtrl',
        size        :   'lg',
        windowClass :   'allowOverflowY'
      };
      modal = _modalOpener(modalOption);
    }
    function openInviteToTeamModal() {
      var modalOption = {
        templateUrl :   'app/modal/invite_to_team/invite.team.html',
        controller  :   'inviteUserToTeamCtrl',
        size        :   'lg'
      };
      modal = _modalOpener(modalOption);
    }

    function openCurrentMemberModal($scope) {
      var modalOption = {
        scope       :   $scope,
        templateUrl :   'app/modal/current_member_profile/settings.profile.html',
        controller  :   'profileCtrl',
        size        :   'lg'
      };

      modal = _modalOpener(modalOption);
    }

    function _modalOpener(modalOption) {
      return $modal.open(modalOption);
    }

    function closeModal() {
      if (!!modal) modal.dismiss('close');
    }
  }
})();