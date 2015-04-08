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

    this.openTeamMemberListModal = openTeamMemberListModal;

    this.openInviteToCurrentEntityModal = openInviteToCurrentEntityModal;
    this.openInviteToTeamModal = openInviteToTeamModal;

    this.closeModal = closeModal;


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
        templateUrl :   'app/modal/invite.team.html',
        controller  :   'inviteUserToTeamCtrl',
        size        :   'lg'
      };
      modal = _modalOpener(modalOption);
    }

    function _modalOpener(modalOption) {
      return $modal.open(modalOption);
    }

    function closeModal() {
      modal.dismiss('close');
    }
  }
})();