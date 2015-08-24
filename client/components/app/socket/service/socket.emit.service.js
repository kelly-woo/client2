/**
 * @fileoverview socekt event 를 emit하는 service
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketEmitter', jndWebSocketEmitter);

  /* @ngInject */
  function jndWebSocketEmitter() {
    var _socket;

    this.setSocket = setSocket;
    this.emit = emit;

    /**
     * emit 할 소켓을 설정한다.
     * @param {object} socket - socket object
     */
    function setSocket(socket) {
      _socket = socket;
    }

    /**
     * Wrapper for emit socket event.
     * @param eventName {string} name of event to be emitted
     * @param data {object} object to be attached along with socket event
     */
    function emit(eventName, data) {
      _socket.emit(eventName, data)
    }
  }
})();
