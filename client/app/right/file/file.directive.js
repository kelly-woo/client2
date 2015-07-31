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
      var extendMenu = el.find('.file-menu');
      var toggleMenu;

      el.on('click', function(event) {
        if (event.target.className.indexOf('star') < 0) {
          scope.onFileCardClick();
        }
      });

      // 파일 공유, 댓글, 다운로드, 삭제 메뉴버튼의 click event handling
      extendMenu
        .on('click', function(event) {
          event.stopPropagation();
        })
        .on('click', 'a.share-file,a.focus-comment-file,a.download-file,a.delete-file', function(event) {
          var selector;

          selector = event.currentTarget.className;
          if (selector ==='share-file') {
            scope.onClickShare();
          } else if (selector === 'focus-comment-file') {
            scope.setCommentFocus();
          } else if (selector === 'delete-file') {
            scope.onFileDeleteClick();
          }

          toggleMenu = true;
        });
    }
  }
})();
