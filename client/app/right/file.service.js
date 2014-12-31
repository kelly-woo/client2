'use strict';

var app = angular.module('jandiApp');

app.factory('fileAPIservice', function($http, $rootScope, $window, $upload, $filter, memberService, entityAPIservice) {
    var fileAPI = {};

    fileAPI.upload = function(files, fileInfo, supportHTML) {
        var flash_url = supportHTML ? '' : 'v2/';

        console.log(flash_url + 'file')
        return $upload.upload({
            method: 'POST',
            url: $rootScope.server_address + flash_url + 'file',
            data: fileInfo,
            file: files,
            fileFormDataName: 'userFile',
            params: {
                teamId: memberService.getTeamId()
            }

        });
    };

    fileAPI.abort = function(file) {
        file.abort();
    };

    fileAPI.getFileList = function(fileRequest) {
        return $http({
            method: 'POST',
            url: $rootScope.server_address + 'search',
            data: fileRequest
        })
    };

    fileAPI.getFileDetail = function(fileId) {
        return $http({
            method  : 'GET',
            url     : $rootScope.server_address + 'messages/' + fileId
        })
    };

    fileAPI.postComment = function(fileId, content) {
        return $http({
            method  : 'POST',
            url     : $rootScope.server_address + 'messages/' + fileId + '/comment',
            data    : {
                'comment'   : content
            }
        })
    };

    fileAPI.deleteComment = function(fileId, commentId) {
        return $http({
            method  : 'DELETE',
            url     : $rootScope.server_address + 'messages/' + fileId + '/comments/' + commentId
        })
    };

    fileAPI.addShareEntity = function(fileId, shareEntity) {
        return $http({
            method  : 'PUT',
            url     : $rootScope.server_address + 'messages/' + fileId + '/share',
            data    : {
                'shareEntity' : shareEntity
            }
        })
    };

    fileAPI.unShareEntity = function(fileId, unShareEntity) {
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + 'messages/' + fileId + '/unshare',
            data : {
                'unshareEntity' : unShareEntity
            }
        })
    };

    // Simply putting every channel, user, and private group into one array.
    // No exception.
    fileAPI.getShareOptions = function(joinedChannelList, userList, privateGroupList) {
        return joinedChannelList.concat(privateGroupList, userList);
    };

    //  Removes entity that exists in 'file.shareEntities' from 'list'.
    //  Returns new array.
    fileAPI.removeSharedEntities = function(file, list) {
        var returnValue = [];
        angular.forEach(list, function(option, index) {
            if(file.shareEntities.indexOf(option.id) == -1)
                this.push(option);
        }, returnValue);

        return returnValue;
    };

    // Populating a list of entities to be displayed as 'shared channel/privateGroup'.
    fileAPI.getSharedEntities = function(file) {
        var sharedEntityArray = [];
        var unique = _.uniq(file.shareEntities);

        _.each(unique, function(sharedEntityId) {
            var sharedEntity = entityAPIservice.getEntityFromListById($rootScope.totalEntities, sharedEntityId);
            if( sharedEntity.type == 'privateGroup' && entityAPIservice.isMember(sharedEntity, $rootScope.member) ||
                sharedEntity.type == 'channel' ||
                sharedEntity.type == 'user' )  {
                sharedEntityArray.push(sharedEntity)
            }
        });
        return sharedEntityArray;
    };

    // Broadcast shareEntities change event to centerpanel, rightpanel, detailpanel
    fileAPI.broadcastChangeShared = function(id) {
        var ret = (id) ? {messageId: id} : null;
        $rootScope.$broadcast('onChangeShared', ret);
    };

    fileAPI.broadcastCommentFocus = function() {
        $rootScope.$broadcast('setCommentFocus');
    };

    fileAPI.broadcastFileShare = function(file) {
        $rootScope.$broadcast('openFileShare', file);
    };


    var fileSizeLimit = 100; // 100MB

    // Return true if file size is over 100MB.
    fileAPI.isFileTooLarge = function(file) {
        var sizeInMb = file.size/(Math.pow(1024,2));
        if (sizeInMb > fileSizeLimit)
            return true;
        return false;
    };

    fileAPI.clearCurUpload = function() {
        $rootScope.curUpload = {};

    };

    return fileAPI;
});
