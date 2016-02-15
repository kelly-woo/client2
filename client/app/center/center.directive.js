(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('dragdownArea', dragdown)
    .directive('lastDetector', lastDetector)
    .directive('whenScrolled', whenScrolled)
    .directive('unreadCounter', unreadCounter)
    .directive('disabledMemberDetector', disabledMemberDetector);

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
        .on('dragleave', function() {
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

  function whenScrolled(jndPubSub) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, elm, attr) {
      var threshold = 700;
      var raw = elm[0];
      var _lastScrollTop = null;
      var position = 0;
      var messageContainer = angular.element(document.getElementById('msgs-container'));

      elm.on('scroll', function(event) {
        var scrollTop;
        var scrollDiff;
        var direction = 'old';
        scrollTop = raw.scrollTop;
        scrollDiff =  raw.scrollHeight - (scrollTop + messageContainer.outerHeight());

        if (_lastScrollTop === null) {
          _lastScrollTop = scrollTop;
        } else if (scrollTop > _lastScrollTop) {
          direction = 'new';
        } else {
          direction = 'old';
        }
        //zoom 추가로 인해 scrollDiff === 0 인 조건을 5 이하로 수정
        if (scrollDiff < 5) {
          scope.clearNewMessageAlerts();
        } else if (scope.hasMoreNewMessageToLoad()) {
          scope.hasScrollToBottom = true;
        } else {
          if (scrollDiff < threshold) {
            scope.hasScrollToBottom = false;
          } else {
            scope.hasScrollToBottom = true;
          }
        }

        if (scope.isInitialLoadingCompleted) {
          if (direction === 'new') {
            if (scrollDiff < 2000) {
              if (scope.loadNewMessages()) {
                jndPubSub.pub('hide:center-file-dropdown');
                jndPubSub.pub('hide:center-item-dropdown');
              }
            } else if (scrollDiff < 5) {
              // browser zoom 이 설정되어 있을 경우 scrollDiff 값 0 이상으로 오차가 발생하기 때문에
              // 5 이하 이면 최 하단으로 scroll 된 것으로 간주한다.
              scope.updateMessageMarker();
            }
          } else if (direction === 'old' && scrollTop < 2000) {
            if (scope.loadOldMessages()) {
              jndPubSub.pub('hide:center-file-dropdown');
              jndPubSub.pub('hide:center-item-dropdown');
            }
          }
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

  /* @ngInject */
  function disabledMemberDetector(publicService) {
    return {
      restrict: 'A',
      link: link,
      scope: false
    };

    function link(scope, el, attrs) {
      var _currentEntity = (scope.msg && scope.msg.fromEntity) || scope.currentEntity;
      if (publicService.isDisabledMember(_currentEntity)) {
        el.addClass(attrs.disabledMemberDetector);
      } else {
        el.removeClass(attrs.disabledMemberDetector);
      }

    }
  }

})();
