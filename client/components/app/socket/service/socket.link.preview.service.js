/**
 * @fileoverview link preview 관련 socket event 처리
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketLinkPreview', jndWebSocketLinkPreview);

  /* @ngInject */
  function jndWebSocketLinkPreview(config, jndPubSub, $timeout) {
    // link_preview_created
    var MESSAGE_PREVIEW = config.socketEvent.MESSAGE_PREVIEW;
    var MESSAGE_PREVIEW_IMAGE = 'link_preview_image';
    var events = [
      {
        name: MESSAGE_PREVIEW,
        version: 1,
        handler: _onLinkPreview
      },
      {
        name: MESSAGE_PREVIEW_IMAGE,
        version: 1,
        handler: _onLinkPreviewImage
      }
    ];

    this.getEvents = getEvents;
    function getEvents() {
      return events;
    }

    function _onLinkPreview(data) {
      jndPubSub.attachMessagePreview(data);
    }

    function _onLinkPreviewImage(data) {
      jndPubSub.attachMessagePreviewThumbnail(data);
    }
  }
})();
