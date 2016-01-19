/**
 * @fileoverfiew connect 관련 socket event를 처리하는 곳
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketConnect', jndWebSocketConnect);

  /* @ngInject */
  function jndWebSocketConnect(jndPubSub, entityAPIservice) {
    var CONNECT_CREATED = 'connect_created';
    var CONNECT_DELETED = 'connect_deleted';
    var CONNECT_UPDATED = 'connect_updated';

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

      entityAPIservice.addBot(data.bot);
      jndPubSub.pub('webSocketConnect:connectCreated', data);
    }

    /**
     * connect updated event handler
     * @param {object} socketEvent
     */
    function onConnectUpdated(socketEvent) {
      var data = socketEvent.data;

      entityAPIservice.updateBot(data.bot);
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
  }
})();
