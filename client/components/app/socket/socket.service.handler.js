(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketHelper', jndWebSocketHelper);

  /* @ngInject */
  function jndWebSocketHelper(jndPubSub, entityAPIservice, currentSessionHelper, memberService,
                              logger, $state, configuration, config, desktopNotificationService) {

    this.teamNameChangeEventHandler = teamNameChangeEventHandler;
    this.teamDomainChangeEventHandler = teamDomainChangeEventHandler;

    this.topicChangeEventHandler = topicChangeEventHandler;
    this.chatMessageListEventHandler = chatMessageListEventHandler;

    this.fileDeletedHandler = fileDeletedHandler;

    this.onMemberProfileUpdatedHandler = onMemberProfileUpdatedHandler;

    this.messageEventHandler = messageEventHandler;
    this.messageEventFileShareUnshareHandler = messageEventFileShareUnshareHandler;
    this.messageEventFileCommentHandler = messageEventFileCommentHandler;

    this.topicLeaveHandler = topicLeaveHandler;

    this.socketEventLogger = socketEventLogger;
    this.eventStatusLogger = eventStatusLogger;
    this.log = log;



    // message types
    var MESSAGE = config.socketEvent.MESSAGE;

    var MESSAGE_TOPIC_JOIN = config.socketEvent.MESSAGE_TOPIC_JOIN;
    var MESSAGE_TOPIC_LEAVE = config.socketEvent.MESSAGE_TOPIC_LEAVE;
    var MESSAGE_TOPIC_INVITE = config.socketEvent.MESSAGE_TOPIC_INVITE;

    var MESSAGE_DELETE = config.socketEvent.MESSAGE_DELETE;

    var MESSAGE_FILE_SHARE = config.socketEvent.MESSAGE_FILE_SHARE;
    var MESSAGE_FILE_UNSHARE = config.socketEvent.MESSAGE_FILE_UNSHARE;

    var MESSAGE_FILE_COMMENT = config.socketEvent.MESSAGE_FILE_COMMENT;

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
      _onJoinedTopicListChanged();
      _updateLeftPanel();
    }

    function chatMessageListEventHandler() {
      _updateMessageList();
    }

    /**
     * Handle case when file is deleted.
     * @param data
     */
    function fileDeletedHandler(data) {
      jndPubSub.pub('rightFileOnFileDeleted', data);
      jndPubSub.pub('rightFileDetailOnFileDeleted', data);
      jndPubSub.pub('centerOnFileDeleted', data);
    }
    function onMemberProfileUpdatedHandler() {
      memberService.onMemberProfileUpdated();
    }

    function messageEventHandler(room, writer, eventType) {
      var roomEntity = _getRoom(room);
      var writer = _getActionOwner(writer);

      // Only when message is deleted.
      if (_isMessageDeleted(eventType)) {
        log('message deleted');
        _updateCenterForCurrentEntity(room);
        return;
      }

      // Only when DM to me.
      if (_isDMToMe(room)) {
        _messageDMToMeHandler(room);
        return;
      }

      // Check if message event happened in any related topics.
      if (!_isRelatedEvent(roomEntity, writer)) { return; }


      if (_isSystemEvent(eventType)) {
        log('system event');
        _updateLeftPanel();
        _updateCenterForCurrentEntity(room);
      } else {
        // message is written to one of related topic/DM.
        log('new message written');
        _updateCenterForCurrentEntity(room);
        _updateLeftPanelForOtherEntity(room);
        _sendBrowserNotificationForOtherEntity(room, writer);
      }
    }

    /**
     * Handles only 'message -> file_share' and 'message -> file_unshare'.
     *
     * @private
     */
    function messageEventFileShareUnshareHandler(data) {
      var room = data.room;
      var writer = data.writer;

      var roomEntity = _getRoom(room);
      var writer = _getActionOwner(writer);

      log('file share/unshare event');
      log(data);

      _updateCenterForCurrentEntity(room);
      _updateLeftPanelForOtherEntity(room);
      _updateFilesPanelonRight(data);


    }
    /**
     * Handles only 'message -> file_comment'
     * @param data
     */
    function messageEventFileCommentHandler(data) {
      var fileId = data.file.id;
      log('file comment event');

      var rooms = data.rooms;

      var foundCurrentRoom = false;
      var hasRelatedRoom = false;

      _.forEach(rooms, function(room) {
        foundCurrentRoom = _isCurrentEntity(room) || foundCurrentRoom;
        hasRelatedRoom = _isRelatedEvent(_getRoom(room), _getActionOwner(data.writer)) || hasRelatedRoom;
      });

      if (!hasRelatedRoom) return;

      if (foundCurrentRoom) {
        _updateCenterMessage();
      }

      _updateLeftPanel();

      // Update Right panel - file detail
      if (_isCurrentFile(fileId)) {
        _updateFileDetailPanel();
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
      _onJoinedTopicListChanged();

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

      log('related room event');

      return true;
    }
    function _isCurrentFile(fileId) {
      return fileId === currentSessionHelper.getCurrentFileId();
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
     * Update left panel entities only if room is NOT current entity.
     * Main purpose is to update badge count on left panel.
     *
     * @param room
     * @private
     */
    function _updateLeftPanelForOtherEntity(room) {
      if (!_isCurrentEntity(room)) {
        log('update left panel for other entity');
        _updateLeftPanel();
      }
    }

    function _updateFilesPanelonRight(data) {
      log('update right panel file controller');
      jndPubSub.pub('updateFileControllerOnShareUnshare', data)

    }
    /**
     * Send browser notification only for non-current entity.
     *
     * @param room
     * @private
     */
    function _sendBrowserNotificationForOtherEntity(room, writer) {
      if (!_isCurrentEntity(room)) {
        // Non-current entity -> Send notification!!!
        log('Send browser notification');
        desktopNotificationService.addNotification(writer, room);
      }
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
    function _updateFileDetailPanel() {
      log('update file detail panel');
      jndPubSub.updateRightFileDetailPanel();
    }

    /**
     * Broadcast 'onJoinedTopicListChanged' event when user left or joined any topics.
     *
     * rPanelFileTabCtrl in files.controller is listening.
     * @private
     */
    function _onJoinedTopicListChanged() {
      jndPubSub.pub('onJoinedTopicListChanged', 'onJoinedTopicListChanged_leftInitDone');
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
      var room;
      var roomName;

      if (data.rooms) {
        _.forEach(data.rooms, function(room) {
          room = entityAPIservice.getEntityById(room.type, room.id);
          roomName += ' ' + room.name;
        })
      } else {
        room = entityAPIservice.getEntityById(data.room.type, data.room.id);

        if (!room) return;

        roomName = room.name;
      }

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
          verb = ' wrote in ';
          break;
        case MESSAGE_DELETE:
          verb = ' deleted a message in ';
          break;
        case MESSAGE_FILE_SHARE:
          verb = ' shared a file in ';
          break;
        case MESSAGE_FILE_UNSHARE:
          verb = ' unshared a file from ';
          break;


      }
      log(writerName + verb + roomName)

    }

  }
})();