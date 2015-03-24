(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('onSearchInputChange', ['$timeout', onSearchInputChange]);

  onSearchInputChange.$inject = ['$timeout'];

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
})();
