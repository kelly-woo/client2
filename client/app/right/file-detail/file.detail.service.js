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
     * file detail 임시 저장용 property
     * file detail 접근 확인하기 위해 files에서 조회한 file object를 file.detail로 전달
     */
    Object.defineProperty(this, 'dualFileDetail', {
      get: function() {
        var temp = _fileDetail;
        _fileDetail = null;
        return temp;
      },
      set: function(value) {
        _fileDetail = value;
      }
    });
  }
})();
