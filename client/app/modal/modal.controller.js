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
app.controller('renameModalCtrl', function($scope, $modalInstance, entityheaderAPIservice, $state, $filter, analyticsService, fileAPIservice) {
  $scope.newTopicName = $scope.currentEntity.name;
  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };

  $scope.onRenameClick = function(newTopicName) {

    $scope.isLoading = true;

    entityheaderAPIservice.renameEntity($state.params.entityType, $state.params.entityId, newTopicName)
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
        _onCreateError(response);
      })
      .finally(function() {
        $scope.isLoading = false;
      });

    // todo: error handling service 필요함
    var duplicate_name_error = 4000;
    function _onCreateError(err) {
      if (err.code == duplicate_name_error) {
        // Duplicate name error.
        alert($filter('translate')('@common-duplicate-name-err'));
      }
    }
  };
});

// PRIVATE_GROUP/CHANNEL INVITE
app.controller('inviteModalCtrl', function($scope, $rootScope, $modalInstance, entityheaderAPIservice, $state, $filter, analyticsService) {
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

    $scope.availableMemberList = _.reject(totalUserList, function(user) { return members.indexOf(user.id) > -1 || user.status == 'disabled' });
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
        //console.log(response)
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
        $rootScope.$broadcast('updateLeftPanelCaller');

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

  $scope.toggleLoading = function() {
    $scope.isLoading = !$scope.isLoading;
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

// FILE SHARE controller
app.controller('fileShareModalCtrl', function($scope, $modalInstance, fileAPIservice, analyticsService) {
  $scope.file             = $scope.fileToShare;
  $scope.shareChannel     = $scope.currentEntity;

//  removing already shared channels and privategroups but allowing users entitiy to be shared more than once.
//    var shareOptionsChannels = fileAPIservice.removeSharedEntities($scope.file, $scope.joinedChannelList)
//    var shareOptionsPrivates = fileAPIservice.removeSharedEntities($scope.file, $scope.privateGroupList)
//    $scope.selectOptions    = fileAPIservice.getShareOptions(shareOptionsChannels, $scope.userList, shareOptionsPrivates);

  var selectOptions    = fileAPIservice.getShareOptions($scope.joinedEntities, $scope.memberList);

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

  $scope.isUserDisabled = $scope.curUser.status == 'disabled';
  $scope.isMyself = $scope.curUser == $scope.member;

  $scope.onActionClick = function(actionType) {

    if (actionType === 'email') {
      if ($scope.isUserDisabled) return;

      window.location.href = "mailto:"+$scope.curUser.u_email;
    }
    else if (actionType === 'file') {
      onFileListClick(curUser.id);
    }
    else if (actionType === 'directMessage') {
      if ($scope.isUserDisabled || $scope.isMyself) return;

      $state.go('archives', { entityType: 'users',  entityId: curUser.id });
    }

    $modalInstance.dismiss('directing to DM');
  };

  //  right controller is listening to 'updateFileWriterId'.
  function onFileListClick (userId) {
    if ($state.current.name != 'messages.detail.files')
      $state.go('messages.detail.files');
    $scope.$emit('updateFileWriterId', userId);
    $rootScope.$broadcast('setFileTabActive');

  }
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
