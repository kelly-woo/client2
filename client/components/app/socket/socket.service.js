(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocket', jndWebSocket);

  /* @ngInject */
  function jndWebSocket($rootScope, socketFactory, config, currentSessionHelper, memberService, storageAPIservice, jndWebSocketHelper, $injector, NetInterceptor) {
    var $scope = $rootScope.$new();
    var socket;
    var isConnected;

    var CHECK_CONNECT_TEAM = 'check_connect_team';
    var CONNECT_TEAM = 'connect_team';
    var ERROR_CONNECT_TEAM = 'error_connect_team';

    var TEAM_NAME_UPDATED = 'team_name_updated';
    var TEAM_DOMAIN_UPDATED = 'team_domain_updated';

    var TOPIC_JOINED = 'topic_joined';
    var TOPIC_LEFT = 'topic_left';
    var TOPIC_DELETED = 'topic_deleted';
    var TOPIC_CREATED = 'topic_created';
    var TOPIC_NAME_UPDATED = 'topic_name_updated';

    var TOPIC_STARRED = 'topic_starred';
    var TOPIC_UNSTARRED = 'topic_unstarred';

    var CHAT_CLOSE = 'chat_close';
    var MEMBER_STARRED = 'member_starred';
    var MEMBER_UNSTARRED = 'member_unstarred';

    var MEMBER_PROFILE_UPDATED = 'member_profile_updated';
    var MEMBER_PRESENCE_UPDATED = 'member_presence_updated';

    var FILE_DELETED = 'file_deleted';
    var FILE_COMMENT_CREATED = 'file_comment_created';
    var FILE_COMMENT_DELETED = 'file_comment_deleted';

    var ROOM_MARKER_UPDATED = 'room_marker_updated';

    // Emit only events.
    var DISCONNECT_TEAM = 'disconnect_team';



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
      // When connecting to socket, always force new connection.

      var myIoSocket = io.connect(config.socket_server, {forceNew: true});

      socket = socketFactory({
        prefix: '_jnd_socket:',
        ioSocket: myIoSocket
      });
      _bindConnectionEvents(myIoSocket);
    }

    function _bindConnectionEvents(ioSocket) {
      ioSocket.on('connect', function() {
        NetInterceptor.setStatus(true);
        console.log('### socket connect');
      });
      ioSocket.on('reconnecting', function() {
        console.log('### socket reconnecting');
      });
      ioSocket.on('disconnect', function() {
        NetInterceptor.setStatus(false);
        console.log('### socket disconnect');
      });
      $scope.$on('disconnected', function() {
        console.log('### socket disconnect recieverrr');
        ioSocket.io.disconnect();
        ioSocket.io.connect();
      });
      $scope.$on('connected', function() {
        console.log('### socket connect recieverrr');
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

      socket.on(TEAM_NAME_UPDATED, _onTeamNameUpdated);
      socket.on(TEAM_DOMAIN_UPDATED, _onTeamDomainUpdated);

      socket.on(TOPIC_JOINED, _onTopicJoined);
      socket.on(TOPIC_LEFT, _onTopicLeft);
      socket.on(TOPIC_DELETED, _onTopicLDeleted);
      socket.on(TOPIC_CREATED, _onTopicLCreated);
      socket.on(TOPIC_NAME_UPDATED, _onTopicLNameUpdated);

      socket.on(TOPIC_STARRED, _onStarredEvent);
      socket.on(TOPIC_UNSTARRED, _onStarredEvent);
      socket.on(MEMBER_STARRED, _onStarredEvent);
      socket.on(MEMBER_UNSTARRED, _onStarredEvent);

      socket.on(CHAT_CLOSE, _onChatClose);


      socket.on(FILE_DELETED, _onFileDeleted);

      socket.on(FILE_COMMENT_CREATED, _onFileCommentCreated);
      socket.on(FILE_COMMENT_DELETED, _onFileCommentDeleted);

      socket.on(ROOM_MARKER_UPDATED, _onRoomMarkerUpdated);


      socket.on(MESSAGE, _onMessage);

      socket.on(MEMBER_PROFILE_UPDATED, _onMemberProfileUpdated);
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
      isConnected = true;
    }

    /**
     * Callback function for FAILURE in socket connection.
     *  1. Connect to socket server.
     *
     * @param data
     * @private
     */
    function _onErrorConnectTeam(data) {
      var INVALID_SOCKET_TOKEN = 'Invalid token';
      isConnected = false;

      jndWebSocketHelper.socketEventLogger(ERROR_CONNECT_TEAM, data, false);

      if (data.message === INVALID_SOCKET_TOKEN) {
        _onInvalidSocketToken();
        return;
      }

      checkSocketConnection();
    }

    function _onTeamNameUpdated(data) {
      jndWebSocketHelper.socketEventLogger(TEAM_NAME_UPDATED, data, false);
      jndWebSocketHelper.teamNameChangeEventHandler(data);
    }
    function _onTeamDomainUpdated(data) {
      jndWebSocketHelper.socketEventLogger(TEAM_DOMAIN_UPDATED, data, false);
      jndWebSocketHelper.teamDomainChangeEventHandler(data);
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

    function _onStarredEvent(data) {
      jndWebSocketHelper.socketEventLogger(TOPIC_STARRED, data, false);
      jndWebSocketHelper.topicChangeEventHandler(data);
    }

    function _onChatClose(data) {
      jndWebSocketHelper.socketEventLogger(CHAT_CLOSE, data, false);
      jndWebSocketHelper.chatMessageListEventHandler(data);
    }

    function _onFileDeleted(data) {
      jndWebSocketHelper.socketEventLogger(FILE_DELETED, data, false);
      jndWebSocketHelper.fileDeletedHandler(data);
    }

    function _onFileCommentCreated(data) {
      jndWebSocketHelper.socketEventLogger(FILE_COMMENT_CREATED, data, false);
      jndWebSocketHelper.fileCommentCreatedHandler(data);
    }

    function _onFileCommentDeleted(data) {
      jndWebSocketHelper.socketEventLogger(FILE_COMMENT_DELETED, data, false);
      jndWebSocketHelper.fileCommentDeletedHandler(data);
    }

    function _onRoomMarkerUpdated(data) {
      jndWebSocketHelper.socketEventLogger(ROOM_MARKER_UPDATED, data, false);
      jndWebSocketHelper.roomMarkerUpdatedHandler(data);
    }



    function _onMemberProfileUpdated(data) {
      jndWebSocketHelper.socketEventLogger(MEMBER_PROFILE_UPDATED, data, false);
      jndWebSocketHelper.memberProfileUpdatedHandler(data);
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

      if (messageType === MESSAGE_FILE_COMMENT) {
        // File comment event is handled in different handler since its 'rooms' attribute is an array.
        jndWebSocketHelper.socketEventLogger(messageType, data, false);
        jndWebSocketHelper.messageEventFileCommentHandler(data);
        return;
      }

      if (messageType === MESSAGE_FILE_SHARE || messageType === MESSAGE_FILE_UNSHARE) {
        jndWebSocketHelper.messageEventFileShareUnshareHandler(data);
        //return;
      }

      if (messageType === MESSAGE_TOPIC_LEAVE) {
        jndWebSocketHelper.messageEventTopicLeaveHandler(data);
        return;
      }

      if (messageType === MESSAGE_TOPIC_JOIN) {

        if (currentSessionHelper.getDefaultTopicId() === data.room.id) {
          // Someone joined 'default topic' -> new member just joined team!!
          jndWebSocketHelper.newMemberHandler(data);
          return;
        }
      }
      messageType = messageType || _APP_GOT_NEW_MESSAGE;

      jndWebSocketHelper.socketEventLogger(messageType, data, false);
      jndWebSocketHelper.eventStatusLogger(messageType, data);

      jndWebSocketHelper.messageEventHandler(messageType, data);
    }

    /**
     * Disconnect socket connection.
     * Used when user
     *  1. signs out.
     *  2. switches team.
     */
    function disconnectTeam() {
      if (currentSessionHelper.getSocketConnection()) {
        currentSessionHelper.resetSocketConnection();

        var param = {
          teamId: memberService.getTeamId(),
          memberId: memberService.getMemberId()
        };

        _emit(DISCONNECT_TEAM, param);

        // Update socket status variable.
        isConnected = false;
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


    function _onInvalidSocketToken() {
      var authAPIservice = $injector.get('authAPIservice');

      if (angular.isUndefined(authAPIservice)) return;

      authAPIservice.requestAccessTokenWithRefreshToken();
    }
  }
})();
