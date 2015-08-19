/**
 * @fileoverview link preview 관련 socket event 처리
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketLinkPreview', jndWebSocketLinkPreview);

  /* @ngInject */
  function jndWebSocketLinkPreview(config, jndPubSub) {
    // link_preview_created
    var MESSAGE_PREVIEW = config.socketEvent.MESSAGE_PREVIEW;
    var events = [
      {
        name: MESSAGE_PREVIEW,
        handler: _onLinkPreview
      }
    ];

    this.getEvents = getEvents;
    function getEvents() {
      return events;
    }

    function _onLinkPreview(data) {
      jndPubSub.attachMessagePreview(data);
    }
  }
})();
