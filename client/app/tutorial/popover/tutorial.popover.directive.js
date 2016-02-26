/**
 * @fileoverview 커넥트 튜토리얼 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialPopover', tutorialPopover);

  function tutorialPopover($filter, $timeout, JndUtil, Tutorial, AccountHasSeen) {
    return {
      link: link,
      scope: {},
      replace: true,
      restrict: 'E',
      templateUrl: 'app/tutorial/popover/tutorial.popover.html'
    };

    function link(scope, el, attrs) {
      var DELAY = 300;
      var _timer;
      var _translate = $filter('translate');
      var _stepList = [
        {
          className: {
            wrap: 'tutorial-folder',
            arrow: 'left'
          },
          src: 'assets/images/new-feature/topic_foldering.gif',
          title: _translate('@tutorial-modal1-title'),
          content: _translate('@tutorial-modal1-content')
        },
        {
          className: {
            wrap: 'tutorial-star',
            arrow: 'top'
          },
          src: 'assets/videos/new-feature/jnd-connect.mp4',
          title: _translate('@tutorial-modal2-title'),
          content: _translate('@tutorial-modal2-content')
        },
        {
          className: {
            wrap: 'tutorial-mention',
            arrow: 'bottom'
          },
          src: 'assets/images/new-feature/topic_foldering.gif',
          title: _translate('@tutorial-modal3-title'),
          content: _translate('@tutorial-modal3-content')
        },
        {
          className: {
            wrap: 'tutorial-msg-search',
            arrow: 'top'
          },
          src: 'assets/videos/new-feature/jnd-connect.mp4',
          title: _translate('@tutorial-modal4-title'),
          content: _translate('@tutorial-modal4-content')
        },
        {
          className: {
            wrap: 'tutorial-jump',
            arrow: 'top'
          },
          src: 'assets/images/new-feature/topic_foldering.gif',
          title: _translate('@tutorial-modal5-title'),
          content: _translate('@tutorial-modal5-content')
        },
        {
          className: {
            wrap: 'tutorial-hotkey',
            arrow: 'top'
          },
          src: 'assets/videos/new-feature/jnd-connect.mp4',
          title: _translate('@tutorial-modal6-title'),
          content: _translate('@tutorial-modal6-content')
        },
        {
          className: {
            wrap: 'tutorial-connect',
            arrow: 'top'
          },
          src: 'assets/images/new-feature/topic_foldering.gif',
          title: _translate('@tutorial-modal7-title'),
          content: _translate('@tutorial-modal7-content')
        },
        {
          className: {
            wrap: 'tutorial-connect tutorial-complete',
            arrow: 'top'
          },
          src: 'assets/images/new-feature/topic_foldering.gif',
          title: _translate('@tutorial-modal8-title'),
          content: _translate('@tutorial-modal8-content')
        }
      ];

      scope.next = next;
      scope.close = close;

      scope.isLoaded = false;
      scope.isVideo = false;
      scope.curStepIdx = 0;
      scope.curStep = null;
      scope.progress = 0;


      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _resetProperties();
        _attachVideoLoad();
        _start();
      }

      /**
       * video load 핸들러
       * @private
       */
      function _onVideoLoad() {
        JndUtil.safeApply(scope, function() {
          scope.isLoaded = true;
        });
      }

      function _start() {
        _resetProperties();
        scope.curStepIdx = 0;
        //처음 시작 시 fade 효과를 위해 timeout 을 세팅한다
        $timeout(_setCurStep, 100);
      }

      function _resetProperties() {
        scope.isLoaded = false;
        scope.curStepIdx = 0;
        scope.curStep = null;
        scope.isVideo = false;
      }

      function _setCurStep() {
        JndUtil.safeApply(scope, function() {
          var curStep = scope.curStep = _stepList[scope.curStepIdx];
          _setProgress();
          if (!_isImage(curStep.src)) {
            scope.isVideo = true;
            scope.isLoaded = false;
          } else {
            scope.isVideo = false;
            scope.isLoaded = true;
          }
        });
      }

      function _setProgress() {
        scope.progress = Math.round((scope.curStepIdx / (_stepList.length - 1)) * 100);
      }

      function _attachVideoLoad() {
        el.find('video').on('loadeddata', _onVideoLoad);
      }

      function _isImage(src) {
        return /.+\.gif$/.test(src)
      }

      function next() {
        _animateHide();
        $timeout.cancel(_timer);
        _timer = $timeout(_next, DELAY);
      }

      function close() {
        _animateHide();
        _timer = $timeout(Tutorial.hidePopover, DELAY);
      }

      function _animateHide() {
        scope.isLoaded = false;
      }

      function _next() {
        if (_isCompleted()) {
          Tutorial.hidePopover();
        } else {
          if (_isLastStep()) {
            AccountHasSeen.set('TUTORIAL_VER3_POPOVER', true);
            Tutorial.complete();
          }
          scope.curStepIdx++;
          _setCurStep();
        }
      }
      function _isLastStep() {
        return scope.curStepIdx === _stepList.length - 2;
      }

      function _isCompleted() {
        return scope.curStepIdx >= _stepList.length -1;
      }

      /**
       * 튜토리얼 완료
       * @private
       */
      function _complete() {
        AccountHasSeen.set('TUTORIAL_VER3_POPOVER', true);
        Tutorial.complete();

        AccountHasSeen.set('TUTORIAL_VER3_POPOVER', true);
        Tutorial.complete();
        Tutorial.hidePopover();
      }
    }
  }
})();
