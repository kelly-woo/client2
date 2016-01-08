/**
 * @fileoverview 다른 멤버들의 프로필을 보는 모달창의 컨트롤러.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('UserProfileCtrl', UserProfileCtrl);

  /* @ngInject */
  function UserProfileCtrl($scope, $filter, curUser, $state, modalHelper, jndPubSub, memberService, messageAPIservice,
                           analyticsService) {
    var isChangedName = false;
    var isChangedEmail = false;
    var isChangedProfile = false;

    _init();

    function _init() {
      _setCurrentUser(curUser);

      $scope.isDefaultProfileImage = memberService.isDefaultProfileImage($scope.curUser.u_photoUrl);
      $scope.isStarred = $scope.curUser.isStarred;
      $scope.isDeactivatedUser = _isDeactivatedUser();
      $scope.isMyself = _isMyself();

      $scope.message = {content:''};

      $scope.$on('updateMemberProfile', _onUpdateMemberProfile);

      $scope.close = close;
      $scope.onActionClick = onActionClick;
      $scope.onSubmitDoneClick = onSubmitDoneClick;
      $scope.onProfileChange = onProfileChange;
      $scope.postMessage = postMessage;

      $scope.activeIndex = 'statusMessage';
      $scope.onProfileSelect = function(index) {
        $scope.activeIndex = index;
      };

      _attachEvents();

      if ($scope.isMyself) {
        $scope.emails = $scope.account.emails;
      }
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      $scope.$watch('message.content', _onMessageContentChange);
      $scope.$on('onCurrentMemberChanged', _onCurrentMemberChanged);

      $scope.$on('$destroy', _onDestroy);
    }

    function _setCurrentUser(curUser) {
      $scope.curUser = curUser;

      curUser.extProfileImage = memberService.getProfileImage(curUser.id, 'small');
      $scope.name = $filter('getName')($scope.curUser);
      $scope.department = $filter('getUserDepartment')($scope.curUser);
      $scope.position = $filter('getUserPosition')($scope.curUser);
      $scope.phoneNumber = $filter('getUserPhoneNumber')($scope.curUser);
      $scope.email = $filter('getUserEmail')($scope.curUser);
      $scope.statusMessage = $filter('getUserStatusMessage')($scope.curUser);
    }

    /**
     * 현재 멤버의 정보가 바뀌었다는 뜻이므로 locally가지고 있는 멤버의 정보를 최신으로 업데이트한다.
     */
    function _onCurrentMemberChanged() {
      if ($scope.isMyself) {
        _setCurrentUser(memberService.getMember());
      }
    }

    function _onDestroy() {
      isChangedName && _changeProfileName();
      isChangedEmail && _changeProfileEmail();
      isChangedProfile && _changeProfileOtherInfo();
    }

    /**
     * modal close
     */
    function close() {
      modalHelper.closeModal();
    }

    /**
     * 프로필 모달에서 버튼을 눌렀을 경우 해당하는 기능은 불러준다.
     * @param actionType {string} 실행되어야 할 기능의 이름
     */
    function onActionClick(type) {
      if (type === 'file') {
        _onFileListClick(curUser.id);
      } else if (type === 'email') {
        _sendEmail($scope.curUser.u_email);
      } else if (type === 'directMessage' && !_isMyself()) {
        _goToDM(curUser.id);
      } else if (type === 'mention') {
        _goToMention();
      }

      modalHelper.closeModal();
    }

    /**
     * submit done click
     */
    function onSubmitDoneClick() {
      if (_isEnableDM()) {
        $scope.showSubmitDone = false;
      }
    }

    /**
     * dm 활성화 여부
     * @returns {boolean}
     * @private
     */
    function _isEnableDM() {
      return $scope.showSubmitDone && !$scope.isSending
    }

    /**
     * post message
     */
    function postMessage() {
      if (!$scope.isSending) {
        if ($scope.message.content) {
          $scope.showSubmitDone = true;
          $scope.isSending = true;

          messageAPIservice.postMessage('users', curUser.id, $scope.message.content)
            .success(function() {
              $scope.message.content = '';
            })
            .finally(function() {
              $scope.isSending = false;
            });
        }
      }
    }

    /**
     * updateMemberProfile 이벤트 발생시 이벤트 핸들러
     * @param {object} event
     * @param {{event: object, member: object}} data
     * @private
     */
    function _onUpdateMemberProfile(event, data) {
      var member = data.member;
      if ($scope.curUser.id === member.id) {
        $scope.curUser.exProfileImg = memberService.getProfileImage(member.id, 'small');
      }
    }

    /**
     * 해당 유저의 파일리스트를 연다.
     * @param userId {number} 해당 유저의 아이디.
     * @private
     */
    function _onFileListClick(userId) {
      if ($state.current.name != 'messages.detail.files') {
        $state.go('messages.detail.files');
      }

      jndPubSub.pub('updateFileWriterId', userId);
    }

    /**
     * 현재 보고 있는 사용자가 disabled 된 사용자인지 아닌지 확인한다.
     * @returns {boolean} true, disabled 됐다면
     * @private
     */
    function _isDeactivatedUser() {
      var deactivatedMessageKey;
      var isDeactivated = false;

      if (memberService.isDisabled($scope.curUser)) {
        isDeactivated = true;
        deactivatedMessageKey = '@common-disabled-member-profile-msg';
      } else if (memberService.isDeleted($scope.curUser)) {
        isDeactivated = true;
        deactivatedMessageKey = '@common-deleted-member-profile-msg';
      }

      if (isDeactivated) {
        $scope.deactivatedMessage = $filter('translate')(deactivatedMessageKey);
      }

      return isDeactivated;
    }

    /**
     * 현재 보고 있는 사용자가 disabled 된 사용자인지 아닌지 확인한다.
     * @returns {boolean} true, disabled 됐다면
     * @private
     */
    function _isCurrentUserDisabled() {
      return $scope.curUser.status === 'disabled';
    }

    /**
     * 현재 보고 있는 사용자가 나 자신인지 아닌지 확인한다.
     * @returns {boolean} true, 내 자신이면
     * @private
     */
    function _isMyself() {
      var member = memberService.getMember();
      return $scope.curUser.id === member.id;
    }

    /**
     * 이메일을 보내는 창을 연다.
     * @param emailAddr {string} 보냉 이메일 주소
     * @private
     */
    function _sendEmail(emailAddr) {
      if (!_isCurrentUserDisabled()) {
        window.location.href = "mailto:" + emailAddr;
      }
    }

    /**
     * 1:1 대화로 옮긴다.
     * @param userId {number} 1:1 대화를 할 상대의 아이디
     * @private
     */
    function _goToDM(userId) {
      if (_isMyself()) {
        return;
      }

     // TODO: REFACTOR ROUTE.SERVICE
      var routeParam = {
        entityType: 'users',
        entityId: userId
      };

      $state.go('archives', routeParam);
    }

    /**
     * go metion tab
     * @private
     */
    function _goToMention() {
      $state.go('messages.detail.mentions');
    }

    /**
     * message content change
     * @param {string} value
     * @private
     */
    function _onMessageContentChange(value) {
      if (_isEnableDM() && value !== '') {
        $scope.showSubmitDone = false;
      }
    }

    function onProfileChange(type, value) {
      switch(type) {
        case 'name':
          isChangedName = true;
          $scope.curUser.name = value;
          break;
        case 'email':
          isChangedEmail = true;
          $scope.curUser.u_email = value;
          break;
        case 'department':
          isChangedProfile = true;
          $scope.curUser.u_extraData.department = value;
          break;
        case 'position':
          isChangedProfile = true;
          $scope.curUser.u_extraData.position = value;
          break;
        case 'phoneNumber':
          isChangedProfile = true;
          $scope.curUser.u_extraData.phoneNumber = value;
          break;
        case 'statusMessage':
          isChangedProfile = true;
          $scope.curUser.u_statusMessage = value;
          break;
      }
    }

    /**
     * 현재 보고 있는 프로필의 이름을 바꾼다.
     */
    function _changeProfileName() {
      memberService.setName(memberService.getName($scope.curUser))
        .error(function (err) {
          console.log(err);
        });
    }

    /**
     * 현재 보고 있는 프로필의 이메일을 바꾼다.
     */
    function _changeProfileEmail() {
      memberService.setEmail(memberService.getEmail($scope.curUser))
        .error(function (err) {
          console.log(err);
        });
    }

    /**
     * 현재 보고 있는 프로필의 다른 정보(추가 정보)들을 바꾼다.
     *   - 오늘의 기분, 전화번호, 부서, 그리고 직책
     */
    function _changeProfileOtherInfo() {
      memberService.updateProfile($scope.curUser)
        .success(function() {
          // analytics
          analyticsService.mixpanelTrack( "Set Profile" );
          var profile_data = {

            "status"    : $scope.curUser.u_statusMessage,
            "mobile"    : $scope.curUser.u_extraData.phoneNumber,
            "division"  : $scope.curUser.u_extraData.department,
            "position"  : $scope.curUser.u_extraData.position
          };

          analyticsService.mixpanelPeople( "set", profile_data );
        })
        .error(function(err) {
          console.error('updateUserProfile', arguments);
        });
    }
  }
})();
