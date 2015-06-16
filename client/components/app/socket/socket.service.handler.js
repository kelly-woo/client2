/**
 * @fileoverview 소켓 이벤트에 따라 다른 로직으로 처리하는 곳.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketHelper', jndWebSocketHelper);

  /* @ngInject */
  function jndWebSocketHelper(jndPubSub, messageAPIservice, entityAPIservice, currentSessionHelper, memberService,
                              logger, $state, configuration, config, DesktopNotification) {

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
    var MESSAGE_PREVIEW = config.socketEvent.MESSAGE_PREVIEW;

    var MESSAGE_FILE_SHARE = config.socketEvent.MESSAGE_FILE_SHARE;
    var MESSAGE_FILE_UNSHARE = config.socketEvent.MESSAGE_FILE_UNSHARE;

    var MESSAGE_FILE_COMMENT = config.socketEvent.MESSAGE_FILE_COMMENT;

    // variables with '_APP_' has nothing to do with socket server. Just for internal use.
    var _APP_GOT_NEW_MESSAGE = 'app_got_new_message';

    var chatEntity = 'chat';

    /**
     * New Team member join event handler
     *  1. update left panel to update member list
     *  2. update center panel for current entity
     * @param data {object}
     */
    function newMemberHandler(data) {
      _updateLeftPanel();
      _updateCenterForCurrentEntity(_isCurrentEntity(_getRoom(data.room)));
    }

    /**
     * Team name change event handler
     *  1. Update team name to 'data.team.name'
     * @param data {object}
     */
    function teamNameChangeEventHandler(data) {
      currentSessionHelper.updateCurrentTeamName(data.team.name);
    }

    /**
     * Team domain change event handler
     *  1. alert user that domain has changed
     *  2. Re-direct user to new domain
     * @param data
     */
    function teamDomainChangeEventHandler(data) {
      var newAddress = configuration.base_protocol + data.team.domain + configuration.base_url;

      //TODO: L10N here!!!
      alert('Your team domain address has been changed to ' + newAddress + '. Click \'okay\' to proceed.');

      location.href = newAddress;
    }

    /**
     * Event handler - ['topic created', 'topic name updated', 'topic starred', 'topic unstarred', 'topic joined']
     */
    function topicChangeEventHandler() {
      _onJoinedTopicListChanged();
      _updateLeftPanel();
    }

    /**
     * Chat close event handler
     */
    function chatMessageListEventHandler() {
      _updateChatList();
    }

    /**
     * File delete event handler
     * @param data {object}
     */
    function fileDeletedHandler(data) {
      jndPubSub.pub('rightFileOnFileDeleted', data);
      jndPubSub.pub('rightFileDetailOnFileDeleted', data);
      jndPubSub.pub('centerOnFileDeleted', data);
    }

    /**
     * File comment created event handler
     * @param data {object}
     */
    function fileCommentCreatedHandler(data) {
      jndPubSub.pub('rightFileDetailOnFileCommentCreated', data);
    }

    /**
     * File comment deleted event handler
     * @param data {object}
     */
    function fileCommentDeletedHandler(data) {
      jndPubSub.pub('rightFileDetailOnFileCommentDeleted', data);
      jndPubSub.pub('centerOnFileCommentDeleted', data);
    }

    /**
     * Room marker updated event handler
     *  1. call proper function in center panel for current entity.
     * Do nothing for non-current entity.
     * @param data {object}
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
     * @param data {object}
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
     * @param type {string} name of socket event
     * @param data {object}
     */
    function messageEventHandler(type, data) {
      var room = data.room;
      var roomEntity = _getRoom(room);
      var writer = _getActionOwner(data.writer);
      var isCurrentEntity = _isCurrentEntity(room);

      console.log('socket service ::::::::: ', type);
      if (_isMessageDeleted(type)) {
        // message delete.

        _updateCenterForCurrentEntity(isCurrentEntity);
        // Must update left panel for other room;
        _updateLeftPanelForOtherEntity(isCurrentEntity);
      } else if (_isAttachMessagePreview(type)) {
        // message preview.

        _attachMessagePreview(data);
      } else if (_isDMToMe(room)) {
        // dm to me.

        _messageDMToMeHandler(data, roomEntity, writer, isCurrentEntity);
      } else if (_isRelatedEvent(roomEntity, writer)) {
        // Check if message event happened in any related topics.

        if (_isSystemEvent(type)) {
          _systemMessageHandler(isCurrentEntity);
        } else {
          _newMessageHandler(data, roomEntity, writer, isCurrentEntity);
        }
      }

      // var room = data.room;
      // var roomEntity = _getRoom(room);
      // var writer = _getActionOwner(data.writer);
      // var isCurrentEntity = _isCurrentEntity(room);

      // // message delete.
      // if (_isMessageDeleted(type)) {
      //   _updateCenterForCurrentEntity(isCurrentEntity);
      //   // Must update left panel for other room;
      //   _updateLeftPanelForOtherEntity(isCurrentEntity);
      //   return;
      // }

      // // dm to me.
      // if (_isDMToMe(room)) {
      //   _messageDMToMeHandler(data, roomEntity, writer, isCurrentEntity);
      //   return;
      // }

      // // Check if message event happened in any related topics.
      // if (!_isRelatedEvent(roomEntity, writer)) { return; }

      // if (_isSystemEvent(type)) {
      //   _systemMessageHandler(isCurrentEntity);
      // } else {
      //   _newMessageHandler(data, roomEntity, writer, isCurrentEntity);
      // }
    }

    /**
     * Event handler - ['message_file_share' and 'message_file_unshare']
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

    /**
     * Event handler - topic left
     * @param data {object}
     */
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
     * Event handler - 'message -> file_comment'
     * @param data {object}
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
     * Direct messages to me.
     *  1. Always update center message.
     *  2. Update messageList(left bottom) only if room is not current entity.
     *  3. Send browser notification if action is not from me.
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
     * Re-direct user to default topic if current left current entity.
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
     *  1. Update left panel
     *  2. update center panel for current entity only.
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
     *  1. update center for current entity
     *  2. update left panel for non-current entity
     *  3. send browser notification
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

    /**
     * When member profile information has been updated, local memberList must be updated too.
     *   1. update left panel in order to get new member list
     * @param member {object} member entity object to replace with. Currently not used, but would need such information eventually.
     * @private
     */
    function _replaceMemberEntityInMemberList(member) {
      log('replacing member');

      // TODO: I think it is too much to update whole left panel when only memberlist needs to be updates.
      _updateLeftPanel();

    }


    /**
     * Return true if 'eventType' is message_deleted'.
     * @param eventType {string} name of event
     * @returns {boolean}
     * @private
     */
    function _isMessageDeleted(eventType) {
      return eventType === MESSAGE_DELETE;
    }

    /**
     * Return true if 'eventType' is link_preview_create.
     * @param {string} eventType - name of event
     * @returns {boolean}
     * @private
     */
    function _isAttachMessagePreview(eventType) {
      return eventType === MESSAGE_PREVIEW;
    }
    /**
     * Return true if 'eventType' is any kind of system event.
     * @param eventType {string} name of event
     * @returns {boolean}
     * @private
     */
    function _isSystemEvent(eventType) {
      return eventType !== _APP_GOT_NEW_MESSAGE && eventType !== config.socketEvent.MESSAGE_STICKER_SHARE;
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
    function _isRelatedEvent(roomEntity, writer) {
      if (_.isUndefined(roomEntity) || _.isUndefined(writer)) {
        log('not related room event');
        return false;
      }
      log('related room event');
      return true;
    }

    /**
     * 현재 오른쪽 페널에서 보고 있는 파일 아이디와 비교해서 같으면  true를 리턴한다.
     *
     * @param fileId {number} id of file
     * @returns {boolean}
     * @private
     */
    function _isCurrentFile(fileId) {
      return fileId === currentSessionHelper.getCurrentFileId();
    }

    function _updateCenterForRelatedFile(file) {
      log('update center for related file');
      jndPubSub.pub('updateCenterForRelatedFile', file);
    }

    /**
     * Update center message list only if room is current entity.
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
     * @param room
     * @private
     */
    function _updateLeftPanelForOtherEntity(isCurrentEntity) {
      if (!isCurrentEntity) {
        log('update left panel for other entity');
        _updateLeftPanel();
      }
    }

    /**
     * 파일의 내용이 바뀌었을 경우, 오른쪽 패널에 있는 file controller를 통해 해당 파일을 업데이트한다.
     * 쉐어/언쉐어의 경우 사용된다.
     * @param data {object}
     * @private
     */
    function _updateFilesPanelonRight(data) {
      log('update right panel file controller');
      jndPubSub.pub('updateFileControllerOnShareUnshare', data)
    }

    /**
     * 파일의 내용이 바뀌었을 경우, 오른쪽 패널에서도 파일 디테일이 바뀌어야할때  file detail panel을 업데이트한다.
     * @param data {object}
     * @private
     */
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
      DesktopNotification.addNotification(data, writer, roomEntity);
    }

    /**
     * left panel을 업데이트한다.
     * @private
     */
    function _updateLeftPanel() {
      log('update left panel');
      jndPubSub.updateLeftPanel();
    }

    /**
     * center panel을 업데이트한다.
     * @private
     */
    function _updateCenterMessage() {
      log('udpate center message');
      jndPubSub.updateChatList();
    }

    /**
     * file detail panel을 업데이트한다.
     * @private
     */
    function _updateFileDetailPanel() {
      log('update file detail panel');
      jndPubSub.updateRightFileDetailPanel();
    }

    /**
     * left에 1:1 chat list를 업데이트한다.
     * @private
     */
    function _updateChatList() {
      jndPubSub.updateLeftChatList();
    }

    /**
     * Broadcast 'onJoinedTopicListChanged' event when user left or joined any topics.
     * rPanelFileTabCtrl in files.controller is listening.
     * @private
     */
    function _onJoinedTopicListChanged() {
      jndPubSub.pub('onJoinedTopicListChanged', 'onJoinedTopicListChanged_leftInitDone');
    }

    /**
     * Return entity whose id is room.id.
     * @param room {object}
     *  @param type {string} type of room
     *  @param id {number} id of room
     * @returns {object} room entity
     * @private
     */
    function _getRoom(room) {
      if (room.type === chatEntity) {
        return entityAPIservice.getEntityByEntityId(room.id);
      }
      return entityAPIservice.getEntityById(room.type, room.id);
    }

    /**
     * Return member entity whose id is 'writerId'.
     * @param writerId
     * @returns {*}
     * @private
     */
    function _getActionOwner(writerId) {
      return entityAPIservice.getEntityById('users', writerId);
    }

    /**
     * Return 'true' if target(room) is a chat entity.
     * @param room {object}
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
     * Check whether id of current entity(actively looking) is same as room.
     * @param room {object}
     *  @param type {string} type of room
     *  @param id {number} id of room
     * @returns {boolean}
     * @private
     */
    function _isCurrentEntity(room) {
      var roomId = room.id;
      var currentEntity = currentSessionHelper.getCurrentEntity();

      return room.type === chatEntity ? roomId == currentEntity.entityId : roomId == currentEntity.id;
    }

    /**
     * writerId가 내 자신 아이디과 같은지 확인한다.
     * Check if writerId is same as id of currently signed in member(myself).
     * @param writerId {number} id of socket event owner
     * @returns {boolean}
     * @private
     */
    function _isActionFromMe(writerId) {
      return writerId === memberService.getMemberId();
    }

    /**
     * 소켓이벤트를 로깅한다.
     * @param event {string} name of event
     * @param data {object} param of event
     * @param isEmitting {boolean} true if event is emitting socket event
     */
    function socketEventLogger(event, data, isEmitting) {
      logger.socketEventLogger(event, data, isEmitting);
    }

    /**
     * 그냥 로깅한다.
     * @param msg {string} text to be logged
     */
    function log(msg) {
      logger.log(msg);
    }

    /**
     * 소켓 이벤트를 로기한다.
     * @param event {string} name of event
     * @param data {object} param of event
     */
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

    /**
     * attach message preview
     */
    function _attachMessagePreview(data) {
      jndPubSub.attachMessagePreview(data);
    }
  }
})();
