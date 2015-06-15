/**
 * @fileoverview 서버 주소를 비롯 다른 서비스들에서 사용되어지는 상수들을 정의/재정렬하는 곳.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.config')
    .service('config', config);

  /* @ngInject */
  function config(configuration) {

    // TODO WHY DID YOU USE self?
    var self = this;

    this.init = init;

    function init($rootScope) {
      // TODO: SHOULD NOT BE USING $rootScope in this way.
      // TODO: MUST HAVE A SEPARATE SERVICE FOR CONSTANTS.
      // compatibility for current version
      $rootScope.server_address   = configuration.api_address + "inner-api/";
      $rootScope.server_uploaded  = configuration.api_address;
      $rootScope.api_version      = configuration.api_version;
      $rootScope.configuration    = configuration;

      // configuration constant service
      configuration.server_address  = configuration.api_address + "inner-api/";
      configuration.server_uploaded = configuration.api_address;
      configuration.api_version     = configuration.api_version;

      // config service
      self.socket_server  = configuration.socket_address;
      self.server_address  = configuration.api_address + "inner-api/";
      self.server_uploaded = configuration.api_address;
      self.api_version     = configuration.api_version;
      self.name = configuration.name;

      _setSocketMessageEventNames();

      // cut off sub-domain
      window.document.domain = 'jandi.' + /.([a-zA-Z]+)$/.exec(window.document.domain)[1];
    }

    /**
     * Setting message events name of socket event.
     * Since message event names are required in two different services(socket.service and socket.service.handler)
     * It is better to have names in common place.
     * @private
     */
    function _setSocketMessageEventNames() {
      // message types
      self.socketEvent = {
        MESSAGE: 'message',

        MESSAGE_TOPIC_JOIN: 'topic_join',
        MESSAGE_TOPIC_LEAVE: 'topic_leave',
        MESSAGE_TOPIC_INVITE: 'topic_invite',

        MESSAGE_DELETE: 'message_delete',

        MESSAGE_PREVIEW: 'link_preview_create',

        MESSAGE_FILE_SHARE: 'file_share',
        MESSAGE_FILE_UNSHARE: 'file_unshare',

        MESSAGE_FILE_COMMENT: 'file_comment',

        MESSAGE_STICKER_SHARE: 'STICKER_SHARE'
      };
    }
  }
})();
