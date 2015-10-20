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
  function fileDetailPreview($rootScope, $interval) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, jqEle) {
      var focusTimer;
      var imageWrapper;

      if ($rootScope.setFileDetailCommentFocus) {
        $rootScope.setFileDetailCommentFocus = false;

        // #file-detail-comment-input 이 보여진 다음 focus 이동 됨
        focusTimer = $interval(function() {
          var jqEle = $('#file-detail-comment-input');
          var displays = [];

          scope.onCommentFocusClick();

          jqEle.parents().each(function(index, ele) {
            displays.push($(ele).css('display'));
          });

          if (document.activeElement === jqEle[0] && displays.indexOf('none') < 0) {
            $interval.cancel(focusTimer);
          }
        }, 100);
      }

      imageWrapper = jqEle.closest('.image_wrapper');

      if (scope.ImageUrl) {
        imageWrapper.show();
      } else {
        imageWrapper.hide();
      }
    }
  }
})();
