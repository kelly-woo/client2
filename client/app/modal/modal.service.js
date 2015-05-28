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
  function modalWindowHelper($modal, teamAPIservice, accountService) {

    var that = this;

    // singleton modal instance.
    var modal;

    var inviteModalLock;
    

    that.openTopicCreateModal = openTopicCreateModal;
    that.openTopicInviteModal = openTopicInviteModal;
    that.openTopicInviteFromDmModal = openTopicInviteFromDmModal;
    that.openTopicJoinModal = openTopicJoinModal;
    that.openTopicRenameModal = openTopicRenameModal;

    that.openTeamChangeModal = openTeamChangeModal;
    that.openTeamMemberListModal = openTeamMemberListModal;
    that.openInviteToTeamModal = openInviteToTeamModal;

    that.openCurrentMemberModal = openCurrentMemberModal;
    that.openMemberProfileModal = openMemberProfileModal;

    that.openFullScreenImageModal = openFullScreenImageModal;

    that.openPasswordResetRequestModal = openPasswordResetRequestModal;

    that.openAgreementModal = openAgreementModal;
    that.openPrivacyModal = openPrivacyModal;

    that.closeModal = closeModal;

    /**
     * topic 을 create 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openTopicCreateModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/topics/topic_create/topic.create.html',
        controller: 'TopicCreateCtrl',
        size: 'lg'
      };
      modal = _modalOpener(modalOption);
    }

    /**
     * 현재 토픽으로 초대할 수 있는 모달창을 연다.
     */
    function openTopicInviteModal() {
      var modalOption = {
        templateUrl: 'app/modal/topics/topic_invite/topic.invite.html',
        controller: 'TopicInviteCtrl',
        size: 'lg',
        windowClass: 'allowOverflowY',
        resolve: {
          data: function() {
            // 토픽으로 초대 가능한 member의 수
            // 현재 channel의 유저가 가진 team의 갯수
            return '';
          }
        }
      };
      modal = _modalOpener(modalOption);
    }

    /**
     * 1:1 DM 창에서 상대방을 내가 조인한 토픽에 초대하는 모달창을 연다.
     * @param $scope
     */
    function openTopicInviteFromDmModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/topics/topic_invite_from_dm/topic.invite.direct.html',
        controller: 'TopicInviteFromDmCtrl',
        size: 'lg'
      };
      modal = _modalOpener(modalOption);
    }

    /**
     * topic 에 조인 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openTopicJoinModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/topics/topic_join/topic.join.html',
        controller: 'TopicJoinCtrl',
        size: 'lg'
      };
      modal = _modalOpener(modalOption);
    }

    /**
     * topic 의 이름을 rename 할 수 있는 모달창을 연다.
     * @param $scope
     */
    function openTopicRenameModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/topics/topic_rename/topic.rename.html',
        controller: 'TopicRenameCtrl',
        size: 'lg'
      };
      modal = _modalOpener(modalOption);
    }

    /**
     * 팀 변환을 위한 현재 사용자가 가입되어있는 팀 리스트를 보여주는 모달창을 연다.
     * @param $scope
     */
    function openTeamChangeModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/teams/team_change/team.change.html',
        controller: 'TeamChangeController',
        size: 'lg'
      };
      modal = _modalOpener(modalOption);
    }

    /**
     * 팀에 소속된 모든 멤버들을 볼 수 있는 모달창을 연댜.
     */
    function openTeamMemberListModal() {
      var modalOption = {
        templateUrl: 'app/modal/teams/team_member_list/team.member.list.html',
        controller: 'TeamMemberListCtrl',
        size: 'lg'
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
              templateUrl: 'app/modal/teams/team_invite/team.invite.html',
              controller: 'TeamInviteCtrl',
              size: 'lg',
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
        scope: $scope,
        templateUrl: 'app/modal/members/current_member_profile/current.member.profile.html',
        controller: 'ProfileSettingCtrl',
        size: 'lg'
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
        scope: $scope,
        templateUrl: 'app/modal/members/member_profile/member.profile.view.html',
        controller: 'ProfileViewCtrl',
        windowClass: 'profile-view-modal',
        resolve: {
          curUser: function getCurUser(){ return member; }
        }
      };

      modal = _modalOpener(modalOption);
    }

    function openFullScreenImageModal($scope, fileUrl) {
      var modalOption = {
        scope: $scope,
        controller: 'FullScreenImageCtrl',
        templateUrl: 'app/modal/images/full_image/full.screen.image.html',
        windowClass: 'modal-full fade-only',
        resolve: {
          photoUrl: function() {
            return fileUrl;
          }
        }
      };

      modal = _modalOpener(modalOption);
    }

    /**
     * 비밀번호 재설정을 위한 이메일을 요청하는 모달창을 연다.
     * @param $scope
     */
    function openPasswordResetRequestModal($scope) {
      var modalOption = {
        scope: $scope,
        templateUrl: 'app/modal/password/password.reset.request.html',
        controller: 'PasswordRequestCtrl',
        size: 'lg'
      };

      modal = _modalOpener(modalOption);
    }

    /**
     * 이용약관 모달창을 연다.
     */
    function openAgreementModal() {
      var agreement = 'app/modal/terms/agreements/agreement';
      agreement = agreement + '_' + accountService.getAccountLanguage() + '.html';

      var modalOption = {
        templateUrl: agreement,
        size: 'lg'
      };

      modal = _modalOpener(modalOption);
    }

    /**
     * 개인정보 보호 방침 모달창을 연다.
     */
    function openPrivacyModal() {
      var privacy = 'app/modal/terms/privacy/privacy';
      privacy = privacy + '_' + accountService.getAccountLanguage() + '.html';

      var modalOption = {
        templateUrl: privacy,
        size: 'lg'
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