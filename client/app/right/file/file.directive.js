/**
 * @fileoverview file directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rightFile', file);

  function file() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        fileType: '=',
        fileData: '=',
        fileQuery: '='
      },
      link: link,
      templateUrl : 'app/right/file/file.html',
      controller: 'RightFileCtrl'
    };

    function link(scope, el) {
      el.on('click', function () {
        scope.onFileCardClick();
      });

      if (scope.file.type === 'file') {
        // 파일 공유, 댓글, 다운로드, 삭제 메뉴버튼의 click event handling
        el.find('.file-menu')
          .on('click', function(event) {
            event.stopPropagation();
          })
          .on('click', 'a.external-share-file', function() {
            // file external share

            scope.status.isopen = false;
          })
          .on('click', 'a.star-file', function() {
            // file star

            scope.status.isopen = false;
            el.find('.file-star i').trigger('click');
          })
          .on('click', 'a.download-file,a.original-file', function() {
            // file download

            scope.$apply(function() {
              scope.status.isopen = false;
            });
          })
          .on('click', 'a.share-file', function() {
            // file share

            scope.status.isopen = false;
            scope.onOpenShareModal();
          })
          .on('click', 'a.focus-comment-file', function() {
            // file comment

            scope.status.isopen = false;
            scope.setCommentFocus();
          })
          .on('click', 'a.delete-file', function() {
            // file delete

            scope.status.isopen = false;
            scope.onFileDeleteClick();
          });
      }
    }
  }
})();
