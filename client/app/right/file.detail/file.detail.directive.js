(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailPreview', fileDetailPreview);

  function fileDetailPreview($timeout) {
    return {
      restrict: 'A',
      link: link
    };

    function link($scope, jqEle) {
      if ($scope.ImageUrl) {
        jqEle = jqEle.show().children('img').attr({ src: $scope.ImageUrl });

        $scope.cursor && jqEle.css({ cursor: $scope.cursor });
      } else {
        jqEle.hide();
      }

      $timeout(function() {
        $scope.onCommentFocusClick();
      });
    }
  }
})();
