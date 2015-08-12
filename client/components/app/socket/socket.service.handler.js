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
  function jndWebSocketHelper(jndPubSub, entityAPIservice, currentSessionHelper, memberService,
                              logger, configuration, config, EntityMapManager) {

    this.teamNameChangeEventHandler = teamNameChangeEventHandler;
    this.teamDomainChangeEventHandler = teamDomainChangeEventHandler;

    this.topicChangeEventHandler = topicChangeEventHandler;
    this.chatMessageListEventHandler = chatMessageListEventHandler;

    this.roomMarkerUpdatedHandler = roomMarkerUpdatedHandler;

    this.memberProfileUpdatedHandler = memberProfileUpdatedHandler;

    this.socketEventLogger = socketEventLogger;
    this.eventStatusLogger = eventStatusLogger;
    this.log = log;

    this.attachMessagePreview = attachMessagePreview;



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
      //_onJoinedTopicListChanged();
      _updateLeftPanel();
    }

    /**
     * Chat close event handler
     */
    function chatMessageListEventHandler() {
      _updateChatList();
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

      _replaceMemberEntityInMemberList(member);

      if (_isActionFromMe(member.id)) {
        log('my profile updated');
        memberService.onMemberProfileUpdated();
      }

      jndPubSub.pub('updateMemberProfile', data);
    }


    /**
     * When member profile information has been updated, local memberList must be updated too.
     *   1. update left panel in order to get new member list
     * @param member {object} member entity object to replace with. Currently not used, but would need such information eventually.
     * @private
     */
    function _replaceMemberEntityInMemberList(member) {
      log('replacing member');

      entityAPIservice.extend(EntityMapManager.get('member', member.id), member);

      if (EntityMapManager.contains('memberEntityId', member.entityId)) {
        entityAPIservice.extend(EntityMapManager.get('memberEntityId', member.id), member);
      }

      // TODO: I think it is too much to update whole left panel when only memberlist needs to be updates.
      _updateLeftPanel();

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
     * left panel을 업데이트한다.
     * @private
     */
    function _updateLeftPanel() {
      log('update left panel');
      jndPubSub.updateLeftPanel();
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
     * Check whether id of current entity(actively looking) is same as room.
     * @param room {object}
     *  @param type {string} type of room
     *  @param id {number} id of room
     * @returns {boolean}
     * @private
     * moved to jndWebSocketCommen
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
    function attachMessagePreview(data) {
      jndPubSub.attachMessagePreview(data);
    }
  }
})();
