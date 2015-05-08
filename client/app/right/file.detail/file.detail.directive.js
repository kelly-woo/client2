(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailPreview', fileDetailPreview);

  function fileDetailPreview() {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      var ele;

      if (scope.ImageUrl) {
        ele = element.show().children('img');
        ele.attr({ src: scope.ImageUrl });

        scope.cursor && ele.css({ cursor: scope.cursor });
      } else {
        element.hide();
      }
    }
  }
})();