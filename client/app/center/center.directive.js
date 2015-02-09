(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('lastDetector', lastDetector)
    .directive('whenScrolled', whenScrolled);

  function lastDetector() {
    var counter = 0;
    var messageScrollTo;

    return {
      restrict: 'A',
      link: link
    };

    function link (scope, element, attrs) {
      counter++;

      if (attrs.linkId == scope.lastLocalMsgId) {
        messageScrollTo = angular.element(element[0]);
      }

      if (counter == scope.messages.length) {
        //  If it's initial loading, don't update scroll.
        if (scope.loadMoreCounter == 1) { return; }
        scope.updateScroll(messageScrollTo);
      }
    }
  }

  function whenScrolled() {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, elm, attr) {
      var raw = elm[0];

      elm.bind('scroll', function(event) {
        if (raw.scrollTop <= 10 && !scope.msgLoadStatus.isFirst) {
          scope.disableScroll();

          scope.loadMore();
        }
      });

    }
  }

})();