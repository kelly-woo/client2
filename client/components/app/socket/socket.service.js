(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocket', jndWebSocket);

  /* @ngInject */
  function jndWebSocket(socketFactory, config, currentSessionHelper, memberService, storageAPIservice,
                        entityAPIservice, jndWebSocketHelper) {
    var socket;
    var isConnected;

    var CHECK_CONNECT_TEAM = 'check_connect_team';
    var CONNECT_TEAM = 'connect_team';
    var ERROR_CONNECT_TEAM = 'error_connect_team';


    var TOPIC_JOINED = 'topic_joined';
    var TOPIC_LEFT = 'topic_left';
    var TOPIC_DELETED = 'topic_deleted';
    var TOPIC_CREATED = 'topic_created';
    var TOPIC_NAME_UPDATED = 'topic_name_updated';

    var TOPIC_STARRED = 'topic_starred';
    var TOPIC_UNSTARRED = 'topic_unstarred';

    var MEMBER_PRESENCE_UPDATED = 'member_presence_updated';

    // Emit only events.
    var DISCONNECT_TEAM = 'disconnect_team';


    // message types
    var MESSAGE = 'message';
    var MESSAGE_TOPIC_JOIN = 'topic_join';
    var MESSAGE_TOPIC_LEAVE = 'topic_leave';
    var MESSAGE_TOPIC_INVITE = 'topic_invite';
    var MESSAGE_DELETE = 'message_delete';

    // variables with '_APP_' has nothing to do with socket server. Just for internal use.
    var _APP_GOT_NEW_MESSAGE = 'app_got_new_message';

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
      socket.on(TOPIC_DELETED, _onTopicLDeleted);
      socket.on(TOPIC_CREATED, _onTopicLCreated);
      socket.on(TOPIC_NAME_UPDATED, _onTopicLNameUpdated);

      socket.on(TOPIC_STARRED, _onTopicStarred);
      socket.on(TOPIC_UNSTARRED, _onTopicStarred);


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
      jndWebSocketHelper.socketEventLogger(CHECK_CONNECT_TEAM, data, false);

      currentSessionHelper.setSocketConnection();
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
      jndWebSocketHelper.socketEventLogger(CONNECT_TEAM, data, false);
    }

    /**
     * Callback function for FAILURE in socket connection.
     *  1. Connect to socket server.
     *
     * @param data
     * @private
     */
    function _onErrorConnectTeam(data) {
      jndWebSocketHelper.socketEventLogger(ERROR_CONNECT_TEAM, data, false);

      isConnected = false;

      checkSocketConnection();
    }

    function _onTopicJoined(data) {
      jndWebSocketHelper.socketEventLogger(TOPIC_JOINED, data, false);
      jndWebSocketHelper.topicChangeEventHandler(data);
    }

    function _onTopicLeft(data) {
      jndWebSocketHelper.socketEventLogger(TOPIC_LEFT, data, false);
      jndWebSocketHelper.topicLeaveHandler(data);
    }

    function _onTopicLDeleted(data) {
      jndWebSocketHelper.socketEventLogger(TOPIC_DELETED, data, false);
      jndWebSocketHelper.topicLeaveHandler(data);
    }

    function _onTopicLCreated(data) {
      jndWebSocketHelper.socketEventLogger(TOPIC_CREATED, data, false);
      jndWebSocketHelper.topicChangeEventHandler(data);
    }
    function _onTopicLNameUpdated(data) {
      jndWebSocketHelper.socketEventLogger(TOPIC_NAME_UPDATED, data, false);
      jndWebSocketHelper.topicChangeEventHandler(data);
    }

    function _onTopicStarred(data) {
      jndWebSocketHelper.socketEventLogger(TOPIC_STARRED, data, false);
      jndWebSocketHelper.topicChangeEventHandler(data);

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
          break;
        case MESSAGE_TOPIC_LEAVE:
          break;
        case MESSAGE_TOPIC_INVITE:
          break;
        case MESSAGE_DELETE:
          break;
        default:
          messageType = _APP_GOT_NEW_MESSAGE;
          break;
      }

      jndWebSocketHelper.socketEventLogger(messageType, data, false);
      jndWebSocketHelper.eventStatusLogger(messageType, data);

      jndWebSocketHelper.messageEventHandler(data.room, data.writer, messageType);

    }

    /**
     * Disconnect socket connection.
     * Used when user
     *  1. signs out.
     *  2. switches team.
     */
    function disconnectTeam() {
      if (currentSessionHelper.getSocketConnection()) {
        jndWebSocketHelper.socketEventLogger(DISCONNECT_TEAM, '', true);
        currentSessionHelper.resetSocketConnection();
        var param = {
          teamId: memberService.getTeamId(),
          memberId: memberService.getMemberId()
        };

        _emit(DISCONNECT_TEAM, param);
      }
    }
    /**
     * Wrapper of emit doing basically same thing.
     *
     * @param eventName
     * @param data
     */
    function _emit(eventName, data) {
      socket.emit(eventName, data);

      jndWebSocketHelper.socketEventLogger(eventName, data, true);
    }



  }
})();