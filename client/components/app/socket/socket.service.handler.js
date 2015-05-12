(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketHelper', jndWebSocketHelper);

  /* @ngInject */
  function jndWebSocketHelper(jndPubSub, entityAPIservice, currentSessionHelper, memberService,
                              logger, $state, configuration, config, desktopNotificationService) {

    this.newMemberHandler = newMemberHandler;

    this.teamNameChangeEventHandler = teamNameChangeEventHandler;
    this.teamDomainChangeEventHandler = teamDomainChangeEventHandler;

    this.topicChangeEventHandler = topicChangeEventHandler;
    this.chatMessageListEventHandler = chatMessageListEventHandler;

    this.fileDeletedHandler = fileDeletedHandler;
    this.fileCommentCreatedHandler = fileCommentCreatedHandler;
    this.fileCommentDeletedHandler = fileCommentDeletedHandler;

    this.roomMarkerUpdatedHandler = roomMarkerUpdatedHandler;

    this.memberProfileUpdatedHandler = memberProfileUpdatedHandler;

    this.messageEventHandler = messageEventHandler;
    this.messageEventFileCommentHandler = messageEventFileCommentHandler;
    this.messageEventFileShareUnshareHandler = messageEventFileShareUnshareHandler;
    this.messageEventTopicLeaveHandler = messageEventTopicLeaveHandler;

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


    function newMemberHandler(data) {
      _updateLeftPanel();
      _updateCenterForCurrentEntity(_isCurrentEntity(_getRoom(data.room)));
    }

    /**
     * Team name change event Handler
     *
     * What it does
     *  1. Update team name changing value 'name' in current session to data.team.name
     *
     * @param data
     */
    function teamNameChangeEventHandler(data) {
      currentSessionHelper.updateCurrentTeamName(data.team.name);
    }

    /**
     * Team domain change event handler
     *
     * What it does
     *  1. alert user that domain has changed
     *  2. Re-direct user to new domain
     *
     * @param data
     */
    function teamDomainChangeEventHandler(data) {
      var newAddress = configuration.base_protocol + data.team.domain + configuration.base_url;
      alert('Your team domain address has been changed to ' + newAddress + '. Click \'okay\' to proceed.');
      location.href = newAddress;
    }

    /**
     *
     * Event handler for
     * ['topic created', 'topic name updated', 'topic starred', 'topic unstarred', 'topic joined']
     *
     */
    function topicChangeEventHandler() {
      _onJoinedTopicListChanged();
      _updateLeftPanel();
    }

    /**
     * Chat cloase event handler
     */
    function chatMessageListEventHandler() {
      _updateMessageList();
    }

    /**
     * File delete event handler
     *
     * @param data
     */
    function fileDeletedHandler(data) {
      jndPubSub.pub('rightFileOnFileDeleted', data);
      jndPubSub.pub('rightFileDetailOnFileDeleted', data);
      jndPubSub.pub('centerOnFileDeleted', data);
    }

    /**
     * File comment created event handler
     *
     * @param data
     */
    function fileCommentCreatedHandler(data) {
      jndPubSub.pub('rightFileDetailOnFileCommentCreated', data);
    }

    /**
     * File comment deleted event handler
     *
     * @param data
     */
    function fileCommentDeletedHandler(data) {
      jndPubSub.pub('rightFileDetailOnFileCommentDeleted', data);
      jndPubSub.pub('centerOnFileCommentDeleted', data);
    }

    /**
     * Room marker updated event Handler
     *
     * What it does
     *  1. call proper function in center panel for current entity.
     *
     * Do nothing for non-current entity.
     *
     * @param data
     */
    function roomMarkerUpdatedHandler(data) {
      var room = data.room;
      var isCurrentEntity = _isCurrentEntity(room);
      if (isCurrentEntity) {
        log('update marker for current entity');
        jndPubSub.pub('centerOnMarkerUpdated', data);
      }

      var memberId = data.marker.memberId;

      if (_isActionFromMe(memberId)) {
        log('I read something from somewhere');
        _updateLeftPanelForOtherEntity(isCurrentEntity);
      }
    }


    /**
     * Member profile update event handler
     */
    function memberProfileUpdatedHandler(data) {
      log('member profile updated');
      log(data);
      var member = data.member;

      if (_isActionFromMe(member.id)) {
        log('my profile updated');
        memberService.onMemberProfileUpdated();
      } else {
        log('not my profile updated.');
        _replaceMemberEntityInMemberList(member);
      }

    }

    /**
     * Every socket event comes with 'messages'
     *
     * @param type
     * @param data
     */
    function messageEventHandler(type, data) {
      var room = data.room;
      var roomEntity = _getRoom(room);
      var writer = _getActionOwner(data.writer);
      var isCurrentEntity = _isCurrentEntity(room);

      // message delete.
      if (_isMessageDeleted(type)) {
        _updateCenterForCurrentEntity(isCurrentEntity);
        // Must update left panel for other room;
        _updateLeftPanelForOtherEntity(isCurrentEntity);
        return;
      }

      // dm to me.
      if (_isDMToMe(room)) {
        _messageDMToMeHandler(data, roomEntity, writer, isCurrentEntity);
        return;
      }

      // Check if message event happened in any related topics.
      if (!_isRelatedEvent(roomEntity, writer)) { return; }

      if (_isSystemEvent(type)) {
        _systemMessageHandler(isCurrentEntity);
      } else {
        _newMessageHandler(data, roomEntity, writer, isCurrentEntity);
      }
    }

    /**
     *
     * ['file share', 'file unshare'] event handler.
     *
     *      'message_file_share' and 'message_file_unshare'
     *
     * @private
     */
    function messageEventFileShareUnshareHandler(data) {
      var room = data.room;
      var writer = data.writer;

      log('file share/unshare event');

      _updateCenterForRelatedFile(data.file);
      _updateLeftPanelForOtherEntity(_isCurrentEntity(data.room));
      _updateFilesPanelonRight(data);
      _udpateFileDetailPanel(data);
    }

    function messageEventTopicLeaveHandler(data) {
      var room = data.room;
      var roomEntity = _getRoom(room);
      var isCurrentEntity = _isCurrentEntity(room);
      var writer = _getActionOwner(data.writer);


      if (!_isRelatedEvent(roomEntity, writer)) { return; }

      if (_isActionFromMe(data.writer)) return;

      log('topic left event');

      if (isCurrentEntity) {
        jndPubSub.pub('centerOnTopicLeave', data);
        _updateCenterMessage();
      }

      _updateLeftPanelForOtherEntity(isCurrentEntity);
    }

    /**
     * Handles only 'message -> file_comment'
     * @param data {object} object that came through api call.
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
     * Direct messages to me handler
     * What is does
     *  1. Always update center message.
     *  2. Update messageList(left bottom) only if room is not current entity.
     *  3. Send browser notification if action is not from me.
     *
     * @param room
     * @private
     */
    function _messageDMToMeHandler(data, roomEntity, writer, isCurrentEntity) {
      log('DM to me');

      _updateCenterMessage();
      _updateChatList();
      _sendBrowserNotificationForOtherEntity(data, roomEntity, writer, isCurrentEntity);
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

    /**
     * System event message handler
     *
     * What it does
     *  1. Update left panel
     *  2. update center panel for current entity only.
     *
     * @param room
     * @private
     */
    function _systemMessageHandler(isCurrentEntity) {
      log('system event');
      _updateLeftPanel();
      _updateCenterForCurrentEntity(isCurrentEntity);
    }

    /**
     * New message created handler
     *
     * What it does
     *  1. update center for current entity
     *  2. update left panel for non-current entity
     *  3. send browser notification
     *
     * @param room
     * @param writer
     * @private
     */
    function _newMessageHandler(data, roomEntity, writer, isCurrentEntity) {
      // new message in topic/dm.
      log('new message written');
      _updateCenterForCurrentEntity(isCurrentEntity);
      _updateLeftPanelForOtherEntity(isCurrentEntity);
      _sendBrowserNotificationForOtherEntity(data, roomEntity, writer, isCurrentEntity);

    }

    function _replaceMemberEntityInMemberList(member) {
      log('replacing member');

      // TODO: I think it is too much to update whole left panel when only memberlist needs to be updates.
      _updateLeftPanel();

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

    function _updateCenterForRelatedFile(file) {
      log('update center for related file');
      jndPubSub.pub('updateCenterForRelatedFile', file);
    }
    /**
     * Update center message list only if room is current entity.
     *
     * @param room
     * @private
     */
    function _updateCenterForCurrentEntity(isCurrentEntity) {
      if (isCurrentEntity) {
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
    function _updateLeftPanelForOtherEntity(isCurrentEntity) {
      if (!isCurrentEntity) {
        log('update left panel for other entity');
        _updateLeftPanel();
      }
    }

    function _updateFilesPanelonRight(data) {
      log('update right panel file controller');
      jndPubSub.pub('updateFileControllerOnShareUnshare', data)
    }

    function _udpateFileDetailPanel(data) {
      jndPubSub.pub('updateFileDetailPanel', data)
    }
    /**
     * Send browser notification only for non-current entity.
     *
     * @param room
     * @private
     */
    function _sendBrowserNotificationForOtherEntity(data, roomEntity, writer, isCurrentEntity) {
      if (_isActionFromMe(writer.id) || isCurrentEntity) return;

      log('Send browser notification');
      desktopNotificationService.addNotification(data, writer, roomEntity);
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
    function _updateChatList() {
      jndPubSub.updateLeftChatList();

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
    function _isActionFromMe(writerId) {
      return writerId === memberService.getMemberId();
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
