'use strict';

var app = angular.module('jandiApp');

app.factory('entityheaderAPIservice', function($http, $rootScope, $filter) {
    var entityheaderAPI = {};

    entityheaderAPI.renameEntity = function(entityType, entityId, newEntityName) {
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + entityType + '/' + entityId,
            data: {"name": newEntityName}
        });
    };

    entityheaderAPI.leaveEntity = function(entityType, entityId) {
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + entityType + 's/' + entityId + '/leave'
        });
    };

    entityheaderAPI.deleteEntity = function(entityType, entityId) {
        return $http({
            method: 'DELETE',
            url: $rootScope.server_address + entityType + 's/' + entityId
        });
    };

    /*
     PARAMS
     entityType  : integer
     entityId    : integer
     users       : array of integers
     */
    entityheaderAPI.inviteUsers = function(entityType, entityId, users) {
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + entityType + 's/' + entityId + '/invite',
            data: {"inviteUsers": users}
        });
    };

    entityheaderAPI.joinChannel = function(entityId) {
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + 'channels/' + entityId + '/join'
        });
    };

    entityheaderAPI.createEntity = function(entityType, entityName) {
        return $http({
            method: 'POST',
            url: $rootScope.server_address + entityType,
            data : {"name": entityName}
        });
    };


    entityheaderAPI.getInviteOptions = function(joinedChannelList, privateGroupList) {
        var options = [];
        var lists = joinedChannelList.concat(privateGroupList);
        // TODO: 이미 모든 팀원이 초대된 entity는 예외 처리
        for (var i in lists) {
            var entity = lists[i];
            options.push({
                'groupBy'      : $filter('translate')(entity.type),
                'type'      : entity.type,
                'name'      : entity.name,
                'members'   : entity.pg_members || entity.ch_members,
                'id'        : entity.id
            });
        }
        return options;
    };

    entityheaderAPI.init = function(stateParams, scope) {

        console.log('init');
        console.log('$stateParams', stateParams);
        console.log('scope', scope);

        var members = [];

        console.log($rootScope.currentEntity);

        if ($rootScope.currentEntity.type == 'channel') {
            members = $rootScope.currentEntity.ch_members;
        }
        else if ($rootScope.currentEntity.type == 'privateGroup') {
            members = $rootScope.currentEntity.pg_members;
        }

        console.log(members);

        if (member == null) {
            console.log('returning null');
            return null;
        }
        return members;
    };

    return entityheaderAPI;
});
