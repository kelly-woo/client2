/**
 * @fileoverview file detail의 comments directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailComments', fileDetailComments);

  /* @ngInject */
  function fileDetailComments($state, $filter, fileAPIservice, Dialog, jndPubSub) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        comments: '=',
        isAdmin: '=',
        onUserClick: '='
      },
      templateUrl : 'app/right/file.detail/comments/file.detail.comments.html',
      link: link
    };

    function link(scope) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.hasOwnComment = hasOwnComment;
        scope.starComment = starComment;
        scope.deleteComment = deleteComment;

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
            .error(function(err) {
              _onErrorDelete(err, 'fileAPIservice.deleteSticker');
            });
        } else {
          fileAPIservice.deleteComment(scope.file.id, commentId)
            .success(_onSuccessDelete)
            .error(function(err) {
              _onErrorDelete(err, 'fileAPIservice.deleteComment');
            });
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

      /**
       * 삭제 실패시 이벤트 핸들러
       * @param {object} err
       * @param {string} referrer
       * @private
       */
      function _onErrorDelete(err, referrer) {
        $state.go('error', {code: err.code, msg: err.msg, referrer: referrer});
      }

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
