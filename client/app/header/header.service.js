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

  entityheaderAPI.renameEntity = function(entityType, entityId, newEntityName, topicDescription) {
    return $http({
      method: 'PUT',
      url: $rootScope.server_address + entityType + '/' + entityId,
      data: {
        name: newEntityName,
        description: topicDescription
      },
      params: {
        teamId: memberService.getTeamId()
      },
      version: 3
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
      url: $rootScope.server_address + entityType + '/' + entityId + '/invite',
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

  entityheaderAPI.createEntity = function(entityType, _body) {
    return $http({
      method: 'POST',
      url: $rootScope.server_address + entityType,
      data : _body,
      params: {
        teamId: memberService.getTeamId()
      },
      version: 3
    });
  };

  return entityheaderAPI;
});
