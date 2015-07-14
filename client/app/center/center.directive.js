(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('dragdownArea', dragdown)
    .directive('lastDetector', lastDetector)
    .directive('whenScrolled', whenScrolled)
    .directive('unreadCounter', unreadCounter);

  // element에 drag-over-class 속성으로 drag over상태 알려주는 event handler 처리시
  // IE9<에서 blink 현상이 있으므로 code로 직접 handling.
  function dragdown($rootScope, $compile) {
    var dndTemplate = '<div class="dnd-over-content">' +
      '<span class="dnd-over-msg">' +
        '<span translate>@dnd-file-upload-msg</span>' +
      '</span>' +
      '<div class="dnd-over-border"></div>' +
      '<div class="dnd-over-area"></div>' +
      '</div>';

    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      var dndContent = $compile(dndTemplate)($rootScope.$new(true));

      element.on('dragover', function() {
        element.addClass('dnd-over');
      });

      dndContent
        .appendTo(element[0])
        .on('dragleave', function(event) {
          element.removeClass('dnd-over');
        })
        .on('drop', function() {
          element.removeClass('dnd-over');
        });
    }
  }

  function lastDetector() {
    //var counter = 0;
    //var counterFlag = false;
    //return {
    //  restrict: 'A',
    //  link: link
    //};
    //
    //function link (scope, element, attrs, ctrl) {
    //  if (scope.isPolling) {
    //    //console.log('polling');
    //    counter++;
    //    return;
    //  }
    //  // Switched to new topic.  Reset flag and counter.
    //  if (scope.loadMoreCounter == 1) {
    //    if (counterFlag) {
    //      counter = 0;
    //      counterFlag = false;
    //    }
    //  }
    //  counter++;
    //  if (counter == scope.messages.length) {
    //    //console.log(counter == scope.messages.length)
    //    //If it's initial loading, set 'counterFlag' to true.
    //    if (scope.loadMoreCounter == 1) {
    //      counterFlag = true;
    //    }
    //
    //    scope.onLastMessageRendered();
    //  }
    //}
  }

  function whenScrolled() {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, elm, attr) {
      var threshold = 700;
      var raw = elm[0];

      var position = 0;

      var messageContainer = angular.element(document.getElementById('msgs-container'));

      elm.on('scroll', function(event) {
        var scrollTop;
        var scrollDiff;

        scrollTop = raw.scrollTop;
        scrollDiff =  raw.scrollHeight - (raw.scrollTop + messageContainer.outerHeight());

        if (scrollDiff == 0) {
          // Bottom reached!
          scope.loadNewMessages();
          scope.clearNewMessageAlerts();
          return;
        } else if (scrollDiff < threshold) {
          scope.hasScrollToBottom = false;
        } else if (scrollDiff > threshold) {
          // Scrolled upward over 200.
          scope.hasScrollToBottom = true;
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

  function unreadCounter() {

    var unreadCounter = -1;

    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element, attrs, ctrl) {

      if (unreadCounter > 0) {
        unreadCounter = scope.roomMemberLength;
      }

      console.log(unreadCounter);
      console.log(attrs.unreadCounter);
      console.log(scope.roomMemberLength)
    }
  }
})();
