/**
 * @fileoverview file directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('file', file);

  function file() {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        fileType: '=',
        fileData: '=',
        fileQuery: '='
      },
      link: link,
      templateUrl : 'app/right/file/file.html',
      controller: 'FileCtrl'
    };

    function link(scope, el) {
      el.on('click', function () {
        scope.onFileCardClick();
      });

      if (scope.file.type === 'text') {
        // 파일 공유, 댓글, 다운로드, 삭제 메뉴버튼의 click event handling
        el.find('.file-menu')
          .on('click', 'i,a.star-file,a.share-file,a.focus-comment-file,a.download-file,a.delete-file', function (event) {
            var selector;

            event.stopPropagation();

            selector = event.currentTarget.className;
            if (selector === 'star-file') {
              scope.status.isopen = false;
              el.find('.file-star i').trigger('click');
            } else if (selector === 'share-file') {
              scope.status.isopen = false;
              scope.onClickShare();
            } else if (selector === 'focus-comment-file') {
              scope.status.isopen = false;
              scope.setCommentFocus();
            } else if (selector === 'delete-file') {
              scope.status.isopen = false;
              scope.onFileDeleteClick();
            } else if (selector === 'download-file') {
              scope.status.isopen = false;
            }
          });
      }
    }
  }
})();
