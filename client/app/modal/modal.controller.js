'use strict';

var app = angular.module('jandiApp');

/*----------------------------

 Modal Controller
 - Everything happening when modal view is up is controlled by below controllers.

 ----------------------------*/

// CHANNEL JOIN
app.controller('joinModalCtrl', function($scope, $modalInstance, $state, userAPIservice, entityheaderAPIservice, analyticsService) {

    $scope.userId = $scope.user.id;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    // Returns a list of channels that current user hasn't joined yet.
    $scope.isNotMember = function(channel) {
        //console.log(jQuery.inArray($scope.user.id, channel.ch_members))
        return jQuery.inArray($scope.user.id, channel.ch_members) ==  -1;
    };

    // Returns a name of user whose id is 'id'
    $scope.getName = function(id) {
        if (angular.equals(id, $scope.userId)) {
            return 'you';
        }

        return userAPIservice.getNameFromUserId(id);
    };

    $scope.newChannel = function() {
        $scope.openModal('channel');
        this.cancel();
    };


    $scope.onJoinClick = function(entityId) {
        $scope.isLoading = true;
        entityheaderAPIservice.joinChannel(entityId)
            .success(function() {
                // analytics
                analyticsService.mixpanelTrack( "Channel Join" );

                $scope.isLoading = false;
                $scope.updateLeftPanelCaller();
                $state.go('archives', {entityType:'channels', entityId:entityId});
                $modalInstance.dismiss('cancel');
            })
            .error(function(error) {
                $scope.isLoading = false;
                alert(error.msg);
            });
    };
});

// PRIVATE_GROUP/CHANNEL CREATE
app.controller('createEntityModalCtrl', function($scope, $modalInstance, entityheaderAPIservice, $state, analyticsService) {
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
                        entity_type = "channel";
                        break;
                    case 'privateGroup':
                        entity_type = "private";
                        break;
                    default:
                        entity_type = "invalid";
                        break;
                }
                analyticsService.mixpanelTrack( "Entity Create", { "type": entity_type } );

                $scope.updateLeftPanelCaller();
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
app.controller('renameModalCtrl', function($scope, $modalInstance, entityheaderAPIservice, $state, $rootScope, analyticsService) {
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
                        entity_type = "channel";
                        break;
                    case 'privategroups':
                        entity_type = "private";
                        break;
                    default:
                        entity_type = "invalid";
                        break;
                }
                analyticsService.mixpanelTrack( "Entity Name Change", { "type": entity_type } );

                $scope.updateLeftPanelCaller();
                $rootScope.$emit('updateSharedEntities');
                $modalInstance.dismiss('cancel');
                $scope.isLoading = false;
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
        var totalUserList = $scope.userList;

        $scope.userList = _.reject(totalUserList, function(user) { return members.indexOf(user.id) > -1 });
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

        angular.forEach($filter('filter')($scope.userList, {'selected':true}), function(user) {
            this.push(user.id);
        }, guestList);

        if (guestList.length== 0) {
            // TODO: 한글화
            alert("No one to invite.  I guess you don't have that many friends.");
            return;
        }

        $scope.isLoading = true;

        entityheaderAPIservice.inviteUsers(entityType, $state.params.entityId, guestList)
            .success(function() {
                // analytics
                var entity_type = "";
                switch (entityType) {
                    case 'channel':
                        entity_type = "channel";
                        break;
                    case 'privateGroup':
                        entity_type = "private";
                        break;
                    default:
                        entity_type = "invalid";
                        break;
                }
                analyticsService.mixpanelTrack( "Entity Invite", { "type": entity_type, "count": guestList.length } );

                $scope.isLoading = false;
                $modalInstance.dismiss('cancel');
                $scope.updateLeftPanelCaller();     // is this necessary?
            })
            .error(function(error) {
                console.error('inviteUsers', error.msg );
                $scope.isLoading = false;
            });
    };
});

// INVITE USER TO TEAM
app.controller('inviteUserToTeamCtrl', function($scope, $modalInstance, $filter, teamAPIservice, analyticsService) {
    $scope.isLoading = false;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.onInviteClick = function() {
        $scope.isLoading = true;

        var invites = [];
        var cur = {};
        var hasAllInformation = false;

        $('input.invite').each(function(idx) {
            var currentDomInput = $(this);

            switch(currentDomInput.attr('name')) {
                case 'email':
                    hasAllInformation = false;
                    cur.email = currentDomInput.val();
                    break;
                case 'lastName':
                    cur.lastName = currentDomInput.val();
                    break;
                case 'firstName':
                    cur.firstName = currentDomInput.val();

                    if ( cur.email === '' || cur.lastName === '' || cur.firstName === '') {
                        cur = {};
                        break;
                    }
                    invites.push(cur);
                    cur = {};
                    hasAllInformation = true;
                    break;
                default :
                    console.warn('onInviteClick', idx);
            }
        });

        // help message
        var help_missing = $filter('translate')('Missing Information');
        var help_fail_send = $filter('translate')('Failed to send email');
        var help_error_taken = $filter('translate')('is already member of your team');
        var help_error_invalid = $filter('translate')('is invalid email address');
        var help_success_send = $filter('translate')('Sent the invitation mail successfully');
        // html fragment
        var html_noti_fail = '<div class="modal-noti-block"><h1>' + help_fail_send + '</h1></div>';
        var html_noti_success = '<div class="modal-noti-block alert-jandi alert-success"><h1>' + help_success_send + '</h1></div>';

        $scope.hasAllInformation = hasAllInformation;

        if (invites.length == 0) {
            $scope.isLoading = false;
            alert(help_missing);
        }

        if (invites.length > 0) {
            teamAPIservice.inviteToTeam(invites)
                .success(function(response) {
                    $scope.isLoading = false;
                    if ( response.sendMailFailCount > 0 ) {
                        $('.invite-team-body').html(html_noti_fail);

                        var failEmailAddressElement = '';
                        angular.forEach(response.sendMailFailList, function(object) {
                            if (object.error.httpResponseCode == 400) {
                                failEmailAddressElement = angular.element('<div class="modal-noti-block_msg alert-jandi alert-danger">'+ object.email+'<span>' + help_error_taken + '</span><div>');
                            }
                            else {
                                failEmailAddressElement = angular.element('<div class="modal-noti-block_msg alert-jandi alert-danger">'+ object.email+'<span>' + help_error_invalid + '</span><div>');
                            }
                            $('.invite-team-body').append(failEmailAddressElement);
                        });
                    }
                    else {
                        $('.invite-team-body').html(html_noti_success);

                        // analytics: n명 초대
                        var send_count = response.sendMailSuccessCount;
                        analyticsService.mixpanelTrack( "User Invite", { "count": send_count } );
                        analyticsService.mixpanelPeople( "increment", { "key": "invite", "value": send_count } );
                    }

                    $('#invite_to_team').hide();

                })
                .error(function(error) {
                    $scope.isLoading = false;
                    console.error(error.code, error.msg);
                });
        }
        else  {
            $scope.isLoading = false;
        }
    };

    $scope.totalNumberOfInput = 0;

    $scope.onAddMoreClick = function() {
        var input_email = $filter('translate')('Email');
        var input_lname = $filter('translate')('Last Name');
        var input_fname = $filter('translate')('First Name');
        var invite_template = angular.element('<div class="form-horizontal">' +
            '<div class="email_container"><input type="email" class="form-control invite" name="email" ng-required="true" placeholder="' + input_email + '"/></div>' +
            '<div class="firstName_container"><input type="text" class="form-control invite" name="lastName" ng-required="true" placeholder="' + input_lname + '"/></div>' +
            '<div class="lastName_container"><input type="text" class="form-control invite" name="firstName" ng-required="true" placeholder="' + input_fname + '"/></div>' +
            '</div>');
        $('.invite-team-body').append(invite_template);
    };
});

// WHEN INVITING FROM DIRECT MESSAGE
app.controller('inviteUsertoChannelCtrl', function($scope, $modalInstance, entityheaderAPIservice) {
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.inviteOptions = entityheaderAPIservice.getInviteOptions($scope.joinedChannelList, $scope.privateGroupList);

    $scope.onInviteClick = function(inviteTo) {

        if (angular.isUndefined(inviteTo)) {
            alert('Please select channel/private group.');
            return;
        }

        if (inviteTo.type == 'channel') {
            if (inviteTo.ch_members.indexOf($scope.currentEntity.id) > -1) {
                $modalInstance.dismiss('cancel');
                return;
            }
        }
        else {
            if (inviteTo.pg_members.indexOf($scope.currentEntity.id) > -1) {
                $modalInstance.dismiss('cancel');
                return;
            }
        }

        var id = [];
        id.push($scope.currentEntity.id);

        $scope.isLoading = true;

        entityheaderAPIservice.inviteUsers(inviteTo.type, inviteTo.id, id)
            .success(function(response) {
                $scope.updateLeftPanelCaller();
                $modalInstance.dismiss('cancel');
                $scope.isLoading = false;
            })
            .error(function(error) {
                console.error(error.code, error.msg);
                $scope.isLoading = false;
            });
    }
});

// FILE UPLOAD controller
app.controller('fileUploadModalCtrl', function($scope, $modalInstance, fileAPIservice, analyticsService) {
    $scope.isLoading = false;
    $scope.files = $scope.selectedFiles[0];

    // $scope.joinedChannelList 는 어차피 parent scope 에 없기때문에 rootScope까지 가서 찾는다. 그렇기에 left와 right panel 사이에 synch가 맞는다.
    $scope.selectOptions = fileAPIservice.getShareOptions($scope.joinedChannelList, $scope.userList, $scope.privateGroupList);

    $scope.fileInfo = {
        'title'         : $scope.files.name,
        'share'         : $scope.currentEntity,
        'isPrivateFile' : false
    };

    var PRIVATE_FILE = 740;
    var PUBLIC_FILE = 744;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    // TODO : CURRENTLY IT'S UPLOADING ONLY ONE FILE.  MODIFY LOGIC TO UPLOAD MULTIPLE FILES
    // Be aware of change in type of fileInfo.share (from Entity to entitiyId.)
    $scope.onFileUpload = function(fileInfo) {
        fileInfo.permission = PRIVATE_FILE;

        var share_type = fileInfo.share.type;

        if (fileInfo.share.type == 'channel') {
            fileInfo.permission = PUBLIC_FILE;
        }

        fileInfo.share = fileInfo.share.id;

        if (fileInfo.isPrivateFile) {
            fileInfo.permission = PRIVATE_FILE;
            fileInfo.share = '';
        }
        $scope.isLoading = true;

        var fileQueue = fileAPIservice.upload($scope.files, fileInfo);

        fileQueue.then(function(response) {
            // analytics
            var share_target = "";
            switch (share_type) {
                case 'channel':
                    share_target = "channel";
                    break;
                case 'privateGroup':
                    share_target = "private";
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
                "extension"     : file_meta[1],
                "mime type"     : response.data.fileInfo.type,
                "size"          : response.data.fileInfo.size
            };
            analyticsService.mixpanelTrack( "File Upload", upload_data );

            fileAPIservice.broadcastChangeShared();
            $modalInstance.dismiss('cancel');
            $scope.isLoading = false;
        }, function(error) {
            console.error('failed to upload file', error);
            $scope.isLoading = false;
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

    var selectOptions    = fileAPIservice.getShareOptions($scope.joinedChannelList, $scope.userList, $scope.privateGroupList);

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
                        share_target = "channel";
                        break;
                    case 'privateGroup':
                        share_target = "private";
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
                    "extension"     : file_meta[1],
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

//  PROFILE CONTROLLER
app.controller('profileCtrl', function($scope, $rootScope, $modalInstance, userAPIservice, $modal, analyticsService) {
    $scope.curUser = _.cloneDeep($scope.user);
    // 서버에서 받은 유저 정보에 extraData가 없는 경우 초기화
    $scope.curUser.u_extraData.phoneNumber  = $scope.curUser.u_extraData.phoneNumber || "";
    $scope.curUser.u_extraData.department   = $scope.curUser.u_extraData.department || "";
    $scope.curUser.u_extraData.position     = $scope.curUser.u_extraData.position || "";

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.onProfileChangeClick = function() {
        $scope.isLoading = true;

        /*
         TODO:  Success response has updated user entitiy.
         TODO:  Instead of updating left panel, just switch scope variable!!!!!!!
        */
        userAPIservice.updateUserProfile($scope.curUser)
            .success(function() {
                // analytics
                analyticsService.mixpanelTrack( "Set Profile" );
                var profile_data = {
                    "nickname"  : $scope.curUser.u_nickname,
                    "mobile"    : $scope.curUser.u_extraData.phoneNumber,
                    "division"  : $scope.curUser.u_extraData.department,
                    "position"  : $scope.curUser.u_extraData.position
                };
                analyticsService.mixpanelPeople( "set", profile_data );

                $scope.updateLeftPanelCaller();
                $scope.isLoading = false;
                $modalInstance.dismiss('cancel');
            })
            .error(function(error) {
                console.error('updateUserProfile', error.code, error.msg);
                $scope.isLoading = false;

            });
    };

    $scope.$watch('user', function() {
        $scope.curUser = _.cloneDeep($scope.user);
    });

    $scope.onFileSelect = function($files) {

        var fileReader = new FileReader();
        fileReader.readAsDataURL($files[0]);

        fileReader.onload = function(e) {
            var modalInstance = $modal.open({
                scope       :   $scope,
                templateUrl :   'app/modal/image.crop.html',
                size        :   'lg',
                windowClass :   'wide',
                controller  :   'imageCropCtrl',
                resolve     : {
                    myImage     : function() { return e.target.result; }
                }
            });

            modalInstance.result.then(
                function(result) {
                    $scope.updateLeftPanelCaller();
                },
                function() {
                    console.log('no chagnes')
                });
        };
    };
});

//  IMAGE CROP CONTROLLER
app.controller('imageCropCtrl', function($scope, $rootScope, $modalInstance, myImage, userAPIservice) {
    $scope.profilePic = myImage;
    $scope.croppedProfilePic = '';

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.onCropDone = function() {
        var blob = dataURItoBlob($scope.croppedProfilePic);
        $scope.isLoading = true;

        userAPIservice.updateProfilePic(blob)
            .success(function(response) {
                $modalInstance.close('success');
            })
            .error(function(error) {
                console.error('onCropDone', error.code, error.msg);
                $scope.isLoading = false;

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
});

//  PROFILE VIEW CONTROLLER
app.controller('profileViewerCtrl', function($scope, $rootScope, $modalInstance, curUser, entityAPIservice, $state) {
    $scope.curUser = entityAPIservice.getEntityFromListById($rootScope.userList, curUser.id);

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
    };
});

//  PREFERENCES CONTROLLER
app.controller('preferencesController', function($scope, $rootScope, $modalInstance, gettextCatalog) {
    $scope.currentLang = gettextCatalog.currentLanguage;
    $scope.listLangs = [
        { "value": "ko_KR", "text": "한국어" },
        { "value": "en_US", "text": "English" }
    ];

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.onClickConfirm = function(currentLang) {
        $scope.isLoading = true;
        console.debug(currentLang);

        gettextCatalog.setCurrentLanguage(currentLang);

        $scope.isLoading = false;
        $modalInstance.dismiss('cancel')
    };
});
