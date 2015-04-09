(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('lastDetector', lastDetector)
    .directive('whenScrolled', whenScrolled);

  function lastDetector() {
    var counter = 0;
    var counterFlag = false;
    return {
      restrict: 'A',
      link: link
    };

    function link (scope, element, attrs, ctrl) {

      if (scope.isPolling) {
        //console.log('polling');
        counter++;
        return;
      }

      // Switched to new topic.  Reset flag and counter.
      if (scope.loadMoreCounter == 1) {
        if (counterFlag) {
          counter = 0;
          counterFlag = false;
        }
      }

      counter++;

      //console.log(counter, scope.messages.length)

      if (counter == scope.messages.length) {
        //console.log(counter == scope.messages.length)
        //If it's initial loading, set 'counterFlag' to true.
        if (scope.loadMoreCounter == 1) {
          counterFlag = true;
        }

        scope.onLastMessageRendered();
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

      var position = 0;

      var messageContainer = angular.element(document.getElementById('msgs-container'));

      elm.bind('scroll', function(event) {
        var scrollTop = raw.scrollTop;
        if (raw.scrollTop + messageContainer.outerHeight() == raw.scrollHeight) {
          // Bottom reached!
          scope.loadNewMessages();
          scope.isAtBottom();
          return;
        }

        // If scrolling down, Don't worry about loading more of content.
        if (scrollTop > position) return;

        position = scrollTop;

        if (raw.scrollTop <= 20 && scope.isInitialLoadingCompleted) {
          scope.loadOldMessages();
        }

      });
    }


  }

})();