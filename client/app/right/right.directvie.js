(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('infiniteScrollBottom', infiniteScrollBottom);

  function infiniteScrollBottom() {
    return function(scope, element, attrs) {
      var list = element.children('.infinite-scroll-bottom-list');

      element.bind('mousewheel', function() {
        if (scope.isScrollLoading) return;

        if (list.height() <= element.height()) {
          scope.$apply(attrs.infiniteScrollBottom);
        }
      });

      element.bind('scroll', function() {

        if (scope.isScrollLoading) return;

        var currentScrollPosition = element.scrollTop() + element.height();
        var elementHeight = list.height();

        if (elementHeight - currentScrollPosition < 20) {
          scope.$apply(attrs.infiniteScrollBottom);
        }

      });
    };
  }
})();
