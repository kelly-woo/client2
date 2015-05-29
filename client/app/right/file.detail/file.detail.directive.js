(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailPreview', fileDetailPreview);

  function fileDetailPreview($rootScope, $timeout) {
    return {
      restrict: 'A',
      link: link
    };

    function link($scope, jqEle) {
      if ($rootScope.setFileDetailCommentFocus) {
        $rootScope.setFileDetailCommentFocus = false;

        $timeout(function() {
          $scope.onCommentFocusClick();
        });
      }

      if ($scope.ImageUrl) {
        jqEle = jqEle.show().children('img').attr({ src: $scope.ImageUrl });

        $scope.cursor && jqEle.css({ cursor: $scope.cursor });
      } else {
        jqEle.hide();
      }
    }
  }
})();
