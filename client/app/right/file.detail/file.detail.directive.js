/**
 * @fileoverview file detail page 에서 현재 파일이 이미지일 경우에만 preview 를 보여준다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailPreview', fileDetailPreview);

  /* @ngInject */
  function fileDetailPreview($rootScope, $timeout) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, jqEle) {
      if ($rootScope.setFileDetailCommentFocus) {
        $rootScope.setFileDetailCommentFocus = false;
        $timeout(function() {
          scope.onCommentFocusClick();
        });
      }

      if (scope.ImageUrl) {
        jqEle = jqEle.show().children('img').attr({ src: scope.ImageUrl });
        scope.cursor && jqEle.css({ cursor: scope.cursor });
      } else {
        jqEle.hide();
      }
    }
  }
})();
