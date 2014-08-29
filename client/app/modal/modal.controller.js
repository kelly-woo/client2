'use strict';

var app = angular.module('jandiApp');

/*----------------------------

 Modal Controller
 - Everything happening when modal view is up is controlled by below controllers.

 ----------------------------*/

// CHANNEL JOIN
var joinModalCtrl = function($scope, $modalInstance, entityheaderAPIservice, $state, $filter, $rootScope) {
    $scope.userId               = $scope.user.id;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    }

    // Returns a list of channels that current user hasn't joined yet.
    $scope.isNotMember = function(channel) {
        console.log(jQuery.inArray($scope.user.id, channel.ch_members))
        return jQuery.inArray($scope.user.id, channel.ch_members) ==  -1;
    }

    // Returns a name of user whose id is 'id'
    $scope.getName = function(id) {
        if (angular.equals(id, $scope.userId)) {
            return 'you';
        }

        var temp = entityheaderAPIservice.getEntityFromListById($scope.userList, id);

        return $filter('getFirstLastNameOfUser')(temp);
    }

    $scope.newChannel = function() {
        $scope.openModal('channel');
        this.cancel();
    };

    $scope.isLoading = true;

    $scope.onJoinClick = function(entityId) {
        entityheaderAPIservice.joinChannel(entityId)
            .success(function(response) {
                $scope.isLoading = false;
                $scope.updateLeftPanelCaller();
                $state.go('archives', {entityType:'channels', entityId:entityId});
                $modalInstance.dismiss('cancel');
            })
            .error(function(response) {
                $scope.isLoading = false;
                alert(response.msg);
            })
    }
}

// PRIVATE_GROUP/CHANNEL CREATE
var createEntityModalCtrl = function($scope, $modalInstance, entityheaderAPIservice, $state) {

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    $scope.isLoading = true;

    $scope.onCreateClick = function(entityType, entityName) {
        entityheaderAPIservice.createEntity(entityType, entityName)
            .success(function(response) {
                $scope.updateLeftPanelCaller();
                $state.go('archives', {entityType:entityType + 's', entityId:response.id});
                $modalInstance.dismiss('cancel')
                $scope.isLoading = false;
            })
            .error(function(response) {
                alert(response.msg);
                $scope.isLoading = false;
            })
    };
}

// DIRECT_MESSAGE
var userModalCtrl = function($scope, $modalInstance, $state) {
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.onUserSelected = function(item) {
        $state.go('archives', {entityType:'users', entityId:item.id});
        this.cancel();
        item.visibility = true;
    };

}

// PRIVATE_GROUP/CHANNEL RENAME
var renameModalCtrl = function($scope, $modalInstance, entityheaderAPIservice, $state, $rootScope) {

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    }

    $scope.isLoading = true;

    $scope.onRenameClick = function(entityNewName) {
        entityheaderAPIservice.renameEntity($state.params.entityType, $state.params.entityId,  entityNewName)
            .success(function(response) {
                $scope.updateLeftPanelCaller();
                $rootScope.$emit('updateSharedEntities');
                $modalInstance.dismiss('cancel');
                console.log('successfully renamed');
                $scope.isLoading = false;
            })
            .error(function(response) {
                alert(response.msg);
                $scope.isLoading = false;
            })
    };
}

// PRIVATE_GROUP/CHANNEL INVITE
var inviteModalCtrl = function($scope, $modalInstance, entityheaderAPIservice, $state, $filter) {

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
        var userList = _.reject(totalUserList, function(user) { return members.indexOf(user.id) > -1 });

        $scope.userList = userList;
    }

    // See if 'user' is a member of current channel/privateGroup.
    $scope.isMember = function(user, entityType) {
        if (entityType == 'channel')
            return jQuery.inArray(user.id, $scope.currentEntity.ch_members) >  -1;

        return jQuery.inArray(user.id, $scope.currentEntity.pg_members) >  -1;
    }

    // Below function gets called when 'enter/click' happens in typeahead.
    // This function is buggyyyy
    // TODO : FIX IT!
    $scope.onUserSelected = function(selectedUser) {
        selectedUser.selected = true;
    }

    $scope.onInviteClick = function(entityType) {
        var guestList = [];

        angular.forEach($filter('filter')($scope.userList, {'selected':true}), function(user, index) {
            this.push(user.id);
        }, guestList);

        if (guestList.length== 0) {
            alert("No one to invite.  I guess you don't have that many friends.");
            return;
        }

        $scope.isLoading = true;

        entityheaderAPIservice.inviteUsers(entityType, $state.params.entityId, guestList)
            .success(function(response) {
                $scope.isLoading = false;

                $modalInstance.dismiss('cancel');
                $scope.updateLeftPanelCaller();     // is this necessary?
            })
            .error(function(response) {
                console.log('something went wrong ' + response.msg );
                $scope.isLoading = false;
            })
    };

}

// INVITE USER TO TEAM
var inviteUserToTeamCtrl = function($scope, $modalInstance, teamAPIservice) {
    $scope.isLoading = false;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };



    $scope.onInviteClick = function() {
        $scope.isLoading = true;

        var invites = [];

        var cur = {};

        var hasAllInformation = false;

        $('input.invite').each(function(index) {
            var currentDomInput = $(this);

            if (currentDomInput.val() === '') {
                return false;
            }

            switch(currentDomInput.attr('name')) {
                case 'email':
                    hasAllInformation = false;
                    cur.email = currentDomInput.val();
                    break;
                case 'firstName':
                    cur.firstName = currentDomInput.val();
                    break;
                case 'lastName':
                    cur.lastName = currentDomInput.val();
                    invites.push(cur);
                    cur = {};
                    hasAllInformation = true;
                    break;
                default :
                    console.log('??')
            }
        })

        $scope.hasAllInformation = hasAllInformation;

        if (hasAllInformation) {
            teamAPIservice.inviteToTeam(invites)
                .success(function(response) {
//                console.log(response);

                    $scope.isLoading = false;

                    if ( response.sendMailFailCount > 0 ) {
                        $('.invite-team-body').html('<div class="modal-noti-block"><h1>다음 주소로 이메일 보내기를 실패하였습니다.</h1></div>');

                        angular.forEach(response.sendMailFailList, function(email) {
                            var failEmailAddressElement = angular.element('<div class="modal-noti-block_msg">'+ email+'</div>')
                            $('.invite-team-body').append(failEmailAddressElement)
                        });
                    }
                    else {
                        $('.invite-team-body').html('<div class="modal-noti-block"><h1>정상적으로 초대 이메일을 보냈습니다.</h1></div>');
                    }

                    $('#invite_to_team').hide();

                })
                .error(function(response) {
                    $scope.isLoading = false;
                    console.log('something went wrong');
                })
        }
        else  {
            $scope.isLoading = false;
        }
    }
    $scope.totalNumberOfInput = 0;


    $scope.onAddMoreClick = function() {
//        var invite_template = angular.element('<div class="form-horizontal"><div class="form-group"><div class="col-sm-6"><input type="email" class="form-control invite" name="email" ng-required="true" placeholder="email"/></div><div class="col-sm-3" style="margin:0 -1px 0 -1px; border-collapse: collapse;"><input type="text" class="form-control invite" name="firstName" ng-required="true" placeholder="last name"/></div><div class="col-sm-3"><input type="text" class="form-control invite" name="lastName" ng-required="true" placeholder="first name"/></div></div></div>');

        var invite_template = angular.element('<div class="form-horizontal"><div class="email_container"><input type="email" class="form-control invite" name="email" ng-required="true" placeholder="email" ng-blur="onInviteInputBlur($event);"/></div><div class="firstName_container"><input type="text" class="form-control invite" name="firstName" ng-required="true" placeholder="last name" ng-blur="onInviteInputBlur($event);"/></div><div class="lastName_container"><input type="text" class="form-control invite" name="lastName" ng-required="true" placeholder="first name" ng-blur="onInviteInputBlur($event);"/></div></div>');
        $('.invite-team-body').append(invite_template);
    }
}

// WHEN INVITING FROM DIRECT MESSAGE
var inviteUsertoChannelCtrl = function($scope, $modalInstance, entityheaderAPIservice) {
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };

    $scope.inviteOptions = entityheaderAPIservice.getInviteOptions($scope.joinedChannelList, $scope.privateGroupList);

    $scope.onInviteClick = function(inviteTo) {

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
        id.push($scope.currentEntity.id)

        $scope.isLoading = true;

        entityheaderAPIservice.inviteUsers(inviteTo.type, inviteTo.id, id)
            .success(function(response) {
                console.log('good');
                $scope.updateLeftPanelCaller();
                $modalInstance.dismiss('cancel');
                $scope.isLoading = false;
            })
            .error(function(response) {
                console.log('something went wrong');
                $scope.isLoading = false;
            })
    }
}

// FILE UPLOAD controller
var fileUploadModalCtrl =  function($scope, $modalInstance, fileAPIservice) {
    $scope.isLoading            = false;
    $scope.files                = $scope.selectedFiles[0];

    // $scope.joinedChannelList 는 어차피 parent scope 에 없기때문에 rootScope까지 가서 찾는다. 그렇기에 left와 right panel 사이에 synch가 맞는다.
    $scope.selectOptions        = fileAPIservice.getShareOptions($scope.joinedChannelList, $scope.userList, $scope.privateGroupList);

    $scope.fileInfo             = {
        'title'         : $scope.files.name,
        'share'         : $scope.currentEntity,
        'isPrivateFile' : false
    };

//    console.log('****************************')
//    console.log($scope.selectOptions)
//    console.log($scope.fileInfo.share)
//    console.log('****************************')

    var PRIVATE_FILE    = 740;
    var PUBLIC_FILE     = 744;

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    }

    // TODO : CURRENTLY IT'S UPLOADING ONLY ONE FILE.  MODIFY LOGIC TO UPLOAD MULTIPLE FILES
    // Be aware of change in type of fileInfo.share (from Entity to entitiyId.)
    $scope.onFileUpload = function(fileInfo) {
        fileInfo.permission = PRIVATE_FILE;

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

        fileQueue.then(function(result) {
            fileAPIservice.broadcastChangeShared();
            $modalInstance.dismiss('cancel');
            $scope.isLoading = false;
        }, function(response) {
            console.debug('failed to upload file.');
            $scope.isLoading = false;
        });

    }
}

// FILE SHARE controller
var fileShareModalCtrl = function($scope, $modalInstance, fileAPIservice) {
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
    if ($scope.selectOptions.indexOf($scope.shareChannel) == -1 )
        $scope.shareChannel = $scope.selectOptions[0]

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    }

    $scope.onFileShareClick = function(shareChannel, comment) {

        $scope.isLoading = true;

        fileAPIservice.addShareEntity($scope.file.id, shareChannel.id)
            .success(function(response) {
                fileAPIservice.broadcastChangeShared($scope.file.id);
                $modalInstance.dismiss('cancel');
                $scope.isLoading = false;
            })
            .error(function(response) {
                console.log('something went wrong');
                $scope.isLoading = false;
                console.log(response.msg);
            })
    }
}

//  PROFILE CONTROLLER
var profileCtrl = function($scope, $rootScope, $modalInstance, userAPIservice, $modal, $timeout) {

    $scope.curUser = _.cloneDeep($scope.user);

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
            .success(function(response) {
                $scope.updateLeftPanelCaller();
                $scope.isLoading = false;
                $modalInstance.dismiss('cancel');
            })
            .error(function(response) {
                console.log('not okay')
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
                controller  :   imageCropCtrl,
                resolve     : {
                    myImage     : function() { return e.target.result; }
                }
            });

            modalInstance.result.then(function(result) {
                    $scope.updateLeftPanelCaller();
                },
                function() {
                    console.log('no chagnes')
                });
        };
    };
};

//  IMAGE CROP CONTROLLER
var imageCropCtrl = function($scope, $rootScope, $modalInstance, myImage, fileAPIservice) {
    $scope.profilePic = myImage;
    $scope.croppedProfilePic = '';

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };


    $scope.onCropDone = function() {

        var blob = dataURItoBlob($scope.croppedProfilePic);
        $scope.isLoading = true;

        fileAPIservice.updateProfilePic(blob)
            .success(function(response) {
                $modalInstance.close('success');
            })
            .error(function(response) {
                console.log('not okay');
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
    }
};