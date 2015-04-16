(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocket', jndWebSocket);

  /* @ngInject */
  function jndWebSocket(socketFactory, config, currentSessionHelper, memberService, storageAPIservice,
                        entityAPIservice, jndPubSub, desktopNotificationService) {
    var socket;
    var isConnected;

    var CHECK_CONNECT_TEAM = 'check_connect_team';
    var CONNECT_TEAM = 'connect_team';
    var ERROR_CONNECT_TEAM = 'error_connect_team';

    var MESSAGE = 'message';
    var TOPIC_JOINED = 'topic_joined';
    var TOPIC_LEFT = 'topic_left';

    var MEMBER_PRESENCE_UPDATED = 'member_presence_updated';

    // Emit only events.
    var DISCONNECT_TEAM = 'disconnect_team';


    // message types
    var MESSAGE_TOPIC_JOIN = 'topic_join';
    var MESSAGE_TOPIC_LEAVE = 'topic_leave';
    var MESSAGE_TOPIC_INVITE = 'topic_invite';

    this.init = init;
    this.checkSocketConnection = checkSocketConnection;
    this.disconnectTeam = disconnectTeam;

    function init() {
      isConnected = false;
    }

    /**
     * Checks current socket connection.
     * If no socket is established, connect new one and add event listeners to it.
     *
     * If socket connection is found, WHAT SHOULD I DO? HOW DO I VERIFY CURRENT SOCKET CONNECTION?
     *
     */
    function checkSocketConnection() {
      if (!isConnected || _.isUndefined(socket)) {
        // Socket is not established yet.
        connect();
        _setSocketEventListener();
      }
    }

    /**
     * Connect to socket server and initialize socket variable.
     */
    function connect() {
      var myIoSocket = io.connect(config.socket_server);

      socket = socketFactory({
        prefix: '_jnd_socket:',
        ioSocket: myIoSocket
      });
    }

    /**
     * Add all socket event listeners to socket variable.
     * @private
     */
    function _setSocketEventListener() {
      socket.on(CHECK_CONNECT_TEAM, _onCheckConnectTeam);
      socket.on(CONNECT_TEAM, _onConnectTeam);
      socket.on(ERROR_CONNECT_TEAM, _onErrorConnectTeam);

      socket.on(TOPIC_JOINED, _onTopicJoined);
      socket.on(TOPIC_LEFT, _onTopicLeft);


      socket.on(MESSAGE, _onMessage);

      //socket.on(MEMBER_PRESENCE_UPDATED, _onMemberPresenceUpdated);


    }


    /**
     * Callback function for SUCCESSFUL socket connection.
     *  1. let socket server know of my current TEAM by emitting 'CONNECT_TEAM' event.
     *
     * @param data
     * @private
     */
    function _onCheckConnectTeam(data) {
      _socketEventLogger(CHECK_CONNECT_TEAM, data, false);
      isConnected = true;

      var param = {};

      var team = currentSessionHelper.getCurrentTeam();
      var member = memberService.getMember();
      var token = storageAPIservice.getAccessToken();

      param = {
        token: token,
        teamId: team.id,
        teamName: team.name,
        memberId: member.id,
        memberName: member.name
      };

      _emit(CONNECT_TEAM, param);

    }


    function _onConnectTeam(data) {
      _socketEventLogger(CONNECT_TEAM, data, false);
    }

    /**
     * Callback function for FAILURE in socket connection.
     *  1. Connect to socket server.
     *
     * @param data
     * @private
     */
    function _onErrorConnectTeam(data) {
      _socketEventLogger(ERROR_CONNECT_TEAM, data, false);

      isConnected = false;

      checkSocketConnection();
    }

    function _onTopicJoined(data) {
      _socketEventLogger(TOPIC_JOINED, data, false);
    }

    function _onTopicLeft(data) {
      _socketEventLogger(TOPIC_LEFT, data, false);
    }


    /**
     * List of events comes in through 'message' event.
     *  1. topic join as 'topic_join'
     *  2. topic leave as 'topic_leave'
     *
     * @param data
     * @private
     */
    function _onMessage(data) {
      var messageType = data.messageType;

      switch (messageType) {
        case MESSAGE_TOPIC_JOIN:
          _onOthersTopicJoin(data);
          break;
        case MESSAGE_TOPIC_LEAVE:
          _onOthersTopicLeave(data);
          break;
        case MESSAGE_TOPIC_INVITE:
          _onOthersTopicInvite(data);
          break;
        default:
          _onMessageCreated(data);
          break;
      }
    }

    /**
     * Callback function when others joined any topic.
     * @param param
     * @private
     */
    function _onOthersTopicJoin(param) {
      _handleSystemEvent(param.room, param.writer);

      _log(memberService.getName(entityAPIservice.getEntityById('users', param.writer)) + ' joined ' + _getRoom(param.room).name)
    }

    /**
     * Callback function when other left topic.
     *
     * @param param
     * @private
     */
    function _onOthersTopicLeave(param) {
      _handleSystemEvent(param.room, param.writer);

      _log(memberService.getName(entityAPIservice.getEntityById('users', param.writer)) + ' left ' + _getRoom(param.room).name)
    }


    /**
     * Callback function when other left topic.
     *
     * @param param
     * @private
     */
    function _onOthersTopicInvite(param) {
      _handleSystemEvent(param.room, param.writer);

      _log(memberService.getName(entityAPIservice.getEntityById('users', param.writer)) + ' invited ' + param.inviter.length + ' people to ' + _getRoom(param.room).name)
    }

    function _onMessageCreated(param) {
      //_handleSystemEvent(param.room, param.writer);
      var room = _getRoom(param.room);

      if (_.isUndefined(room)) {
        _log('not related room event');
        return;
      }

      if (_isCurrentRoom(room)) {
        _log('event in current room');
        _updateCenterMessage();
        return;
      }

      var writer = entityAPIservice.getEntityById('users', param.writer);
      if (_.isUndefined(writer)) {
        _log('An action of an unknown user');
        return;
      }

      _updateLeftPanel();

      console.log('sending out notification')
      desktopNotificationService.addNotification(writer, room);

      _log(memberService.getName(entityAPIservice.getEntityById('users', param.writer)) + ' wrote a message at ' + _getRoom(param.room).name)
    }

    function _onMemberPresenceUpdated(data) {
      _socketEventLogger(MEMBER_PRESENCE_UPDATED, data, false);
    }


    function _handleSystemEvent(room, writer) {
      var room = _getRoom(room);

      if (_.isUndefined(room)) {
        _log('not related room event');
        return;
      }

      if (_isCurrentRoom(room)) {
        _log('event in current room');
        _updateCenterMessage();
        return;
      }

      var writer = entityAPIservice.getEntityById('users', writer);
      if (_.isUndefined(writer)) {
        _log('An action of an unknown user');
        return;
      }

      _updateLeftPanel();
    }


    /**
     * Disconnect socket connection.
     * Used when user
     *  1. signs out.
     *  2. switches team.
     */
    function disconnectTeam() {
      _socketEventLogger(DISCONNECT_TEAM, data, true);

      var param = {
        teamId: currentSessionHelper.getTeamId(),
        memberId: memberService.getMemberId()
      };

      _emit(DISCONNECT_TEAM, param);
    }
    /**
     * Wrapper of emit doing basically same thing.
     *
     * @param eventName
     * @param data
     */
    function _emit(eventName, data) {
      socket.emit(eventName, data);

      _socketEventLogger(eventName, data, true);
    }


    function _getRoom(room) {
      console.log(room.type)
      return entityAPIservice.getEntityById(room.type, room.id);
    }
    function _isCurrentRoom(room) {
      var roomId = room.id;
      var currentEntity = currentSessionHelper.getCurrentEntity();

      return roomId === currentEntity.id;
    }

    function _updateLeftPanel() {
      jndPubSub.updateLeftPanel();
    }

    function _updateCenterMessage() {
      jndPubSub.updateChatList();
    }


    function _socketEventLogger(event, data, isEmitting) {
      if (_isTestingMode()) {
        console.log("======================", isEmitting ? 'EMIT' : 'RECEIVE', "======================  ")
        console.log('event name: ', event);
        console.log('event data: ', data);
        console.log("")
      }
    }

    function _log(msg) {
      if (_isTestingMode()) console.log(msg);
    }

    function _isTestingMode() {
      return config.name === 'local' || config.name === 'development';
    }


  }
})();