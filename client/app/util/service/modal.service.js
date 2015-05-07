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
  function modalWindowHelper($modal, teamAPIservice) {

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
        templateUrl :   'app/modal/invitation/invitation.channel.html',
        controller  :   'invitationChannelCtrl',
        size        :   'lg',
        windowClass :   'allowOverflowY',
        resolve     : {
          data      : function() {
            // 토픽으로 초대 가능한 member의 수
            // 현재 channel의 유저가 가진 team의 갯수
            return '';
          }
        }
      };
      modal = _modalOpener(modalOption);
    }
    var inviteModalLock;
    function openInviteToTeamModal() {
      if (!inviteModalLock) {
        inviteModalLock = true;
        // modal에 해당 member의 team information을 전달 해야함.
        teamAPIservice.getTeamInfo()
          .success(function(res) {
            var modalOption = {
              templateUrl :   'app/modal/invitation/invitation.team.html',
              controller  :   'invitationTeamCtrl',
              size        :   'lg',
              resolve: {
                teamInfo: function() {
                  return res;
                }
              }
            };
            modal = _modalOpener(modalOption);
          })
          .finally(function() {
            inviteModalLock = false;
          });
      }
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