/**
 * @fileoverfiew connect 관련 socket event를 처리하는 곳
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketConnect', jndWebSocketConnect);

  /* @ngInject */
  function jndWebSocketConnect(jndPubSub, BotList) {
    var CONNECT_CREATED = 'connect_created';
    var CONNECT_DELETED = 'connect_deleted';
    var CONNECT_UPDATED = 'connect_updated';
    var AUTHENTICATION_CREATED = 'authentication_created';

    var events = [
      {
        name: CONNECT_CREATED,
        version: 1,
        handler: onConnectCreated
      },
      {
        name: CONNECT_UPDATED,
        version: 1,
        handler: onConnectUpdated
      },
      {
        name: CONNECT_DELETED,
        version: 1,
        handler: onConnectDeleted
      },
      {
        name: AUTHENTICATION_CREATED,
        version: 1,
        handler: onAuthenticationCreated
      }
    ];

    this.getEvents = getEvents;

    /**
     * 이 서비스가 관리할 소켓이벤트들과 그에 해당하는 handler를 리턴한다.
     * @returns {{name: string, handler: _onChatClose}[]}
     */
    function getEvents() {
      return events;
    }

    /**
     * connect created event handler
     * @param {object} socketEvent
     */
    function onConnectCreated(socketEvent) {
      var data = socketEvent.data;
      BotList.add(data.bot);
      jndPubSub.pub('webSocketConnect:connectCreated', data);
    }

    /**
     * connect updated event handler
     * @param {object} socketEvent
     */
    function onConnectUpdated(socketEvent) {
      var data = socketEvent.data;
      _.extend(BotList.get(data.bot.id), data.bot);
      jndPubSub.pub('webSocketConnect:connectUpdated', data);
    }

    /**
     * connect deleted event handler
     * @param {object} socketEvent
     */
    function onConnectDeleted(socketEvent) {
      var data = socketEvent.data;

      jndPubSub.pub('webSocketConnect:connectDeleted', data);
    }

    /**
     * 계정 생성 성공 시 이벤트 핸들러
     * @param {object} socketEvent
     */
    function onAuthenticationCreated(socketEvent) {
      var data = socketEvent.data;

      jndPubSub.pub('webSocketConnect:authenticationCreated', data);
    }
  }
})();
