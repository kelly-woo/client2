(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketCommon', jndWebSocketCommon);

  /* @ngInject */
  function jndWebSocketCommon(jndPubSub, currentSessionHelper, entityAPIservice,
                              logger, memberService) {

    var _chatEntity = 'chat';


    this.isCurrentFile = isCurrentFile;
    this.isCurrentEntity = isCurrentEntity;
    this.isRelatedEvent = isRelatedEvent;
    this.getActionOwner = getActionOwner;
    this.getRoom = getRoom;

    this.updateLeft = updateLeft;
    this.updateCenterMessage = updateCenterMessage;
    this.updateDmList = updateDmList;

    this.updateFileDetailPanel = updateFileDetailPanel;
    this.isActionFromMe = isActionFromMe;

    this.hasLastLinkId = hasLastLinkId;
    this.getLastLinkId = getLastLinkId;


    function updateLeft() {
      jndPubSub.updateLeftPanel();
    }

    /**
     * Check whether id of current entity(actively looking) is same as room.
     * @param room {object}
     *  @param type {string} type of room
     *  @param id {number} id of room
     * @returns {boolean}
     * @private
     */
    function isCurrentEntity(room) {
      var roomId = room.id;
      var currentEntity = currentSessionHelper.getCurrentEntity();
      if (room.type === _chatEntity) {
        return roomId === currentEntity.entityId;
      } else {
        return roomId === currentEntity.id;
      }
    }

    /**
     * 나와 상관있는 방에서 소켓이벤트가 일어났다면 true를 리턴한다.
     * Check if event has any effect on any related topics.
     * What are related topics?
     *   - joined public topic
     *   - joined private topic
     *   - 1:1 message
     * @param roomEntity {object} entity
     * @param writer {object} socket event owner
     * @returns {boolean}
     * @private
     */
    function isRelatedEvent(roomEntity, writer) {
      if (_.isUndefined(roomEntity) || _.isUndefined(writer)) {
        logger.log('not related room event');
        return false;
      }
      logger.log('related room event');
      return true;
    }

    /**
     * Return member entity whose id is 'writerId'.
     * @param writerId
     * @returns {*}
     * @private
     */
    function getActionOwner(writerId) {
      return entityAPIservice.getEntityById('users', writerId);
    }

    /**
     * Return entity whose id is room.id.
     * @param room {object}
     *  @param type {string} type of room
     *  @param id {number} id of room
     * @returns {object} room entity
     * @private
     */
    function getRoom(room) {
      if (room.type === _chatEntity) {
        return entityAPIservice.getEntityByEntityId(room.id);
      }
      return entityAPIservice.getEntityById(room.type, room.id);
    }

    /**
     * center panel을 업데이트한다.
     * @private
     */
    function updateCenterMessage() {
      logger.log('udpate center message');
      jndPubSub.updateChatList();
    }

    /**
     * left에 1:1 chat list를 업데이트한다.
     * @private
     */
    function updateDmList() {
      jndPubSub.updateLeftChatList();
    }

    /**
     * 현재 오른쪽 페널에서 보고 있는 파일 아이디와 비교해서 같으면  true를 리턴한다.
     *
     * @param fileId {number} id of file
     * @returns {boolean}
     * @private
     */
    function isCurrentFile(fileId) {
      return fileId === currentSessionHelper.getCurrentFileId();
    }

    /**
     * file detail panel을 업데이트한다.
     * @private
     */
    function updateFileDetailPanel() {
      logger.log('update file detail panel');
      jndPubSub.updateRightFileDetailPanel();
    }

    /**
     * writerId가 내 자신 아이디과 같은지 확인한다.
     * Check if writerId is same as id of currently signed in member(myself).
     * @param writerId {number} id of socket event owner
     * @returns {boolean}
     * @private
     */
    function isActionFromMe(writerId) {
      return writerId === memberService.getMemberId();
    }

    function hasLastLinkId(socketEvent) {
    }

    /**
     * object에 'lastLinkId'나 'linkId'라는 property가 있는지 없는지 확인하고 있으면 값까지 리턴한다.
     * @param {object} object - 어떠한 오브젝트가 될 수 있음
     * @returns {{hasFound: boolean, value: number}}
     * @private
     */
    function _findLastLinkId(object) {
      var found = false;
      var returnObj = {
        hasFound: false,
        value: -1
      };

      if (_.isUndefined(object)) {
        return returnObj;
      }

      found = _.has(object, 'lastLinkId') || _.has(object, 'linkId');

      if (!found) {
        _.each(object, function(property) {
          if (_.isObject(property)) {
            returnObj = _findLastLinkId(property)
          }
        });
      } else {
        returnObj.value = _.get(object, 'lastLinkId') || _.get(object, 'linkId');
        returnObj.hasFound = found;
      }

      return returnObj;
    }

    /**
     * socketEvent에서 'lastLinkId'나 'linkId'를 찾아서 리턴한다.
     * @param {object} socketEvent - socket parameter
     * @returns {{hasFound: boolean, value: number}}
     */
    function getLastLinkId(socketEvent) {
      return _findLastLinkId(socketEvent);
    }
  }
})();
