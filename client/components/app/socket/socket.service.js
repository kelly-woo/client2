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
  function jndWebSocket($rootScope, socketFactory, config, currentSessionHelper, memberService, storageAPIservice,
                        jndWebSocketHelper, jndWebSocketAnnouncement, $injector, NetInterceptor, jndWebSocketTopic,
                        jndWebSocketMessage, jndWebSocketFile, jndWebSocketMember,
                        jndPubSub) {
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

    var MEMBER_PROFILE_UPDATED = 'member_profile_updated';

    var ROOM_MARKER_UPDATED = 'room_marker_updated';

    // Emit only event
    var DISCONNECT_TEAM = 'disconnect_team';

    var MESSAGE_STARRED = 'message_starred';
    var MESSAGE_UNSTARRED = 'message_unstarred';

    var MESSAGE_PREVIEW = config.socketEvent.MESSAGE_PREVIEW;

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
      if (isConnected && false) {
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

      socket.on(CHAT_CLOSE, _onChatClose);

      socket.on(ROOM_MARKER_UPDATED, _onRoomMarkerUpdated);

      socket.on(MEMBER_PROFILE_UPDATED, _onMemberProfileUpdated);

      socket.on(MESSAGE_PREVIEW, _onMessagePreview);

      socket.on(MESSAGE_STARRED, _onMessageStarred);
      socket.on(MESSAGE_UNSTARRED, _onMessageUnStarred);


      jndWebSocketMember.attachSocketEvent(socket);
      jndWebSocketTopic.attachSocketEvent(socket);
      jndWebSocketMessage.attachSocketEvent(socket);
      jndWebSocketAnnouncement.attachSocketEvent(socket);
      jndWebSocketFile.attachSocketEvent(socket);
    }

    /**
     * starred message 이벤트 핸들러
     * @param {object} socketEvent
     * @private
     */
    function _onMessageStarred(socketEvent) {
      var data = socketEvent.data;
      jndWebSocketHelper.socketEventLogger(MESSAGE_STARRED, socketEvent, false);

      if (parseInt(memberService.getMemberId(), 10) === parseInt(data.memberId, 10)) {
        jndPubSub.pub('starred', data);
      }
    }

    /**
     * unStarred message 이벤트 핸들러
     * @param {object} socketEvent
     * @private
     */
    function _onMessageUnStarred(socketEvent) {
      var data = socketEvent.data;
      jndWebSocketHelper.socketEventLogger(MESSAGE_UNSTARRED, socketEvent, false);
      if (parseInt(memberService.getMemberId(), 10) === parseInt(data.memberId, 10)) {
        jndPubSub.pub('unStarred', data);
      }
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
      //jndWebSocketHelper.socketEventLogger(TOPIC_STARRED, data, false);
      //jndWebSocketHelper.topicChangeEventHandler(data);
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
      //jndWebSocketHelper.socketEventLogger(MEMBER_PROFILE_UPDATED, data, false);
      //jndWebSocketHelper.memberProfileUpdatedHandler(data);
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
