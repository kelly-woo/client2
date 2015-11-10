/**
 * @fileoverview file detail의 comments directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailComments', fileDetailComments);

  /* @ngInject */
  function fileDetailComments($filter, fileAPIservice, Dialog, jndPubSub) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        comments: '=',
        errorComments: '=',
        isAdmin: '=',
        postComment: '&',
        onUserClick: '='
      },
      templateUrl : 'app/right/file.detail/comments/file.detail.comments.html',
      link: link
    };

    function link(scope, el) {
      var jqSendingComments = el.find('.sending-comment-item');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.hasOwnComment = hasOwnComment;
        scope.starComment = starComment;
        scope.deleteComment = deleteComment;

        scope.retry = retry;
        scope.deleteSendingComment = deleteSendingComment;

        _on();
      }

      /**
       * on listener
       * @private
       */
      function _on() {
        scope.$on('rightFileDetailOnFileCommentCreated', _onCreateComment);
        scope.$on('rightFileDetailOnFileCommentDeleted', _onDeleteComment);
      }

      /**
       * comment 소유했는지 여부
       * @param {object} comment
       * @returns {boolean|string}
       */
      function hasOwnComment(comment) {
        return scope.file.writerId === comment.writerId || scope.isAdmin;
      }

      /**
       * comment 를 즐겨찾기함
       * @param {object} event
       */
      function starComment(event) {
        setTimeout(function() {
          $(event.target).parents('.comment-item-header__action').find('.comment-star i').trigger('click');
        });
      }

      function retry(index, comment) {
        deleteSendingComment(index);

        scope.postComment({
          $comment: comment.content.body,
          $sticker: comment.originSticker
        })
      }

      function deleteSendingComment(index) {
        scope.errorComments.splice(index, 1);
      }

      /**
       * comment 를 삭제한다.
       * @param {number} commentId 코멘트 ID
       * @param {boolean} [isSticker=false] sticker 삭제인지 여부
       */
      function deleteComment(comment) {
        var commentId = comment.id;
        var isSticker = comment.extIsSticker;

        if (isSticker) {
          fileAPIservice.deleteSticker(commentId)
            .success(_onSuccessDelete)
        } else {
          fileAPIservice.deleteComment(scope.file.id, commentId)
            .success(_onSuccessDelete)
        }
      }

      /**
       * 삭제 성공시 이벤트 핸들러
       * @private
       */
      function _onSuccessDelete() {
        jndPubSub.pub('right:updateFile', function() {
          Dialog.success({
            title: $filter('translate')('@message-deleted')
          });
        });
      }

      // 실패시 page 전체를 refresh 하므로 주석처리
      ///**
      // * 삭제 실패시 이벤트 핸들러
      // * @param {object} err
      // * @param {string} referrer
      // * @private
      // */
      //function _onErrorDelete(err, referrer) {
      //  $state.go('error', {code: err.code, msg: err.msg, referrer: referrer});
      //}

      function _onCreateComment(event, data) {
        if (_isCurrent(data)) {
          jndPubSub.pub('right:updateComments');
        }
      }

      function _onDeleteComment(event, data) {
        if (_isCurrent(data)) {
          jndPubSub.pub('right:updateComments');
        }
      }

      function _isCurrent(data) {
        return data.file.id === parseInt(scope.file.id, 10);
      }
    }
  }
})();
