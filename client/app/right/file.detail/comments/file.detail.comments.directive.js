/**
 * @fileoverview file detail의 comments directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailComments', fileDetailComments);

  /* @ngInject */
  function fileDetailComments($filter, fileAPIservice, Dialog, jndPubSub, memberService) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        comments: '=',
        errorComments: '=',
        isAdmin: '=',
        postComment: '&',
        onMemberClick: '='
      },
      templateUrl : 'app/right/file.detail/comments/file.detail.comments.html',
      link: link
    };

    function link(scope, el) {
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

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$on('rightFileDetailOnFileCommentCreated', _onCreateComment);
        scope.$on('rightFileDetailOnFileCommentDeleted', _onDeleteComment);
      }

      /**
       * comment 소유했는지 여부를 전달한다.
       * @param {object} comment
       * @returns {boolean|string}
       */
      function hasOwnComment(comment) {
        var currentMemberId = memberService.getMemberId();
        return currentMemberId === comment.writerId || scope.isAdmin;
      }

      /**
       * comment 를 즐겨찾기한다.
       * @param {object} $event
       */
      function starComment($event) {
        setTimeout(function() {
          $($event.target).parents('.comment-item-header__action').find('.comment-star i').trigger('click');
        });
      }

      /**
       * postComment 실패한 comment를 재전송한다.
       * @param {number} index
       * @param {object} comment
       */
      function retry(index, comment) {
        deleteSendingComment(index);

        scope.postComment({
          $comment: comment.content.body,
          $sticker: comment.originSticker
        });
      }

      /**
       * postComment 실패한 comment를 삭제한다.
       * @param index
       */
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
            .success(_onSuccessDelete);
        } else {
          fileAPIservice.deleteComment(scope.file.id, commentId)
            .success(_onSuccessDelete);
        }
      }

      /**
       * 삭제 성공 event handler
       * @private
       */
      function _onSuccessDelete() {
        Dialog.success({
          title: $filter('translate')('@message-deleted')
        });
      }

      /**
       * comment 작성 event handler
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onCreateComment(angularEvent, data) {
        if (_isCurrentFileEvent(data)) {
          jndPubSub.pub('fileDetail:updateComments');
        }
      }

      /**
       * comment 삭제 event handler
       * @param {object} angularEvent
       * @param {object} data
       * @private
       */
      function _onDeleteComment(angularEvent, data) {
        if (_isCurrentFileEvent(data)) {
          jndPubSub.pub('fileDetail:updateComments');
        }
      }

      /**
       * 현재 file에 대한 event 인지 여부를 전달한다.
       * @param {object} data
       * @returns {boolean}
       * @private
       */
      function _isCurrentFileEvent(data) {
        return data.file.id == scope.file.id;
      }
    }
  }
})();
