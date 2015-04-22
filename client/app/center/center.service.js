(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('messageAPIservice', messageAPIservice);

  /* @ngInject */
  function messageAPIservice($http, $rootScope, memberService, configuration, currentSessionHelper) {

    this.getMessages = getMessages;
    this.getUpdatedMessages = getUpdatedMessages;
    this.postMessage = postMessage;
    this.editMessage = editMessage;
    this.deleteMessage = deleteMessage;
    this.updateMessageMarker = updateMessageMarker;

    this.getRoomInformation = getRoomInformation;

    var server_address = configuration.server_address;

    // get message lists
    function getMessages(entityType, entityId, params) {
      entityType = entityType || 'channels';

      params.teamId  = memberService.getTeamId();

      return $http({
        method  : 'GET',
        url     : server_address + entityType + '/' + entityId + '/messages',
        params  : params
      });
    }

    // get updated message lists
    function getUpdatedMessages(entityType, entityId, lastUpdatedId) {
      entityType = entityType || 'channels';
      return $http({
        method  : 'GET',
        url     : $rootScope.server_address + entityType + '/' + entityId + '/messages/update/' + lastUpdatedId,
        params  : {
          teamId  : memberService.getTeamId()
        }
      });
    }

    // post message
    function postMessage(entityType, entityId, message) {
      entityType = entityType || 'channels';
      return $http({
        method  : 'POST',
        url     : $rootScope.server_address + entityType + '/' + entityId + '/message',
        data    : message,
        params  : {
          teamId  : memberService.getTeamId()
        }

      });
    }

    // edit message
    function editMessage(entityType, entityId, messageId, message) {
      entityType = entityType || 'channels';
      return $http({
        method  : 'PUT',
        url     : $rootScope.server_address + entityType + '/' + entityId + '/messages/' + messageId,
        data    : message,
        params  : {
          teamId  : memberService.getTeamId()
        }

      });
    }

    // delete message
    function deleteMessage(entityType, entityId, messageId) {
      entityType = entityType || 'channels';
      return $http({
        method  : 'DELETE',
        url     : $rootScope.server_address + entityType + '/' + entityId + '/messages/' + messageId,
        params  : {
          teamId  : memberService.getTeamId()
        }

      });
    }

    //  Updates message marker to 'lastLinkId' for 'entitiyId'
    function updateMessageMarker(entityId, entityType, lastLinkId) {
      entityType = entityType.toLowerCase().trim();

      // TODO: REFACTOR | TO entityAPIservice - LOGIC ONLY.
      if (entityType == 'privategroups')
        entityType = 'privateGroup';
      else if (entityType == 'channels')
        entityType = 'channel';
      else
        entityType = 'user';

      var data = {
        teamId: memberService.getTeamId(),
        entityType: entityType,
        lastLinkId: lastLinkId
      };

      return $http({
        method  : 'POST',
        url     : $rootScope.server_address + 'entities/' + entityId + '/marker',
        data    : data,
        params  : {
          entityId    : entityId
        }

      });
    }

    function getRoomInformation(roomId) {
      var teamId = currentSessionHelper.getCurrentTeam().id;
      return $http({
        method: 'GET',
        url: server_address + 'teams/' + teamId + '/rooms/' + roomId
      });
    }
  }
})();
