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
      scope.ImageUrl ? element.show().children('img').attr('src', scope.ImageUrl) : element.hide();
    }
  }
})();