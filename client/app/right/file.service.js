'use strict';

var app = angular.module('jandiApp');

app.factory('fileAPIservice', function($http, $rootScope, $upload, $filter) {
    var fileAPI = {};

    fileAPI.upload = function(files, fileInfo) {
        return $upload.upload({
            method: 'POST',
            url: $rootScope.server_address + 'file',
            data: fileInfo,
            file: files,
            fileFormDataName: 'userFile'
        });
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

    // Simple putting every channel, user, and private group into one array.
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
            var sharedEntity = fileAPI.getEntityById($rootScope.totalEntities, sharedEntityId);
            if( sharedEntity.type == 'privateGroup' && fileAPI.isMember(sharedEntity, $rootScope.user) ||
                sharedEntity.type == 'channel' ||
                sharedEntity.type == 'user' )  {
                sharedEntityArray.push(sharedEntity)
            }
        });
        return sharedEntityArray;
    };

    fileAPI.getEntityById = function(list, entityId) {
        var temp = $filter('filter')(list, {id : entityId}, function(actual, expected) {
            return angular.equals(actual, expected);
        });

        if (temp.length != 1) return false;

        return temp[0];
    };

    //  Returns true is 'user' is a member of 'entity'
    fileAPI.isMember = function(entity, user) {
        if (entity.type == 'channel')
            return jQuery.inArray(user.id, entity.ch_members) > -1;
        else
            return jQuery.inArray(user.id, entity.pg_members) > -1;
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

    return fileAPI;
});
