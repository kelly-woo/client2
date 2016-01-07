/**
 * @fileoverfiew socket services들을 관리는 메니져
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketServiceHelper', jndWebSocketServiceHelper);

  /* @ngInject */
  function jndWebSocketServiceHelper() {

    // socket을 처리하기위해 필요한 모든 서비스들의 이름
    var _services = [
      'jndWebSocketFile',
      'jndWebSocketAnnouncement',
      'jndWebSocketChat',
      'jndWebSocketMember',
      'jndWebSocketMessage',
      'jndWebSocketTopic',
      'jndWebSocketLinkPreview',
      'jndWebSocketRoomMarker',
      'jndWebSocketTeam',
      'jndWebSocketConnect'
    ];

    this.getServices = getServices;

    function getServices() {
      return _services;
    }
  }
})();
