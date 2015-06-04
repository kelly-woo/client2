/**
 * @fileoverview 현재 멤버(자신)의 프로필(계정) 을 수정하는 모달창의 컨트롤러.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('ProfileSettingCtrl', ProfileSettingCtrl);

  /* @ngInject */
  function ProfileSettingCtrl($scope, modalHelper, $filter, analyticsService, memberService,
                              CurrentMemberProfile) {

    $scope.cancel = modalHelper.closeModal;

    (function() {
      $scope.hasUpdatedProfilePic = false;
      $scope.isProfilePicSelected = false;

      $scope.isFileReaderAvailable = true;

      _setCurrentMember();
    })();

    /**
     * profile 설정 모달에서 사용되어질 멤버 변수를 초기화한다.
     * @private
     */
    function _setCurrentMember() {
      if (!!$scope.hasUpdatedProfilePic && !!$scope.curUser) {
        // profile picture 를 업데이트 한 후에도 모달이 살아있음.
        // 그럴때 멤버 프로필이 바뀌었다는 소켓 이벤트가 들어옴.
        // 이 경우에 멤버의 사진관련 정보만 업데이트를 함.
        // 어차피 다른 정보들은 모달이 닫힐거라 큰 신경을 안써도 됨.
        $scope.curUser = CurrentMemberProfile.replaceProfilePicture($scope.curUser);
      } else {
        $scope.curUser = _.cloneDeep(memberService.getMember());
      }

      // 서버에서 받은 유저 정보에 extraData가 없는 경우 공백을 넣는다.
      $scope.curUser.u_extraData.phoneNumber  = memberService.getPhoneNumber($scope.curUser) || "";
      $scope.curUser.u_extraData.department   = memberService.getDepartment($scope.curUser) || "";
      $scope.curUser.u_extraData.position     = memberService.getPosition($scope.curUser) || "";
    }


    /**
     * 현재 멤버의 정보가 바뀌었다는 뜻이므로 locally가지고 있는 멤버의 정보를 최신으로 업데이트한다.
     */
    $scope.$on('onCurrentMemberChanged', function() {
      _setCurrentMember();
    });


    /**
     * 사용자가 프로필을 변경하려 할 때 호출된다.
     */
    $scope.onProfileChangeClick = function() {
      if ($scope.isPristine()) {
        $scope.cancel();
        return;
      }

      if ($scope.isLoading) return;

      $scope.toggleLoading();

      updateProfile();

    };


    //  TODO: ie9에서 프로필 사진 바꾸기 기능이 없음.
    //  IE9에서 blob 읽는 법을 알아서 빨리 하기.
    $scope.onFileSelect = function($files) {
      for (var i = 0; i < $files.length; i++) {
        var file = $files[i];
        if (file.flashId) {
          $scope.isFileReaderAvailable = false;
          alert($filter('translate')('@ie9-profile-image-support'));
          return;
        }
        else {
          if(window.FileReader && file.type.indexOf('image') > -1) {
            $scope.isFileReaderAvailable = true;
            var fileReader = new FileReader();

            $scope.isProfilePicSelected = true;
            fileReader.onload = function(e) {
              $scope.$apply(function($scope) {
                $scope.croppedProfilePic = '';
                $scope.profilePic = e.target.result;
              });
            };
            fileReader.readAsDataURL($files[0]);
          }
        }
      }
    };

    /**
     * 프로필 사진 수정(crop)이 완료되면 호출한다.
     */
    $scope.onCropDone = function() {
      if ($scope.isLoading) return;

      if ($scope.croppedProfilePic) {
        $scope.toggleLoading();

        var blob = dataURItoBlob($scope.croppedProfilePic);

        updateProfilePicture(blob);

      } else {
        console.error('profile picture dataURI is invalid');
      }
    };

    // TODO: REFACTOR -> FILE SERVICE
    function dataURItoBlob (dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
      else
        byteString = unescape(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      return new Blob([ab],{type: 'image/png'});
    }

    /**
     * 수정이 끝날때마다 호출된다.
     * 그때 그때 파일을 $scope variable 로 옮긴다.
     * @param temp
     */
    $scope.onchange = function(tempPic) {
      $scope.croppedProfilePic = tempPic;
    };

    /**
     * 프로필 사진을 바꾸려다가 중간에 취소했을 경우 호출된다.
     */
    $scope.onProfilePicCancel = function() {
      $scope.isProfilePicSelected = false;
    };

    /**
     * 현재 보고 있는 프로필의 사진을 변경한다.
     * @param blob {blob} blob file of an image
     */
    function updateProfilePicture(blob) {
      // Since I'm calling 'updateProfilePic' api with blob file,
      // there might be an image file missing file extension.
      memberService.updateProfilePic(blob, $scope.isFileReaderAvailable)
        .success(function(response) {
          // TODO: Currently, there is no return value.  How about member object for return???
          memberService.getMemberInfo(memberService.getMemberId())
            .success(function(response) {
              //memberService.replaceProfilePicture(response);
              //memberService.setMember(response);
            });
          $scope.hasUpdatedProfilePic = true;
        })
        .error(function(error) {
          console.error('onCropDone', error.code, error.msg);
        })
        .finally(function() {
          $scope.toggleLoading();
          $scope.isProfilePicSelected = false;
        });
    }

    /**
     * 현재 보고 있는 프로필의 정보를 확인 후 업데이트한다.
     */
    function updateProfile() {
      if (!_isNamePristine()) {
        changeProfileName();
      } else if (!_isEmailPristine()) {
        changeProfileEmail();
      } else {
        changeProfileOtherInfo();
      }
    }

    /**
     * 현재 보고 있는 프로필의 이름을 바꾼다.
     */
    function changeProfileName() {
      // Name Change!!!
      memberService.setName(memberService.getName($scope.curUser))
        .success(closeModal)
        .error(function(err) {
          console.log(err);
        })
        .finally(function() {
          $scope.toggleLoading();
        });
    }

    /**
     * 현재 보고 있는 프로필의 이메일을 바꾼다.
     */
    function changeProfileEmail() {
      // email address changed!!
      memberService.setEmail(memberService.getEmail($scope.curUser))
        .success(
          closeModal
        )
        .error(function(err) {
          console.log(err);
        })
        .finally(function() {
          $scope.toggleLoading();
        });
    }

    /**
     * 현재 보고 있는 프로필의 다른 정보(추가 정보)들을 바꾼다.
     *   - 오늘의 기분, 전화번호, 부서, 그리고 직책
     */
    function changeProfileOtherInfo() {
      memberService.updateProfile($scope.curUser)
        .success(function(response) {
          closeModal();

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
        .error(function(error) {
          console.error('updateUserProfile', error.code, error.msg);
        })
        .finally(function() {
          $scope.toggleLoading();
        });
    }

    /**
     * 현재 보고 있는 프로필의 정보중 바뀐 곳이 있는지 없는지 확인하다.
     * @returns {*}
     */
    $scope.isPristine = function() {
      return _isNamePristine() && _isEmailPristine() && _isOtherInfoPristine();
    };

    /**
     * 이름이 바뀌었는지 안 바뀌었는지 확인한다.
     * @returns {*}
     * @private
     */
    function _isNamePristine() {
      return CurrentMemberProfile.isNamePristine($scope.curUser);
    }

    /**
     * 이메일주소가 바뀌었는지 안 바뀌었는지 확인한다.
     * @returns {*}
     * @private
     */
    function _isEmailPristine() {
      return CurrentMemberProfile.isEmailPristine($scope.curUser);
    }

    /**
     * 상태메세지를 포함한 추가 정보 중 하나라도 바뀌었는지 안 바뀌었는지 확인한다.
     * @returns {*}
     * @private
     */
    function _isOtherInfoPristine() {
      return CurrentMemberProfile.isStatusMessagePristine($scope.curUser) &&
        CurrentMemberProfile.isPhoneNumberPristine($scope.curUser) &&
        CurrentMemberProfile.isDepartmentPristine($scope.curUser) &&
        CurrentMemberProfile.isPositionPristine($scope.curUser);
    }

    /**
     * 모달창을 닫는다!!!
     */
    function closeModal() {
      modalHelper.closeModal('cancel');
    }
  }
})();
