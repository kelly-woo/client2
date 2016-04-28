/**
 * @fileoverview entity header api service
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.service('entityheaderAPIservice', function($http, $rootScope, storageAPIservice, memberService) {
    var _that = this;

    _that.setStarEntity = setStarEntity;
    _that.removeStarEntity = removeStarEntity;
    _that.renameEntity = renameEntity;
    _that.inviteUsers = inviteUsers;
    _that.joinChannel = joinChannel;
    _that.createEntity = createEntity;
    _that.transferTopicAdmin = transferTopicAdmin;

    /**
     * set star entity
     * @param {number} entityId
     * @returns {*}
     */
    function setStarEntity(entityId) {
      return $http({
        method  : 'POST',
        url     : $rootScope.server_address + 'settings/starred/entities/' + entityId,
        data    : {
          teamId: memberService.getTeamId()
        }
      });
    }

    /**
     * remove star entity
     * @param {number} entityId
     * @returns {*}
     */
    function removeStarEntity(entityId) {
      return $http({
        method  : 'DELETE',
        url     : $rootScope.server_address + 'settings/starred/entities/' + entityId,
        params  : {
          teamId: memberService.getTeamId()
        }

      });
    }

    /**
     * rename entity
     * @param {string} entityType
     * @param {number} entityId
     * @param {object} data
     * @returns {*}
     */
    function renameEntity(entityType, entityId, data) {
      return $http({
        method: 'PUT',
        url: $rootScope.server_address + entityType + '/' + entityId,
        data: {
          name: data.name,
          autoJoin: data.autoJoin,
          description: data.description
        },
        params: {
          teamId: memberService.getTeamId()
        },
        version: 3
      });
    }

    /**
     * inite users
     * @param {string} entityType
     * @param {number} entityId
     * @param {array} users
     * @returns {*}
     */
    function inviteUsers(entityType, entityId, users) {
      return $http({
        method: 'PUT',
        url: $rootScope.server_address + entityType + '/' + entityId + '/invite',
        data: {
          inviteUsers: users,
          teamId: memberService.getTeamId()
        }
      });
    }

    /**
     * join channel
     * @param {number} entityId
     * @returns {*}
     */
    function joinChannel(entityId) {
      return $http({
        method: 'PUT',
        url: $rootScope.server_address + 'channels/' + entityId + '/join',
        data: {
          teamId: memberService.getTeamId()
        }
      });
    }

    /**
     * create entity
     * @param {string} entityType
     * @param {object} data
     * @returns {*}
     */
    function createEntity(entityType, data) {
      return $http({
        method: 'POST',
        url: $rootScope.server_address + entityType,
        data : data,
        params: {
          teamId: memberService.getTeamId()
        },
        version: 3
      });
    }

    /**
     * transfer topic admin
     * @param {number} topicId
     * @returns {*}
     */
    function transferTopicAdmin(topicId, data) {
      return $http({
        method: 'PUT',
        url: $rootScope.server_address + 'teams/' + memberService.getTeamId() + '/topics/' + topicId + '/admin',
        data: {
          adminId: data.adminId
        }
      });
    }
  });
}());
