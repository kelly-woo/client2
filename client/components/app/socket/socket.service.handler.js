(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketHelper', jndWebSocketHelper);

  /* @ngInject */
  function jndWebSocketHelper(jndPubSub, entityAPIservice, currentSessionHelper, memberService, logger, $state, configuration, $timeout) {
    this.teamNameChangeEventHandler = teamNameChangeEventHandler;
    this.teamDomainChangeEventHandler = teamDomainChangeEventHandler;

    this.topicChangeEventHandler = topicChangeEventHandler;
    this.chatMessageListEventHandler = chatMessageListEventHandler;

    this.onMemberProfileUpdatedHanlder = onMemberProfileUpdatedHanlder;

    this.messageEventHandler = messageEventHandler;
    this.topicLeaveHandler = topicLeaveHandler;

    this.socketEventLogger = socketEventLogger;
    this.eventStatusLogger = eventStatusLogger;
    this.log = log;


    // message types
    var MESSAGE_TOPIC_JOIN = 'topic_join';
    var MESSAGE_TOPIC_LEAVE = 'topic_leave';
    var MESSAGE_TOPIC_INVITE = 'topic_invite';
    var MESSAGE_DELETE = 'message_delete';


    // variables with '_APP_' has nothing to do with socket server. Just for internal use.
    var _APP_GOT_NEW_MESSAGE = 'app_got_new_message';

    var chatEntity = 'chat';

    function teamNameChangeEventHandler(data) {
      currentSessionHelper.updateCurrentTeamName(data.team.name);
    }

    function teamDomainChangeEventHandler(data) {
      var newAddress = configuration.base_protocol + data.team.domain + configuration.base_url;
      alert('Your team domain address has been changed to ' + newAddress + '. Click \'okay\' to proceed.');
      location.href = newAddress;
    }

    function topicChangeEventHandler() {
      _updateLeftPanel();
    }

    function chatMessageListEventHandler() {
      _updateMessageList();
    }

    function onMemberProfileUpdatedHanlder() {
      memberService.onMemberProfileUpdated();
    }
    function messageEventHandler(room, writer, eventType) {
      var roomEntity = _getRoom(room);
      var writer = _getActionOwner(writer);

      if (_isMessageDeleted(eventType)) {
        log('message deleted');

        _updateCenterForCurrentEntity(room);
        return;
      }

      if (_isDMToMe(room)) {
        _messageDMToMeHandler(room);
        return;
      }

      if (!_isRelatedEvent(roomEntity, writer)) {
        return;
      }

      if (_isSystemEvent(eventType)) {
        _updateLeftPanel();
        _updateCenterForCurrentEntity(room);
      } else {
        // message is written to one of related topic/DM.
        _updateCenterMessage();

      }


    }

    /**
     * Update center message list only if room is current entity.
     *
     * @param room
     * @private
     */
    function _updateCenterForCurrentEntity(room) {
      if (_isCurrentEntity(room)) {
        log('update center for current entity');
        _updateCenterMessage();
      }
    }

    /**
     * Always update center message.
     * Update messageList(left bottom) only if room is not current entity.
     *
     * @param room
     * @private
     */
    function _messageDMToMeHandler(room) {
      log('DM to me');
      if (!_isCurrentEntity(room)) {
        _updateMessageList();
      }
      _updateCenterMessage();
    }


    /**
     * Update left panel entities.
     *
     * Re-direct user to default topic if current left current entity.
     *
     * @param param
     */
    function topicLeaveHandler(param) {
      _updateLeftPanel();

      if (_isCurrentEntity(param.topic)) {
        $state.go('archives', {entityType:'channels',  entityId:currentSessionHelper.getDefaultTopicId() });
      }
    }

    function _isMessageDeleted(eventType) {
      return eventType === MESSAGE_DELETE;
    }
    function _isSystemEvent(eventType) {
      return eventType != _APP_GOT_NEW_MESSAGE;
    }
    function _isRelatedEvent(roomEntity, writer) {
      if (_.isUndefined(roomEntity) || _.isUndefined(writer)) {
        log('not related room event');
        return false;
      }
      return true;
    }


    function _updateLeftPanel() {
      log('update left panel');
      jndPubSub.updateLeftPanel();
    }
    function _updateCenterMessage() {
      log('udpate center message');
      jndPubSub.updateChatList();
    }
    function _updateMessageList() {
      log('update message list');
      jndPubSub.updateMessageList();
    }

    /**
     * Returns entity whose id is room.id.
     * @param room
     * @returns {*}
     * @private
     */
    function _getRoom(room) {
      if (room.type === chatEntity) {
        return entityAPIservice.getEntityByEntityId(room.id);
      }
      return entityAPIservice.getEntityById(room.type, room.id);
    }
    /**
     * Returns member entity whose id is 'writerId'.
     * @param writerId
     * @returns {*}
     * @private
     */
    function _getActionOwner(writerId) {
      return entityAPIservice.getEntityById('users', writerId);
    }
    /**
     * Return 'true' if target(room) is a chat entity.
     *
     * @param room
     * @returns {boolean}
     * @private
     */
    function _isDMToMe(room) {

      if (room.type != chatEntity) {
        return false;
      }

      var memberList = room.members;
      if (_.isUndefined(memberList)) return false;

      var foundMyself = false;

      _.forEach(memberList, function(member) {
        if (member === memberService.getMemberId()) {
          foundMyself = true;
          return false;
        }
      });

      return foundMyself;

    }
    /**
     * Checks whether id of current entity(actively looking) is same as room.
     *
     * @param room
     * @returns {boolean}
     * @private
     */
    function _isCurrentEntity(room) {
      var roomId = room.id;
      var currentEntity = currentSessionHelper.getCurrentEntity();

      return room.type === chatEntity ? roomId == currentEntity.entityId : roomId == currentEntity.id;

    }

    function socketEventLogger(event, data, isEmitting) {
      logger.socketEventLogger(event, data, isEmitting);
    }
    function log(msg) {
      logger.log(msg);
    }
    function eventStatusLogger(event, data) {
      var room = entityAPIservice.getEntityById(data.room.type, data.room.id);
      if (!room) return;
      var roomName = room.name;
      var writerName = memberService.getName(entityAPIservice.getEntityById('users', data.writer));

      if (event === MESSAGE_TOPIC_INVITE) {
        log(writerName + ' invited ' + data.inviter.length + ' people to ' + roomName);
        return;
      }

      var verb;
      switch(event) {
        case MESSAGE_TOPIC_JOIN:
          verb = ' joined ';
          break;
        case MESSAGE_TOPIC_LEAVE:
          verb = ' left ';
          break;
        case _APP_GOT_NEW_MESSAGE:
          verb = ' wrote ';
          break;


      }
      log(writerName + verb + roomName)

    }

  }
})();