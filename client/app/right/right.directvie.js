(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('infiniteScrollBottom', infiniteScrollBottom);

  function infiniteScrollBottom() {
    return function(scope, element, attrs) {
      var list = element.children('.infinite-scroll-bottom-list');

      element.bind('mousewheel', function() {
        if (!scope.isScrollLoading) {
          if (list.height() <= element.height()) {
            scope.$apply(attrs.infiniteScrollBottom);
          }
        }
      });

      element.bind('scroll', function() {
        var currentScrollPosition;
        var elementHeight;

        if (!scope.isScrollLoading) {
          elementHeight = list.height();
          currentScrollPosition = element.scrollTop() + element.height();

          if (elementHeight - currentScrollPosition < 20) {
            scope.$apply(attrs.infiniteScrollBottom);
          }
        }
      });
    };
  }
})();
