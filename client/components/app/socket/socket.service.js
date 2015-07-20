/**
 * @fileoverview 소켓 이벤트를 받기만하고 소켓 이벤트 핸들러로 넘겨주는 곳. Service that manages(emits and receives) socket event.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocket', jndWebSocket);

  /* @ngInject */
  function jndWebSocket($rootScope, socketFactory, config, currentSessionHelper, memberService, storageAPIservice, jndWebSocketHelper, jndWebSocketAnnouncement, $injector, NetInterceptor, jndWebSocketTopic) {
    var $scope = $rootScope.$new();
    var socket;
    var ioSocket;
    var isConnected;

    var CHECK_CONNECT_TEAM = 'check_connect_team';
    var CONNECT_TEAM = 'connect_team';
    var ERROR_CONNECT_TEAM = 'error_connect_team';

    var TEAM_NAME_UPDATED = 'team_name_updated';
    var TEAM_DOMAIN_UPDATED = 'team_domain_updated';

    var TOPIC_STARRED = 'topic_starred';

    var CHAT_CLOSE = 'chat_close';
    var MEMBER_STARRED = 'member_starred';
    var MEMBER_UNSTARRED = 'member_unstarred';

    var MEMBER_PROFILE_UPDATED = 'member_profile_updated';
    var MEMBER_PRESENCE_UPDATED = 'member_presence_updated';

    var FILE_DELETED = 'file_deleted';
    var FILE_COMMENT_CREATED = 'file_comment_created';
    var FILE_COMMENT_DELETED = 'file_comment_deleted';

    var ROOM_MARKER_UPDATED = 'room_marker_updated';

    // Emit only event
    var DISCONNECT_TEAM = 'disconnect_team';



    var ANNOUNCEMENT_CREATED =  config.socketEvent.announcement.created;
    var ANNOUNCEMENT_DELETED = config.socketEvent.announcement.deleted;
    var ANNOUNCEMENT_STATUS_UPDATED = config.socketEvent.announcement.status_updated;

    // message types
    var MESSAGE = config.socketEvent.MESSAGE;

    var MESSAGE_TOPIC_JOIN = config.socketEvent.MESSAGE_TOPIC_JOIN;
    var MESSAGE_TOPIC_LEAVE = config.socketEvent.MESSAGE_TOPIC_LEAVE;
    var MESSAGE_TOPIC_INVITE = config.socketEvent.MESSAGE_TOPIC_INVITE;

    var MESSAGE_FILE_SHARE = config.socketEvent.MESSAGE_FILE_SHARE;
    var MESSAGE_FILE_UNSHARE = config.socketEvent.MESSAGE_FILE_UNSHARE;

    var MESSAGE_FILE_COMMENT = config.socketEvent.MESSAGE_FILE_COMMENT;

    var MESSAGE_PREVIEW = config.socketEvent.MESSAGE_PREVIEW;

    // variables with '_APP_' has nothing to do with socket server. Just for internal use.
    var _APP_GOT_NEW_MESSAGE = 'app_got_new_message';

    this.init = init;
    this.disconnect = disconnect;
    this.checkSocketConnection = checkSocketConnection;
    this.disconnectTeam = disconnectTeam;

    /**
     * Initialize variables.
     */
    function init() {
      disconnect();
    }

    /**
     * socket connection 을 끊는다.
     */
    function disconnect() {
      if (socket && ioSocket) {
        socket.removeAllListeners();
        ioSocket.io.disconnect();
      }
      isConnected = false;
    }

    /**
     * Check current socket connection status.
     * If no socket connection has been established, connect new one and add event listeners to it.
     * If socket connection is found, WHAT SHOULD I DO? HOW DO I VERIFY CURRENT SOCKET CONNECTION?
     */
    function checkSocketConnection() {
      if (!isConnected || _.isUndefined(socket)) {
        // Socket is not established yet.
        connect();
      }
    }

    /**
     * Connect to socket server and initialize socket variable.
     */
    function connect() {
      socket && socket.removeAllListeners();

      // When connecting to socket, always force new connection.
      ioSocket = io.connect(config.socket_server, {
        'forceNew': true,
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax': 1000,
        'timeout': 100
      });
      socket = socketFactory({
        prefix: '_jnd_socket:',
        ioSocket: ioSocket
      });
      $scope.$on('disconnected', _onDisconnected);
      _setSocketEventListener();
    }

    /**
     * disconnected 이벤트 핸들러
     * @private
     */
    function _onDisconnected() {
      if (isConnected) {
        socket.removeAllListeners();
        ioSocket.io.disconnect();
        ioSocket.io.connect();
        _setSocketEventListener();
      }
      isConnected = false;
    }

    /**
     * socket connect 이벤트 핸들러
     * @private
     */
    function _onSocketConnect() {
      isConnected = true;
      NetInterceptor.setStatus(true);
      _setSocketEventListener();
    }

    /**
     * socket disconnect 이벤트 핸들러
     * @private
     */
    function _onSocketDisconnect() {
      isConnected = false;
      NetInterceptor.setStatus(false);
    }

    /**
     * Add all socket event listeners to socket variable.
     * @private
     */
    function _setSocketEventListener() {
      socket.removeAllListeners();
      socket.on('connect', _onSocketConnect);
      socket.on('disconnect', _onSocketDisconnect);
      socket.on(CHECK_CONNECT_TEAM, _onCheckConnectTeam);
      socket.on(CONNECT_TEAM, _onConnectTeam);
      socket.on(ERROR_CONNECT_TEAM, _onErrorConnectTeam);

      socket.on(TEAM_NAME_UPDATED, _onTeamNameUpdated);
      socket.on(TEAM_DOMAIN_UPDATED, _onTeamDomainUpdated);

      socket.on(MEMBER_STARRED, _onStarredEvent);
      socket.on(MEMBER_UNSTARRED, _onStarredEvent);

      socket.on(CHAT_CLOSE, _onChatClose);

      socket.on(FILE_DELETED, _onFileDeleted);

      socket.on(FILE_COMMENT_CREATED, _onFileCommentCreated);
      socket.on(FILE_COMMENT_DELETED, _onFileCommentDeleted);

      socket.on(ROOM_MARKER_UPDATED, _onRoomMarkerUpdated);

      socket.on(MESSAGE, _onMessage);

      socket.on(MEMBER_PROFILE_UPDATED, _onMemberProfileUpdated);

      socket.on(MESSAGE_PREVIEW, _onMessagePreview);

      socket.on(ANNOUNCEMENT_CREATED, _onAnnouncement);
      socket.on(ANNOUNCEMENT_DELETED, _onAnnouncement);
      socket.on(ANNOUNCEMENT_STATUS_UPDATED, _onAnnouncement);

      jndWebSocketTopic.attachSocketEvent(socket);
    }


    /**
     * Socket event receiver - SUCCESS socket connection.
     *  1. let socket server know of my current TEAM by emitting 'CONNECT_TEAM' event.
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


    /**
     * Socket event receiver - connect_team
     *  1. Update local variable.
     * @param data {object} data object that comes with socket event
     * @private
     */
    function _onConnectTeam(data) {
      jndWebSocketHelper.socketEventLogger(CONNECT_TEAM, data, false);
      isConnected = true;
    }

    /**
     * Socket event receiver - error_connect_team
     *  1. Connect to socket server.
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

    /**
     * Socket event receiver - team_name_updated
     * @param data {object}
     * @private
     */
    function _onTeamNameUpdated(data) {
      jndWebSocketHelper.socketEventLogger(TEAM_NAME_UPDATED, data, false);
      jndWebSocketHelper.teamNameChangeEventHandler(data);
    }

    /**
     * Socket event receiver - team_domain_updated
     * @param data {object]
     * @private
     */
    function _onTeamDomainUpdated(data) {
      jndWebSocketHelper.socketEventLogger(TEAM_DOMAIN_UPDATED, data, false);
      jndWebSocketHelper.teamDomainChangeEventHandler(data);
    }


    /**
     * Socket event receiver - topic_starred
     * @param data {object}
     * @private
     */
    function _onStarredEvent(data) {
      jndWebSocketHelper.socketEventLogger(TOPIC_STARRED, data, false);
      jndWebSocketHelper.topicChangeEventHandler(data);
    }

    /**
     * Socket event receiver - chat_close
     * @param data {object}
     * @private
     */
    function _onChatClose(data) {
      jndWebSocketHelper.socketEventLogger(CHAT_CLOSE, data, false);
      jndWebSocketHelper.chatMessageListEventHandler(data);
    }

    /**
     * Socket event receiver - file_deleted
     * @param data {object}
     * @private
     */
    function _onFileDeleted(data) {
      jndWebSocketHelper.socketEventLogger(FILE_DELETED, data, false);
      jndWebSocketHelper.fileDeletedHandler(data);
    }

    /**
     * Socket event receiver - file_comment_created
     * @param data {object}
     * @private
     */
    function _onFileCommentCreated(data) {
      jndWebSocketHelper.socketEventLogger(FILE_COMMENT_CREATED, data, false);
      jndWebSocketHelper.fileCommentCreatedHandler(data);
    }

    /**
     * Socket event receiver - file_comment_deleted
     * @param data {object}
     * @private
     */
    function _onFileCommentDeleted(data) {
      jndWebSocketHelper.socketEventLogger(FILE_COMMENT_DELETED, data, false);
      jndWebSocketHelper.fileCommentDeletedHandler(data);
    }

    /**
     * Socket event receiver - room_marker_updated
     * @param data {object}
     * @private
     */
    function _onRoomMarkerUpdated(data) {
      jndWebSocketHelper.socketEventLogger(ROOM_MARKER_UPDATED, data, false);
      jndWebSocketHelper.roomMarkerUpdatedHandler(data);
    }



    /**
     * Socket event receiver - member_profile_updated
     * @param data {object}
     * @private
     */
    function _onMemberProfileUpdated(data) {
      jndWebSocketHelper.socketEventLogger(MEMBER_PROFILE_UPDATED, data, false);
      jndWebSocketHelper.memberProfileUpdatedHandler(data);
    }


    /**
     * List of events comes in through 'message' event.
     *  1. topic join as 'topic_join'
     *  2. topic leave as 'topic_leave'
     * @param data {object}
     * @private
     */
    function _onMessage(data) {
      var messageType = data.messageType;

      if (messageType === MESSAGE_FILE_COMMENT) {
        // File comment event is handled in different handler since its 'rooms' attribute is an array.
        jndWebSocketHelper.socketEventLogger(messageType, data, false);
        jndWebSocketHelper.messageEventFileCommentHandler(data);
      } else if (messageType === MESSAGE_TOPIC_LEAVE) {
        jndWebSocketHelper.socketEventLogger(messageType, data, false);
        jndWebSocketHelper.messageEventTopicLeaveHandler(data);
      } else if (messageType === MESSAGE_TOPIC_JOIN && currentSessionHelper.getDefaultTopicId() === data.room.id) {
        // Someone joined 'default topic' -> new member just joined team!!
        jndWebSocketHelper.newMemberHandler(data);
      } else {
        if (messageType === MESSAGE_FILE_SHARE || messageType === MESSAGE_FILE_UNSHARE) {
          jndWebSocketHelper.messageEventFileShareUnshareHandler(data);
        }

        messageType = messageType || _APP_GOT_NEW_MESSAGE;

        jndWebSocketHelper.socketEventLogger(messageType, data, false);
        jndWebSocketHelper.eventStatusLogger(messageType, data);

        jndWebSocketHelper.messageEventHandler(messageType, data);
      }

      // var messageType = data.messageType;

      // if (messageType === MESSAGE_FILE_COMMENT) {
      //   // File comment event is handled in different handler since its 'rooms' attribute is an array.
      //   jndWebSocketHelper.socketEventLogger(messageType, data, false);
      //   jndWebSocketHelper.messageEventFileCommentHandler(data);
      //   return;
      // }

      // if (messageType === MESSAGE_FILE_SHARE || messageType === MESSAGE_FILE_UNSHARE) {
      //   jndWebSocketHelper.messageEventFileShareUnshareHandler(data);
      //   //return;
      // }

      // if (messageType === MESSAGE_TOPIC_LEAVE) {
      //   jndWebSocketHelper.messageEventTopicLeaveHandler(data);
      //   return;
      // }

      // if (messageType === MESSAGE_TOPIC_JOIN) {

      //   if (currentSessionHelper.getDefaultTopicId() === data.room.id) {
      //     // Someone joined 'default topic' -> new member just joined team!!
      //     jndWebSocketHelper.newMemberHandler(data);
      //     return;
      //   }
      // }
      // messageType = messageType || _APP_GOT_NEW_MESSAGE;

      // jndWebSocketHelper.socketEventLogger(messageType, data, false);
      // jndWebSocketHelper.eventStatusLogger(messageType, data);

      // jndWebSocketHelper.messageEventHandler(messageType, data);
    }

    function _onAnnouncement(data) {
      //jndWebSocketHelper.socketEventLogger('ANNOUNCEMENT', data, false);
      jndWebSocketAnnouncement.onAnnouncementEvent(data);
    }
    /**
     * Disconnect socket connection by emitting 'disconnect_team' socket event.
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
     * Wrapper for emit socket event.
     * @param eventName {string} name of event to be emitted
     * @param data {object} object to be attached along with socket event
     */
    function _emit(eventName, data) {
      socket.emit(eventName, data);
      jndWebSocketHelper.socketEventLogger(eventName, data, true);
    }

    /**
     * Update authorization token.
     * @private
     */
    function _onInvalidSocketToken() {
      var authAPIservice = $injector.get('authAPIservice');

      if (angular.isUndefined(authAPIservice)) return;

      authAPIservice.requestAccessTokenWithRefreshToken();
    }

    /**
     * Socket event receiver - link_preview_created
     * @param {object} data
     * @private
     */
    function _onMessagePreview(data) {
      jndWebSocketHelper.socketEventLogger(data.event, data, false);
      jndWebSocketHelper.eventStatusLogger(data.event, data);

      jndWebSocketHelper.attachMessagePreview(data);
    }
  }
})();
