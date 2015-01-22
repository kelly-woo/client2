'use strict';

var app = angular.module('jandiApp');

/*----------------------------

 Modal Controller
 - Everything happening when modal view is up is controlled by below controllers.

 ----------------------------*/

// CHANNEL JOIN
app.controller('joinModalCtrl', function($scope, $modalInstance, $state, userAPIservice, entityheaderAPIservice, analyticsService, accountService, memberService, publicService) {

  $scope.memberId = memberService.getMemberId();
  $scope.channelTitleQuery = '';

  $scope.cancel = function() {
    publicService.closeModal($modalInstance);
  };

  $scope.newChannel = function() {
    $scope.openModal('channel');
    this.cancel();
  };


  $scope.onJoinClick = function(entityId) {
    if ($scope.isLoading) return;

    $scope.toggleLoading();

    entityheaderAPIservice.joinChannel(entityId)
      .success(function() {
        // analytics
        analyticsService.mixpanelTrack( "topic Join" );

        $scope.updateLeftPanelCaller();
        $state.go('archives', {entityType:'channels', entityId:entityId});
        publicService.closeModal($modalInstance);
      })
      .error(function(error) {
        alert(error.msg);
      })
      .finally(function() {
        $scope.toggleLoading();
      });
  };

});

// PRIVATE_GROUP/CHANNEL CREATE
app.controller('createEntityModalCtrl', function($scope, $rootScope, $modalInstance, entityheaderAPIservice, $state, analyticsService) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onCreateClick = function(entityType, entityName) {

    $scope.isLoading = true;

    entityheaderAPIservice.createEntity(entityType, entityName)
      .success(function(response) {
        // analytics
        var entity_type = "";
        switch ($scope.currentEntity.type) {
          case 'channel':
            entity_type = "topic";
            break;
          case 'privateGroup':
            entity_type = "private group";
            break;
          default:
            entity_type = "invalid";
            break;
        }
        analyticsService.mixpanelTrack( "Entity Create", { "type": entity_type } );

        $rootScope.$emit('updateLeftPanelCaller');
        $state.go('archives', {entityType:entityType + 's', entityId:response.id});
        $modalInstance.dismiss('cancel');
        $scope.isLoading = false;
      })
      .error(function(response) {
        alert(response.msg);
        $scope.isLoading = false;
      });
  };
});

// DIRECT_MESSAGE
app.controller('userModalCtrl', function($scope, $modalInstance, $state) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onUserSelected = function(item) {
    $state.go('archives', {entityType:'users', entityId:item.id});
    this.cancel();
    item.visibility = true;
  };
});

// PRIVATE_GROUP/CHANNEL RENAME
app.controller('renameModalCtrl', function($scope, $modalInstance, entityheaderAPIservice, $state, $rootScope, analyticsService, fileAPIservice) {
  $scope.newChannelName = $scope.currentEntity.name;
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onRenameClick = function(entityNewName) {

    $scope.isLoading = true;

    entityheaderAPIservice.renameEntity($state.params.entityType, $state.params.entityId, entityNewName)
      .success(function(response) {
        // analytics
        var entity_type = "";
        switch ($state.params.entityType) {
          case 'channels':
            entity_type = "topic";
            break;
          case 'privategroups':
            entity_type = "private group";
            break;
          default:
            entity_type = "invalid";
            break;
        }
        analyticsService.mixpanelTrack( "Entity Name Change", { "type": entity_type } );

        $scope.updateLeftPanelCaller();
        fileAPIservice.broadcastChangeShared();
        $modalInstance.dismiss('cancel');
      })
      .error(function(response) {
        alert(response.msg);
        $scope.isLoading = false;
      })
  };
});

// PRIVATE_GROUP/CHANNEL INVITE
app.controller('inviteModalCtrl', function($scope, $modalInstance, entityheaderAPIservice, $state, $filter, analyticsService) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  generateInviteList();

  /*
   Generating list of users that are not in current channel or private group.
   */
  function generateInviteList() {
    var members = $scope.currentEntity.ch_members || $scope.currentEntity.pg_members;
    var totalUserList = $scope.memberList;

    $scope.availableMemberList = _.reject(totalUserList, function(user) { return members.indexOf(user.id) > -1 });
  }

  // See if 'user' is a member of current channel/privateGroup.
  $scope.isMember = function(user, entityType) {
    if (entityType == 'channel')
      return jQuery.inArray(user.id, $scope.currentEntity.ch_members) >  -1;

    return jQuery.inArray(user.id, $scope.currentEntity.pg_members) >  -1;
  };

  // Below function gets called when 'enter/click' happens in typeahead.
  // This function is buggyyyy
  // TODO : FIX IT!
  $scope.onUserSelected = function(selectedUser) {
    selectedUser.selected = true;
  };

  $scope.onInviteClick = function(entityType) {
    var guestList = [];

    if (angular.isUndefined($scope.userToInviteList)) return;

    if ($scope.isLoading) return;
    $scope.toggleLoading();

    angular.forEach($scope.userToInviteList, function(user) {
      this.push(user.id);
    }, guestList);

    entityheaderAPIservice.inviteUsers(entityType, $state.params.entityId, guestList)
      .success(function(response) {
        console.log(response)
        // analytics
        var entity_type = "";
        switch (entityType) {
          case 'channel':
            entity_type = "topic";
            break;
          case 'privateGroup':
            entity_type = "private group";
            break;
          default:
            entity_type = "invalid";
            break;
        }

        analyticsService.mixpanelTrack( "Entity Invite", { "type": entity_type, "count": guestList.length } );

        // TODO -  ASK JOHN FOR AN API THAT RETRIEVES UPDATED INFO OF SPECIFIC TOPIC/PG.
        $scope.updateLeftPanelCaller();

        $modalInstance.dismiss('success');
      })
      .error(function(error) {
        // TODO - TO JAY, MAYBE WE NEED TO SHOW MESSAGE WHY IT FAILED??
        console.error('inviteUsers', error.msg );
      })
      .finally(function() {
        $scope.toggleLoading();
      });
  };
});

// INVITE USER TO TEAM
app.controller('inviteUserToTeamCtrl', function($scope, $modalInstance, $filter, teamAPIservice, analyticsService) {

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onInviteClick = function() {
    if ($scope.isLoading) return;

    $scope.toggleLoading();


    var invites = [];
    $('input.invite').each(function(idx) {
      var input = $(this);
      if (input.val()) {
        invites.push(input.val());
        input.attr('id', input.val());
      }
    });

    // help message
    var help_missing = $filter('translate')('@alert-missing-info');
    var help_fail_send = $filter('translate')('@alert-send-mail-fail');
    var help_error_taken = $filter('translate')('@alert-send-mail-taken');
    var help_error_invalid = $filter('translate')('@alert-send-mail-invalid');
    var help_success_send = $filter('translate')('@alert-send-mail-success');

    // html fragment
    var html_noti_fail = '<div class="modal-noti-block"><h1>' + help_fail_send + '</h1></div>';
    var html_noti_success = '<div class="modal-noti-block alert-jandi alert-success"><h1>' + help_success_send + '</h1></div>';

    if (invites.length > 0) {
      teamAPIservice.inviteToTeam(invites)
        .success(function(response) {
          var successCnt = 0;
          var successList = [];
          var failList = [];

          _.forEach(response, function(value, index) {
            //console.log(value)
            var inviteStatus = '';
            angular.element(document.getElementById(value.email)).parent().children('.modal-noti-block_msg').remove();
            //console.log(angular.element(document.getElementById(value.email)).parent().children('.modal-noti-block_msg').remove())
            if (!value.success) {
              failList.push(value.email);

              if (value.msg.indexOf('already has membership') > -1) {
                inviteStatus = angular.element('<div class="modal-noti-block_msg alert-jandi alert-danger">'+ value.email+'<span>' + help_error_taken + '</span><div>');
              }
              else if (value.msg.indexOf('Invalid') > -1) {
                inviteStatus = angular.element('<div class="modal-noti-block_msg alert-jandi alert-danger">'+ value.email+'<span>' + help_error_invalid + '</span><div>');
              }
            }
            else {
              successCnt++;
              successList.push(value.email);
              inviteStatus = angular.element('<div class="modal-noti-block_msg alert-jandi alert-success"><span>' + help_success_send + '</span><div>');
            }

            angular.element(document.getElementById(value.email)).parent().append(inviteStatus)

          });

          if (successCnt > 0) {
            analyticsService.mixpanelTrack( "User Invite", { "count": successCnt } );
            analyticsService.mixpanelPeople( "increment", { "key": "invite", "value": successCnt } );
          }
        })
        .error(function(error) {
          console.error(error.code, error.msg);
        })
        .finally(function() {
          $scope.toggleLoading();
        });
    } else {
      $scope.toggleLoading();
      alert(help_missing);
    }
  };

  $scope.totalNumberOfInput = 0;

  $scope.onAddMoreClick = function() {
    var input_email = $filter('translate')('@input-invite-email');
    var invite_template = angular.element(
      '<div class="form-horizontal">' +
      '<input type="email" class="form-control invite" name="email" data-ng-required="true" placeholder="' + input_email + '" />' +
      '</div>'
    );
    $('.invite-team-body').append(invite_template);
  };
});

// WHEN INVITING FROM DIRECT MESSAGE
app.controller('inviteUsertoChannelCtrl', function($scope, $modalInstance, entityheaderAPIservice, publicService, $rootScope) {
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.inviteOptions = publicService.getInviteOptions($rootScope.joinedChannelList, $rootScope.privateGroupList, $scope.currentEntity.id);

  $scope.onInviteClick = function(inviteTo) {

    if ($scope.isLoading) return;

    $scope.toggleLoading();

    var invitedId = [];
    invitedId.push($scope.currentEntity.id);

    $scope.isLoading = true;

    entityheaderAPIservice.inviteUsers(inviteTo.type, inviteTo.id, invitedId)
      .success(function(response) {
        $scope.updateLeftPanelCaller();
        $modalInstance.dismiss('cancel');
      })
      .error(function(error) {
        console.error(error.code, error.msg);
      })
      .finally(function() {
        $scope.toggleLoading();
      });
  }
});

// FILE UPLOAD controller
app.controller('fileUploadModalCtrl', function($rootScope, $scope, $modalInstance, $window, fileAPIservice, analyticsService, $timeout) {
  $scope.isLoading = false;
  $scope.files = $scope.selectedFiles[0];

  // $scope.joinedChannelList 는 어차피 parent scope 에 없기때문에 rootScope까지 가서 찾는다. 그렇기에 left와 right panel 사이에 sync가 맞는다.
  $scope.selectOptions = fileAPIservice.getShareOptions($scope.joinedChannelList, $scope.userList, $scope.privateGroupList);

  $scope.fileInfo = {
    'title'         : $scope.files.name,
    'share'         : $scope.currentEntity,
    'isPrivateFile' : false
  };

  $scope.$watch('files', function(cur) {
    // uploading image file.
    var image_container = document.getElementById('file_preview_container');

    if (!$scope.supportHtml5 && angular.isDefined(cur)){
      // not supporting html5.
      FileAPI.Image(cur)
        .preview(464, 224)
        .get(function (err, img) {
          if( !err ) {
            // if there is any element other than flashimage div, remove it from parent including old flash image div.
            image_container.innerHTML = '';

            // append new flash image div.
            image_container.appendChild(img);
          }
          else {
            //console.log(err);
            alert('failed to load file. please try again.');
            $scope.cancel();
          }
        });
    }
  });


  var PRIVATE_FILE = 740;
  var PUBLIC_FILE = 744;

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  // TODO : CURRENTLY IT'S UPLOADING ONLY ONE FILE.  MODIFY LOGIC TO UPLOAD MULTIPLE FILES
  // Be aware of change in type of fileInfo.share (from Entity to entitiyId.)
  // $rootScope.fileQueue is a singleton variable.
  $scope.onFileUpload = function(fileInfo) {
    if ($scope.isLoading) return;

    $scope.toggleLoading();

    fileInfo.permission = PRIVATE_FILE;

    var share_type = fileInfo.share.type;

    if (share_type === 'channel') {
      fileInfo.permission = PUBLIC_FILE;
    }

    fileInfo.share = fileInfo.share.id;

    if (fileInfo.isPrivateFile) {
      fileInfo.permission = PRIVATE_FILE;
      fileInfo.share = '';
    }


    $rootScope.fileQueue = fileAPIservice.upload($scope.files, fileInfo, $scope.supportHtml5);

    $modalInstance.dismiss('cancel');
    $scope.toggleLoading();

    $rootScope.fileQueue
      .then(function(response) {
        if (angular.isUndefined(response)) {
          $rootScope.curUpload.status = 'error';
          $rootScope.curUpload.hasError = true;
          $rootScope.curUpload.progress = 0;

          $timeout(function() {
            $('.file-upload-progress-container').animate( {'opacity': 0 }, 500, function() {
              fileAPIservice.clearCurUpload();
            })
          }, 2000)
          return;
        }

        $rootScope.curUpload.status = 'done';

        // analytics
        var share_target = "";
        switch (share_type) {
          case 'channel':
            share_target = "topic";
            break;
          case 'privateGroup':
            share_target = "private group";
            break;
          case 'user':
            share_target = "direct message";
            break;
          default:
            share_target = "invalid";
            break;
        }

        var file_meta = (response.data.fileInfo.type).split("/");

        var upload_data = {
          "entity type"   : share_target,
          "category"      : file_meta[0],
          "extension"     : response.data.fileInfo.ext,
          "mime type"     : response.data.fileInfo.type,
          "size"          : response.data.fileInfo.size
        };

        analyticsService.mixpanelTrack( "File Upload", upload_data );
        fileAPIservice.broadcastChangeShared();

        $timeout(function() {
          $('.file-upload-progress-container').animate( {'opacity': 0 }, 500, function() {
            fileAPIservice.clearCurUpload();
          })
        }, 2000)



      }, function(error) {
        console.error('failed to upload file', error);
        $rootScope.curUpload.status = 'error';
        $rootScope.curUpload.hasError = true;
        $rootScope.curUpload.progress = 0;

        $timeout(function() {
          $('.file-upload-progress-container').animate( {'opacity': 0 }, 500, function() {
            fileAPIservice.clearCurUpload();
          })
        }, 2000)

      }, function(evt) {
        // progress
        $rootScope.curUpload = {};
        $rootScope.curUpload.title = evt.config.file.name;
        $rootScope.curUpload.progress = parseInt(100.0 * evt.loaded / evt.total);
        $rootScope.curUpload.status = 'uploading';

      });

  };
});

// FILE SHARE controller
app.controller('fileShareModalCtrl', function($scope, $modalInstance, fileAPIservice, analyticsService) {
  $scope.file             = $scope.fileToShare;
  $scope.shareChannel     = $scope.currentEntity;

//  removing already shared channels and privategroups but allowing users entitiy to be shared more than once.
//    var shareOptionsChannels = fileAPIservice.removeSharedEntities($scope.file, $scope.joinedChannelList)
//    var shareOptionsPrivates = fileAPIservice.removeSharedEntities($scope.file, $scope.privateGroupList)
//    $scope.selectOptions    = fileAPIservice.getShareOptions(shareOptionsChannels, $scope.userList, shareOptionsPrivates);

  var selectOptions    = fileAPIservice.getShareOptions($scope.joinedChannelList, $scope.memberList, $scope.privateGroupList);

  $scope.selectOptions = fileAPIservice.removeSharedEntities($scope.file, selectOptions);

  // If current channel is one of sharedEntities of 'file',
  // then select first entity in list.
  if ($scope.selectOptions.indexOf($scope.shareChannel) == -1 ) {
    $scope.shareChannel = $scope.selectOptions[0];
  }

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onFileShareClick = function(shareChannel, comment) {
    $scope.isLoading = true;
    fileAPIservice.addShareEntity($scope.file.id, shareChannel.id)
      .success(function() {
        // analytics
        var share_target = "";
        switch (shareChannel.type) {
          case 'channel':
            share_target = "topic";
            break;
          case 'privateGroup':
            share_target = "private group";
            break;
          case 'user':
            share_target = "direct message";
            break;
          default:
            share_target = "invalid";
            break;
        }
        var file_meta = ($scope.file.content.type).split("/");
        var share_data = {
          "entity type"   : share_target,
          "category"      : file_meta[0],
          "extension"     : $scope.file.content.ext,
          "mime type"     : $scope.file.content.type,
          "size"          : $scope.file.content.size
        };
        analyticsService.mixpanelTrack( "File Share", share_data );

        fileAPIservice.broadcastChangeShared($scope.file.id);
        $modalInstance.dismiss('cancel');
        $scope.isLoading = false;
      })
      .error(function(error) {
        console.error('onFileShareClick', error.code, error.msg);
        $scope.isLoading = false;
      });
  };
});

// PROFILE VIEW CONTROLLER
app.controller('profileViewerCtrl', function($scope, $rootScope, $modalInstance, curUser, entityAPIservice, $state) {
  $scope.curUser = curUser;

  $scope.onActionClick = function(actionType) {
    if (actionType === 'email') {

    }
    else if (actionType === 'file') {
      onFileListClick(curUser.id);
    }
    else if (actionType === 'directMessage') {
      $state.go('archives', { entityType: 'users',  entityId: curUser.id });
    }

    $modalInstance.dismiss('directing to DM');
  };

  //  right controller is listening to 'updateFileWriterId'.
  function onFileListClick (userId) {
    if ($state.current.name != 'messages.detail.files')
      $state.go('messages.detail.files');
    $scope.$emit('updateFileWriterId', userId);
  }
});

// PROFILE CONTROLLER
app.controller('profileCtrl', function($scope, $rootScope, $filter, $modalInstance, userAPIservice, $modal, analyticsService, memberService, accountService, publicService) {

  $scope.isLoading = false;

  $scope.curUser = _.cloneDeep(memberService.getMember());

  $scope.lang = accountService.getAccountLanguage();

  $scope.isProfilePicSelected = false;

  $scope.isFileReaderAvailable = true;

  // 서버에서 받은 유저 정보에 extraData가 없는 경우 초기화
  $scope.curUser.u_extraData.phoneNumber  = memberService.getPhoneNumber($scope.curUser) || "";
  $scope.curUser.u_extraData.department   = memberService.getDepartment($scope.curUser) || "";
  $scope.curUser.u_extraData.position     = memberService.getPosition($scope.curUser) || "";


  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onProfileChangeClick = function() {
    if ($scope.isLoading) return;

    $scope.toggleLoading();

    if (!isNamePristine()) {
      // Name Change!!!
      memberService.setName(memberService.getName($scope.curUser))
        .success(function() {
          ////TODO: Currently, there is no return value.  How about member object for return???
          memberService.getMemberInfo(memberService.getMemberId())
            .success(function(response) {
              memberService.setMember(response);
            })
            .error(function(err){
              console.log(err)
            })
        })
        .error(function(err) {
          console.log(err)
        })
        .finally(function() {
          $scope.toggleLoading();
        });
    }
    else if (!isEmailPristine()) {
      // email address changed!!

      memberService.setEmail(memberService.getEmail($scope.curUser))
        .success(function(response) {
          memberService.setMember(response);
        })
        .error(function(err) {
          console.log(err)
        })
        .finally(function() {
          $scope.toggleLoading();
        });
    }
    else if (!isLanguagePristine()) {
      // Language setting chagned.
      var lang = {
        lang: $scope.profileForm.preferencesLanguage.$viewValue
      };

      accountService.setAccountInfo(lang)
        .success(function(response) {
          accountService.setAccountLanguage(response.lang);
          publicService.getLanguageSetting(accountService.getAccountLanguage());
          publicService.setCurrentLanguage();
        })
        .error(function(err) {
          console.log(err)
        })
        .finally(function() {
          $scope.toggleLoading();
        })
    }
    else {
      memberService.updateProfile($scope.curUser)
        .success(function(response) {
          memberService.setMember(response);
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

  $scope.$watch('member', function() {
    $scope.curUser = _.cloneDeep(memberService.getMember());
  });

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
          fileReader.readAsDataURL($files[0]);

          $scope.isProfilePicSelected = true;

          fileReader.onload = function(e) {
            $scope.croppedProfilePic = '';
            $scope.profilePic = e.target.result;
          };
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
    return isNamePristine() && isEmailPristine() && isStatusPristine() && isPhoneNumberPristine() && isDepartmentPristine() && isPositionPristine() && isLanguagePristine();
  };

  function isNamePristine() {
    return memberService.getName($scope.curUser) == memberService.getName(memberService.getMember());
  }
  function isEmailPristine() {
    return $scope.curUser.u_email == memberService.getEmail(memberService.getMember());
  }
  function isStatusPristine() {
    return memberService.getStatusMessage($scope.curUser) == memberService.getStatusMessage(memberService.getMember());
  }
  function isPhoneNumberPristine() {
    return memberService.getPhoneNumber($scope.curUser) == memberService.getPhoneNumber(memberService.getMember());
  }
  function isDepartmentPristine() {
    return memberService.getDepartment($scope.curUser) == memberService.getDepartment(memberService.getMember());
  }
  function isPositionPristine() {
    return memberService.getPosition($scope.curUser) == memberService.getPosition(memberService.getMember());
  }

  function isLanguagePristine() {
    return $scope.profileForm.preferencesLanguage.$viewValue == accountService.getAccountLanguage();
  };
});

// ACCOUNT CONTROLLER
app.controller('accountController', function($state, $scope, $modalInstance, $filter, $timeout, userAPIservice, analyticsService) {

  $scope.status = {
    oneAtATime      : true,
    name: {
      open        : true,
      disabled    : false
    },
    password: {
      open            : false,
      disabled        : false
    },
    email: {
      open        : false,
      disabled    : true
    }
  };

  $scope.rename = {
    cur_password : {
      value   : '',
      error   : {
        status  : false,
        message : ''
      }
    },
    new_name : {
      value   : '',
      error   : {
        status  : false,
        message : ''
      }
    }
  };

  $scope.repassword = {
    cur_password : {
      value   : '',
      error   : {
        status  : false,
        message : ''
      }
    },
    new_password : {
      value   : '',
      error   : {
        status  : false,
        message : ''
      }
    },
    result : {
      status  : false,
      message : ''
    }
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onClickChangeName = function() {
    if (!$scope.rename.cur_password.value) {
      $scope.rename.cur_password.error = {
        status  : true,
        message : $filter('translate')('@alert-required')
      };
    } else {
      $scope.rename.cur_password.error.status = false;
      if (!$scope.rename.new_name.value) {
        $scope.rename.new_name.error = {
          status  : true,
          message : $filter('translate')('@alert-required')
        };
      } else {
        $scope.rename.new_name.error.status = false;
        $scope.isLoading = true;
        // Check current password
        userAPIservice.validateCurrentPassword($scope.rename.cur_password.value)
          .success(function() {
            // Update name
            userAPIservice.updateUserName($scope.rename.new_name.value)
              .success(function() {
                $scope.updateLeftPanelCaller();
                analyticsService.mixpanelTrack("Change Name");
                analyticsService.mixpanelPeople({'name':$scope.rename.new_name.value});
              })
              .error(function(err) {

              });
            $scope.rename.cur_password.value = "";
            $scope.rename.new_name.value = "";
            $scope.isLoading = false;
//                        $modalInstance.dismiss('cancel');
          })
          .error(function(err) {
            $scope.rename.cur_password.error = {
              status  : true,
              message : $filter('translate')('@alert-invalid-password')
            };
            $scope.isLoading = false;
          });
      }
    }
  };

  $scope.onClickChangePassword = function() {
    if (!$scope.repassword.cur_password.value) {
      $scope.repassword.cur_password.error = {
        status  : true,
        message : $filter('translate')('@alert-required')
      };
    } else {
      $scope.repassword.cur_password.error.status = false;
      if (!$scope.repassword.new_password.value) {
        $scope.repassword.new_password.error = {
          status  : true,
          message : $filter('translate')('@alert-required')
        };
      } else {
        $scope.repassword.new_password.error.status = false;
        $scope.isLoading = true;
        // Check current password
        userAPIservice.validateCurrentPassword($scope.repassword.cur_password.value)
          .success(function() {
            // Update password
            userAPIservice.updatePassword($scope.repassword.new_password.value)
              .success(function() {
                $scope.repassword.result = {
                  status  : true,
                  message : $filter('translate')('@alert-update-success')
                }
                analyticsService.mixpanelTrack("Change Password");


              })
              .error(function(err) {
                $scope.repassword.new_password.error = {
                  status  : true,
                  message : $filter('translate')('@alert-update-fail')
                }
              });
            $scope.repassword.cur_password.value = "";
            $scope.repassword.new_password.value = "";
            $scope.isLoading = false;
          })
          .error(function(err) {
            $scope.repassword.cur_password.error = {
              status  : true,
              message : $filter('translate')('@alert-invalid-password')
            };
            $scope.isLoading = false;
          });

        // 메세지 출력 후 숨기기
        $timeout(function() {
          $scope.repassword.result.status = false;
        }, 3000);
      }
    }
  };
});

// PREFERENCES CONTROLLER
app.controller('preferencesController', function($state, $stateParams, $scope, $rootScope, $modalInstance) {
  $scope.currentLang = $rootScope.preferences.language;
  $scope.listLangs = [
    { "value": "ko",    "text": "한국어" },
    { "value": "en_US", "text": "English" },
    { "value": "zh_CN", "text": "简体中文 " },
    { "value": "zh_TW", "text": "繁體中文" },
    { "value": "ja",    "text": "日本語"}

  ];

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onClickConfirm = function(currentLang) {
    $scope.isLoading = true;

    // 언어 변경
    $rootScope.setLang(currentLang);

    $scope.isLoading = false;

    // 현재 state 다시 로드
    $state.transitionTo($state.current, $stateParams, {
      reload: true,
      inherit: false,
      notify: true
    });

    $modalInstance.dismiss('cancel');

  };
});

// PASSWORD RESET CONTROLLER
app.controller('passwordRequestController', function($rootScope, $scope, $modalInstance, authAPIservice, $filter) {
  $scope.onLoadDone = true;

  $('#passwordResetEmailInput').focus();
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onPasswordResetRequstClick = function(email) {
    if ($scope.isLoading) return;
    $scope.toggleLoading();

    authAPIservice.requestPasswordEmail(email)
      .success(function(response) {
        $scope.emailSent = true;
      })
      .error(function(response) {
        console.log(response)
        alert($filter('translate')('@password-reset-email-fail'));
      })
      .finally(function() {
        $scope.toggleLoading();
      });


  }
});

// TEAM SETTING CONTROLLER
app.controller('teamSettingController', function($state, $stateParams, $scope, $rootScope, $modalInstance, $filter, $timeout, userAPIservice, teamAPIservice, $window, configuration, analyticsService, accountService) {

  $scope.status = {
    oneAtATime      : true,
    name: {
      open        : true,
      disabled    : false
    },
    url: {
      open            : false,
      disabled        : false
    },
    delete: {
      open        : false,
      disabled    : false
    }
  };

  $scope.team.newName = $scope.team.name;
  $scope.team.newDomain  = $scope.team.t_domain;

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onTeamNameUpdateClick = function(team) {
    if (!confirm($filter('translate')('@setting-team-name-confirm'))) {
      return;
    }

    $scope.isLoading = true;
    var mixPanel_event = "Domain Change";

    teamAPIservice.updateTeamName(team.newName)
      .success(function(response) {
        updateMixPanel(mixPanel_event, team.newName);
      })
      .error( function(err) {
        handleTeamSettingAPIError(err);
      })
  };

  $scope.onTeamURLUpdateClick = function(team) {
    if (!confirm($filter('translate')('@setting-team-domain-confirm'))) {
      return;
    }

    if ($scope.isLoading) return;

    $scope.isLoading = true;
    var mixPanel_event = "Team Name Change";

    // Placed '$scope.isLoading = false;' so many times in different places because of timing issue.
    // I could have just put in finally block of first api call, but then loading screen disappears too fast.
    accountService.validateCurrentPassword(team.passwordConfirm)
      .success(function(response) {
        if (response.valid) {
          teamAPIservice.updatePrefixDomain(team.newDomain)
            .success(function(response) {
              //updateMixPanel(mixPanel_event, team.t_domain);
              team.passwordConfirm = '';
            })
            .error(function(err) {
              handleTeamSettingAPIError(err);
            })
            .finally(function() {
              $scope.isLoading = false;
              team.passwordConfirm = '';
            });
        }
        else {
          handleTeamSettingAPIError();
          $scope.isLoading = false;
          team.passwordConfirm = '';
        }
      })
      .error(function(err) {
        handleTeamSettingAPIError(err);
        $scope.isLoading = false;
        team.passwordConfirm = '';
      })
      .finally(function() {
      });
  };

  $scope.onTeamDeleteClick = function(team) {
    if (!confirm($filter('translate')('@setting-team-delete-confirm'))) {
      return;
    }

    $scope.isLoading = true;

    accountService.validateCurrentPassword(team.deletePasswordConfirm)
      .success(function(response) {
        if (response.valid) {
          // password confirmed.
          teamAPIservice.deleteTeam()
            .success(function(response) {
              $modalInstance.dismiss('cancel');
              $window.location.replace('https://www.jandi.com');
            })
            .error(function(err) {
              team.deletePasswordConfirm = '';
              handleTeamSettingAPIError(err);
            });
        }
        else {
          team.deletePasswordConfirm = '';
          handleTeamSettingAPIError();
        }

      })
      .error(function(err) {
        team.deletePasswordConfirm ='';
        handleTeamSettingAPIError(err);
      });
  };

  function updateMixPanel(eventToTrack, value) {
    analyticsService.mixpanelTrack(eventToTrack);

    // now eventToTrack = 'team_name_change'
    eventToTrack = $filter('getMixPanelFormat')(eventToTrack);

    var libName = eventToTrack.indexOf('domain') ? 'team_domain' : 'team_name';

    mixpanel.init(configuration.mp_token, {
      'ip'    : false,
      'loaded' : function(){
        updateMixPanelForMember(libName, value);
      }
    },  libName);
  }

  function updateMixPanelForMember(libName, value) {
    var localLib;
    if (libName === 'team_name')
      localLib = mixpanel.team_name;
    else
      localLib = mixpanel.team_domain;

    _.forEach($scope.userList, function(member) {
      localLib.cookie.clear();
      localLib.identify(member.id + '-' + $scope.team.id);

      custom_mixpanel_people_set_helper(libName, value);
    });

    handleTeamSettingAPISuccess();
  }

  function custom_mixpanel_people_set_helper(libName, value) {
    if (libName === 'team_name') {
      custom_mixpanel_people_set( { 'team_name' : value } );
    }
    else
      custom_mixpanel_people_set( { 'team_domain' : value } );
  }

  function handleTeamSettingAPIError(err) {
    $scope.team.passwordConfirm = '';
    $('#teamURLPassword').focus();
    $scope.isLoading = false;
    alert($filter('translate')('@common-api-error-msg'));
  }

  function handleTeamSettingAPISuccess() {
    $scope.isLoading = false;

    $modalInstance.dismiss('cancel');

    // 현재 state 다시 로드
    $state.transitionTo($state.current, $stateParams, {
      reload: true,
      inherit: false,
      notify: true
    });
  }

  $scope.isNewUrlPristine = function() {
    return $scope.team.newDomain == $scope.team.t_domain;
  };
});

