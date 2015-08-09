/**
 * @fileoverview 파일 관련 소켓 이벤트를 처리한다.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('jndWebSocketFile', jndWebSocketFile);

  /* @ngInject */
  function jndWebSocketFile(jndPubSub, logger) {
    var FILE_CREATED = 'file_created';
    var FILE_SHARED = 'file_shared';
    var FILE_DELETED = 'file_deleted';
    var FILE_COMMENT_CREATED = 'file_comment_created';
    var FILE_COMMENT_DELETED = 'file_comment_deleted';

    this.attachSocketEvent = attachSocketEvent;

    function attachSocketEvent(socket) {
      socket.on(FILE_CREATED, _onFileCreated);
      socket.on(FILE_SHARED, _onFileShared);
      socket.on(FILE_DELETED, _onFileDeleted);
      socket.on(FILE_COMMENT_CREATED, _onFileCommentCreated);
      socket.on(FILE_COMMENT_DELETED, _onFileCommentDeleted);
    }

    function _onFileCreated(data) {
      logger.socketEventLogger(data.event, data);
    }


    function _onFileShared(data) {
      logger.socketEventLogger(data.event, data);
    }
    /**
     * 파일이 지워졌을 때
     * @param data
     * @private
     */
    function _onFileDeleted(data) {
      logger.socketEventLogger(data.event, data);

      jndPubSub.pub('rightFileOnFileDeleted', data);
      jndPubSub.pub('rightFileDetailOnFileDeleted', data);
      jndPubSub.pub('centerOnFileDeleted', data);
    }

    /**
     * 파일에 코멘트가 달렸을 때
     * @param data
     * @private
     */
    function _onFileCommentCreated(data) {
      logger.socketEventLogger(data.event, data);

      jndPubSub.pub('rightFileDetailOnFileCommentCreated', data);
    }

    /**
     * 파일에 달린 코멘트가 지워졌을 때
     * @param data
     * @private
     */
    function _onFileCommentDeleted(data) {
      logger.socketEventLogger(data.event, data);

      jndPubSub.pub('rightFileDetailOnFileCommentDeleted', data);
      jndPubSub.pub('centerOnFileCommentDeleted', data);
    }
  }
})();
