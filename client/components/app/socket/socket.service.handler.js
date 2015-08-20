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
  function jndWebSocketHelper(logger) {
    this.socketEventLogger = socketEventLogger;
    this.log = log;

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
  }
})();
