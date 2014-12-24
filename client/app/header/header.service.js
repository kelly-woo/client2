'use strict';

var app = angular.module('jandiApp');

app.factory('entityheaderAPIservice', function($http, $rootScope, storageAPIservice, memberService) {
    var entityheaderAPI = {};

    entityheaderAPI.setStarEntity = function(entityId) {
        return $http({
            method  : 'POST',
            url     : $rootScope.server_address + 'settings/starred/entities/' + entityId,
            data    : {
                teamId: memberService.getTeamId()
            }
        });
    };

    entityheaderAPI.removeStarEntity = function(entityId) {
        return $http({
            method  : 'DELETE',
            url     : $rootScope.server_address + 'settings/starred/entities/' + entityId,
            params  : {
                teamId: memberService.getTeamId()
            }

        });
    };

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
            url: $rootScope.server_address + entityType + 's/' + entityId + '/leave',
            data: {
                teamId: memberService.getTeamId()
            }
        });
    };

    entityheaderAPI.deleteEntity = function(entityType, entityId) {
        return $http({
            method: 'DELETE',
            url: $rootScope.server_address + entityType + 's/' + entityId,
            params: {
                teamId: memberService.getTeamId()
            }

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
            data: {
                inviteUsers: users,
                teamId: memberService.getTeamId()
            }
        });
    };

    entityheaderAPI.joinChannel = function(entityId) {
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + 'channels/' + entityId + '/join',
            data: {
                teamId: memberService.getTeamId()
            }
        });
    };

    entityheaderAPI.createEntity = function(entityType, entityName) {
        return $http({
            method: 'POST',
            url: $rootScope.server_address + entityType,
            data : {
                name: entityName,
                teamId: memberService.getTeamId()
            }
        });
    };



    return entityheaderAPI;
});
