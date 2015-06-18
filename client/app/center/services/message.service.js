(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('messageAPIservice', messageAPIservice);

  /* @ngInject */
  function messageAPIservice($http, memberService, configuration, currentSessionHelper) {
    this.getMessage = getMessage;
    this.getMessages = getMessages;
    this.getUpdatedMessages = getUpdatedMessages;
    this.postMessage = postMessage;
    this.editMessage = editMessage;
    this.deleteMessage = deleteMessage;
    this.deleteSticker = deleteSticker;

    this.updateMessageMarker = updateMessageMarker;

    this.getRoomInformation = getRoomInformation;

    var server_address = configuration.server_address;

    /**
     * get message item
     * @param {string} teamId
     * @param {string} messageId
     */
    function getMessage(teamId, messageId) {
      return $http({
        method  : 'GET',
        url     : server_address + 'teams/' + teamId + '/messages/' + messageId
      });
    }

    // get message lists
    function getMessages(entityType, entityId, params) {
      entityType = _getParamEntityType(entityType);

      params.teamId  = memberService.getTeamId();

      return $http({
        method  : 'GET',
        url     : server_address + entityType + '/' + entityId + '/messages',
        params  : params
      });
    }

    // get updated message lists
    function getUpdatedMessages(entityType, entityId, lastUpdatedId) {
      entityType = _getParamEntityType(entityType);
      return $http({
        method  : 'GET',
        url     : server_address + entityType + '/' + entityId + '/messages/update/' + lastUpdatedId,
        params  : {
          teamId  : memberService.getTeamId()
        }
      });
    }

    /**
     * 메세지를 전송한다.
     * @param {string} entityType - entity 타입
     * @param {string} entityId   - entity ID
     * @param {string} message    - 메세지
     * @param {object} sticker    - 스티커 객체
     * @returns {*}
     */
    function postMessage(entityType, entityId, message, sticker) {
      if (!sticker) {
        return _postMessage(entityType, entityId, message);
      } else {
        return _postSticker(entityType, entityId, message, sticker);
      }
    }

    /**
     * 메세지를 입력한다.
     * @param {string} entityType - entity 타입
     * @param {string} entityId   - entity ID
     * @param {string} message    - 메세지
     * @returns {*}
     * @private
     */
    function _postMessage(entityType, entityId, message) {
      entityType = _getParamEntityType(entityType);
      return $http({
        method  : 'POST',
        url     : server_address + entityType + '/' + entityId + '/message',
        data    : {
          content: message
        },
        params  : {
          teamId  : memberService.getTeamId()
        }
      });
    }

    /**
     * 스티커를 입력한다.
     * @param {string} entityType - entity 타입
     * @param {string} entityId   - entity ID
     * @param {string} message    - 메세지
     * @param {object} sticker    - 스티커 객체
     * @returns {*}
     * @private
     */
    function _postSticker(entityType, entityId, message, sticker) {
      var data = {
        stickerId: sticker.id,
        groupId: sticker.groupId,
        teamId: memberService.getTeamId(),
        share: entityId,
        type: message ? _getParamEntityType(entityType): '',
        content: message
      };

      return $http({
        method  : 'POST',
        url     : server_address + 'stickers',
        data    : data
      });
    }
    /**
     * server 로 전달할 entityType 문자열을 반환한다.
     * @param {string} entityType 전달받은 entityType
     * @param {boolean} [isSingular=false] 단수형인지 복수형인지 여부
     * @returns {string}
     * @private
     */
    function _getParamEntityType(entityType, isSingular) {
      var type = 'channel';

      if (entityType.indexOf('user') > -1) {
        type = 'user';
      } else if (entityType.indexOf('private') > -1) {
        type = 'privateGroup';
      } else if (entityType.indexOf('channel') > -1) {
        type = 'channel';
      }

      if (!isSingular) {
        type += 's';
      }
      return type;
    }

    // edit message
    function editMessage(entityType, entityId, messageId, message) {
      entityType = _getParamEntityType(entityType);
      return $http({
        method  : 'PUT',
        url     : server_address + entityType + '/' + entityId + '/messages/' + messageId,
        data    : message,
        params  : {
          teamId  : memberService.getTeamId()
        }

      });
    }

    /**
     * 메세지를 제거한다.
     * @param {string} entityType - entity 타입
     * @param {string} entityId   - entity ID
     * @param {string} messageId  - 메세지 ID
     * @returns {*}
     */
    function deleteMessage(entityType, entityId, messageId) {
      entityType = _getParamEntityType(entityType);
      return $http({
        method  : 'DELETE',
        url     : server_address + entityType + '/' + entityId + '/messages/' + messageId,
        params  : {
          teamId  : memberService.getTeamId()
        }
      });
    }

    /**
     * 스티커를 제거한다.
     * @param {string} messageId 메세지 ID
     * @returns {*}
     */
    function deleteSticker(messageId) {
      return $http({
        method  : 'DELETE',
        url     : server_address + 'stickers/messages/' + messageId,
        params  : {
          teamId  : memberService.getTeamId()
        }
      });
    }

    //  Updates message marker to 'lastLinkId' for 'entitiyId'
    function updateMessageMarker(entityId, entityType, lastLinkId) {
      entityType = _getParamEntityType(entityType, true);

      var data = {
        teamId: memberService.getTeamId(),
        entityType: entityType,
        lastLinkId: lastLinkId
      };

      return $http({
        method  : 'POST',
        url     : server_address + 'entities/' + entityId + '/marker',
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
