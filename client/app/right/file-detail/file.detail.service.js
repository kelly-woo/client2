/**
 * @fileoverview file detail service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileDetail', FileDetail);

  /* @ngInject */
  function FileDetail($rootScope, $http, $q, memberService) {
    var _that = this;
    var _integrateMap = {
      'google': true,
      'dropbox': true
    };

    var _fileDetail;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _that.get = get;
      _that.postComment = postComment;
      _that.deleteComment = deleteComment;
      _that.deleteSticker = deleteSticker;
      _that.isIntegrateFile = isIntegrateFile;

      _that.getFileDetail = getFileDetail;
      _that.setFileDetail = setFileDetail;
      _that.hasPdfPreview = hasPdfPreview;
    }

    /**
     * requset file detail
     * @param {number|string} fileId
     * @returns {*}
     */
    function get(fileId) {
      var abortDeferred = $q.defer();
      var request = $http({
        method  : 'GET',
        url     : $rootScope.server_address + 'messages/' + fileId,
        params  : {
          teamId: memberService.getTeamId()
        },
        timeout: abortDeferred.promise
      });

      request.abort = function() {
        abortDeferred.resolve();
      };
      request.finally(function() {
        request.abort = angular.noop;
      });

      return request;
    }

    /**
     * comment 를 post 한다.
     * @param {string} fileId 파일 id
     * @param {string} content post 할 문자열
     * @param {object} sticker 스티커 객체
     * @param {array} mentions
     * @returns {*}
     */
    function postComment(fileId, content, sticker, mentions) {
      if (sticker) {
        return _postSticker(fileId, content, sticker, mentions);
      } else {
        return _postComment(fileId, content, mentions);
      }
    }

    /**
     * comment 를 post 한다.
     * @param {string} fileId 파일 id
     * @param {string} content post 할 문자열
     * @param {array} mentions
     * @returns {*}
     * @private
     */
    function _postComment(fileId, content, mentions) {
      return $http({
        method  : 'POST',
        url     : $rootScope.server_address + 'messages/' + fileId + '/comment',
        data    : {
          comment : content,
          teamId  : memberService.getTeamId(),
          mentions: mentions
        },
        version: 3
      });
    }

    /**
     * sticker 를 post 한다.
     * @param {string} fileId 파일 id
     * @param {string} content post 할 문자열
     * @param {object} sticker 스티커 객체
     * @param {array} mentions
     * @returns {*}
     * @private
     */
    function _postSticker(fileId, content, sticker, mentions) {
      var data = {
        stickerId: sticker.id,
        groupId: sticker.groupId,
        teamId: memberService.getTeamId(),
        share: fileId,
        content: content,
        mentions: mentions
      };

      return $http({
        method  : 'POST',
        url     : $rootScope.server_address + 'stickers/comment',
        data    : data
      });
    }

    /**
     * 스티커를 제거한다.
     * @param {string} commentId
     * @returns {*}
     */
    function deleteSticker(commentId) {
      return $http({
        method  : 'DELETE',
        url     : $rootScope.server_address + 'stickers/comments/' + commentId,
        params  : {
          teamId  : memberService.getTeamId()
        }
      });
    }

    /**
     * comment 를 제거한다.
     * @param {string} fileId
     * @param {string} commentId
     * @returns {*}
     */
    function deleteComment(fileId, commentId) {
      return $http({
        method  : 'DELETE',
        url     : $rootScope.server_address + 'messages/' + fileId + '/comments/' + commentId,
        params  : {
          teamId  : memberService.getTeamId()
        }
      });
    }

    /**
     * integrate file 인지 여부
     * @param {string} serverUrl
     * @returns {boolean}
     */
    function isIntegrateFile(serverUrl) {
      return !!_integrateMap[serverUrl];
    }

    /**
     * file detail 전달함
     * @returns {*}
     */
    function getFileDetail() {
      var fileDetail = _fileDetail;

      // 한번 file detail을 전달한 후에는 저장하고 있던 file detail에 null을 할당하여
      // 다음번 set이 이루어 지지 않았을때 이전 file detail 이 전달되는걸 방지한다.
      _fileDetail = null;

      return fileDetail;
    }

    /**
     * file detail 설정함
     * @param {object} fileDetail
     */
    function setFileDetail(fileDetail) {
      _fileDetail = fileDetail;
    }

    /**
     * pdf preview 가 가능한 file 인지 여부를 반환한다.
     * @param {object} file
     * @returns {boolean}
     */
    function hasPdfPreview(file) {
      var content = file.content;
      return !!(file.content.ext === 'pdf' && !isIntegrateFile(content.serverUrl));
    }
  }
})();
