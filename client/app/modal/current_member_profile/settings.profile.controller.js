// PROFILE CONTROLLER
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('profileCtrl', profileCtrl);

  /* @ngInject */
  function profileCtrl($scope, modalHelper, $filter, analyticsService, memberService, accountService, currentMemberProfileService) {

    (function() {
      _setCurrentMember();

      $scope.lang = accountService.getAccountLanguage();

      $scope.isProfilePicSelected = false;
      $scope.isFileReaderAvailable = true;
    })();

    function _setCurrentMember() {
      $scope.curUser = _.cloneDeep(memberService.getMember());

      // 서버에서 받은 유저 정보에 extraData가 없는 경우 초기화
      $scope.curUser.u_extraData.phoneNumber  = memberService.getPhoneNumber($scope.curUser) || "";
      $scope.curUser.u_extraData.department   = memberService.getDepartment($scope.curUser) || "";
      $scope.curUser.u_extraData.position     = memberService.getPosition($scope.curUser) || "";
    }

    $scope.$on('onCurrentMemberChanged', function() {
      _setCurrentMember();
    });

    $scope.cancel = function() {
      closeModal();
    };

    $scope.onProfileChangeClick = function() {
      if ($scope.isLoading) return;

      $scope.toggleLoading();

      if (!_isNamePristine()) {
        // Name Change!!!
        memberService.setName(memberService.getName($scope.curUser))
          .success(function() {
            ////TODO: Currently, there is no return value.  How about member object for return???
            memberService.getMemberInfo(memberService.getMemberId())
              .success(function(response) {
                closeModal();
              })
              .error(function(err){
                console.log(err);
              })
          })
          .error(function(err) {
            console.log(err);
          })
          .finally(function() {
            $scope.toggleLoading();
          });
      } else if (!_isEmailPristine()) {
        // email address changed!!
        memberService.setEmail(memberService.getEmail($scope.curUser))
          .success(function(response) {
            closeModal();
          })
          .error(function(err) {
            console.log(err);
          })
          .finally(function() {
            $scope.toggleLoading();
          });
      } else {
        memberService.updateProfile($scope.curUser)
          .success(function(response) {
            memberService.setMember(response);
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

    $scope.onCropDone = function() {
      if ($scope.isLoading) return;

      $scope.toggleLoading();

      var blob = dataURItoBlob($scope.croppedProfilePic);

      // Since I'm calling 'updateProfilePic' api with blob file,
      // there might be an image file missing file extension.
      memberService.updateProfilePic(blob, $scope.isFileReaderAvailable)
        .success(function(response) {
          // TODO: Currently, there is no return value.  How about member object for return???
          memberService.getMemberInfo(memberService.getMemberId())
            .success(function(response) {
              memberService.setMember(response);
            })
        })
        .error(function(error) {
          console.error('onCropDone', error.code, error.msg);
        })
        .finally(function() {
          $scope.toggleLoading();
          $scope.isProfilePicSelected = false;
        });
    };

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

    $scope.onchange = function(temp) {
      $scope.croppedProfilePic = temp;
    };
    $scope.onProfilePicCancel = function() {
      $scope.isProfilePicSelected = false;
    };

    $scope.isPristine = function() {
      return _isNamePristine() && _isEmailPristine() &&
              currentMemberProfileService.isStatusMessagePristine($scope.curUser) &&
              currentMemberProfileService.isPhoneNumberPristine($scope.curUser) &&
              currentMemberProfileService.isDepartmentPristine($scope.curUser) &&
              currentMemberProfileService.isPositionPristine($scope.curUser);
    };

    function _isNamePristine() {
      return currentMemberProfileService.isNamePristine($scope.curUser)
    }
    function _isEmailPristine() {
      return currentMemberProfileService.isEmailPristine($scope.curUser)
    }
    function closeModal() {
      modalHelper.closeModal('cancel');
    }
  }
})();