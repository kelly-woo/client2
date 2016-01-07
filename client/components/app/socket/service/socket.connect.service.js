/**
 * @fileoverfiew connect 관련 socket event를 처리하는 곳
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketConnect', jndWebSocketConnect);

  /* @ngInject */
  function jndWebSocketConnect(jndPubSub) {
    var CONNECT_CREATED = 'connect_created';
    var CONNECT_DELETED = 'connect_deleted';
    var CONNECT_UPDATED = 'connect_updated';

    var events = [
      {
        name: CONNECT_CREATED,
        version: 1,
        handler: _onConnectCreated
      },
      {
        name: CONNECT_DELETED,
        version: 1,
        handler: _onConnectDeleted
      },
      {
        name: CONNECT_UPDATED,
        version: 1,
        handler: _onConnectUpdated
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
     * @param socketEvent
     * @private
     */
    function _onConnectCreated(socketEvent) {
      jndPubSub.pub('webSocketConnect:connectCreated', socketEvent.data);
    }

    /**
     * connect deleted event handler
     * @param socketEvent
     * @private
     */
    function _onConnectDeleted(socketEvent) {
      jndPubSub.pub('webSocketConnect:connectDeleted', socketEvent.data);
    }

    /**
     * connect updated event handler
     * @param socketEvent
     * @private
     */
    function _onConnectUpdated(socketEvent) {
      jndPubSub.pub('webSocketConnect:connectUpdated', socketEvent.data);
    }
  }
})();
