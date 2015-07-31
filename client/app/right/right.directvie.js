(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('onSearchInputChange', onSearchInputChange)
    .directive('infiniteScrollBottom', infiniteScrollBottom);

  /* ngInject */
  function onSearchInputChange($timeout) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: link
    };

    function link(scope, element, attrs, ctrl) {
      var timer;
      ctrl.$parsers.unshift(function(viewValue) {
        scope.showLoading();

        if (!!timer) $timeout.cancel(timer);

        timer = $timeout(function() {
          scope.$apply(attrs.onSearchInputChange);
        }, 500);

        return viewValue;
      });

      element.on('$destroy', function() {
        $timeout.cancel(timer);
      });

    }
  }

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
