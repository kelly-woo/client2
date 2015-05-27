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

    var that = this;

    // singleton modal instance.
    var modal;

    var inviteModalLock;
    

    that.openTopicCreateModal = openTopicCreateModal;
    that.openTopicJoinModal = openTopicJoinModal;
    that.openTopicRenameModal = openTopicRenameModal;


    that.openInviteToJoinedEntityModal = openInviteToJoinedEntityModal;

    that.openMemberProfileModal = openMemberProfileModal;

    that.openTeamMemberListModal = openTeamMemberListModal;

    that.openInviteToCurrentEntityModal = openInviteToCurrentEntityModal;
    that.openInviteToTeamModal = openInviteToTeamModal;

    that.openCurrentMemberModal = openCurrentMemberModal;

    that.closeModal = closeModal;

    /**
     * topic 을 create 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openTopicCreateModal($scope) {
      var modalOption = {
        scope       :   $scope,
        templateUrl :   'app/modal/topics/topic_create/topic.create.html',
        controller  :   'createEntityModalCtrl',
        size        :   'lg'
      };
      modal = _modalOpener(modalOption);
    }

    /**
     * topic 에 조인 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openTopicJoinModal($scope) {
      var modalOption = {
        scope       :   $scope,
        templateUrl :   'app/modal/topics/topic_join/join.html',
        controller  :   'joinModalCtrl',
        size        :   'lg'
      };
      modal = _modalOpener(modalOption);
    }

    /**
     * topic 의 이름을 rename 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openTopicRenameModal($scope) {
      var modalOption = {
        scope       :   $scope,
        templateUrl :   'app/modal/topics/topic_rename/topic.rename.html',
        controller  :   'renameModalCtrl',
        size        :   'lg'
      };
      modal = _modalOpener(modalOption);
    }

    /**
     * 1:1 DM 창에서 상대방을 내가 조인한 토픽에 초대하는 모달창을 연다.
     * @param $scope
     */
    function openInviteToJoinedEntityModal($scope) {
      var modalOption = {
        scope       :   $scope,
        templateUrl :   'app/modal/invite.direct.html',
        controller  :   'inviteUsertoChannelCtrl',
        size        :   'lg'
      };
      modal = _modalOpener(modalOption);
    }

    /**
     * 멤버의 간단한 프로필을 보는 모달창을 연다.
     * @param $scope {scope}
     * @param member {object} member entity to be shown
     */
    function openMemberProfileModal($scope, member) {
      var modalOption = {
        scope       :   $scope,
        templateUrl :   'app/modal/profile_view/profile.view.html',
        controller  :   'profileViewerCtrl',
        windowClass :   'profile-view-modal',
        resolve     :   {
          curUser     : function getCurUser(){ return member; }
        }
      };

      modal = _modalOpener(modalOption);
    }

    /**
     * 팀에 소속된 모든 멤버들을 볼 수 있는 모달창을 연댜.
     */
    function openTeamMemberListModal() {
      var modalOption = {
        templateUrl : 'app/modal/team_member_list/team.member.list.html',
        controller  : 'teamMemberListCtrl',
        size        : 'lg'
      };
      modal = _modalOpener(modalOption);
    }

    /**
     * 현재 토픽으로 초대할 수 있는 모달창을 연다.
     */
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

    /**
     * 이메일로 팀으로 초대하는 모달창을 연다.
     */
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

    /**
     * 현재 나의 프로필을 수정/확인 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openCurrentMemberModal($scope) {
      var modalOption = {
        scope       :   $scope,
        templateUrl :   'app/modal/current_member_profile/settings.profile.html',
        controller  :   'profileCtrl',
        size        :   'lg'
      };

      modal = _modalOpener(modalOption);
    }

    /**
     * 모달창을 여는 펑션이다.
     * @param modalOption {object} modal option to be passed when opening modal instance
     * @returns {object} $modalInstance
     * @private
     */
    function _modalOpener(modalOption) {
      return $modal.open(modalOption);
    }


    /**
     * 모달을 별 이유없이 닫는다.
     */
    function closeModal() {
      if (!!modal) modal.dismiss('close');
    }
  }
})();