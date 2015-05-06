(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('file', file);

  function file() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      templateUrl: 'app/right/files/file/file.html',
      controller: 'fileCtrl'
    };

    function link(scope, element, attrs) {
      var extendMenu = element.find('.file-item-body-title__more');
      var toggleMenu;

      // 파일 공유, 댓글, 다운로드, 삭제 메뉴버튼의 click event handling
      extendMenu
        .on('click', function(event) {
          event.stopPropagation();

          toggleMenu = !toggleMenu;
          toggleMenu ? extendMenu.addClass('open') : extendMenu.removeClass('open');
        })
        .on('click', 'a.share-file,a.focus-comment-file,a.download-file,a.delete-file', function(event) {
          var selector;

          selector = event.currentTarget.className;
          if (selector ==='share-file') {
            scope.onClickShare(scope.file);
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