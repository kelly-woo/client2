/**
 * @fileoverview 파일 관련 소켓 이벤트를 처리한다.
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketFile', jndWebSocketFile);

  /* @ngInject */
  function jndWebSocketFile(jndPubSub) {
    var FILE_CREATED = 'file_created';
    var FILE_SHARED = 'file_shared';
    var FILE_DELETED = 'file_deleted';
    var FILE_COMMENT_CREATED = 'file_comment_created';
    var FILE_COMMENT_DELETED = 'file_comment_deleted';

    var events = [
      {
        name: FILE_CREATED,
        handler: _onFileCreated
      },
      {
        name: FILE_SHARED,
        handler: _onFileShared
      },
      {
        name: FILE_DELETED,
        handler: _onFileDeleted
      },
      {
        name: FILE_COMMENT_CREATED,
        handler: _onFileCommentCreated
      },
      {
        name: FILE_COMMENT_DELETED,
        handler: _onFileCommentDeleted
      }
    ];

    this.getEvents = getEvents;

    function getEvents() {
      return events;
    }

    function _onFileCreated(data) {
    }


    function _onFileShared(data) {
    }
    /**
     * 파일이 지워졌을 때
     * @param data
     * @private
     */
    function _onFileDeleted(data) {

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
      jndPubSub.pub('rightFileDetailOnFileCommentCreated', data);
    }

    /**
     * 파일에 달린 코멘트가 지워졌을 때
     * @param data
     * @private
     */
    function _onFileCommentDeleted(data) {
      jndPubSub.pub('rightFileDetailOnFileCommentDeleted', data);
      jndPubSub.pub('centerOnFileCommentDeleted', data);
    }
  }
})();
