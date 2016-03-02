/**
 * @fileoverview 팝 오버 형태의 tutorial 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialPopover', tutorialPopover);

  function tutorialPopover($filter, $timeout, JndUtil, Tutorial, AccountHasSeen, currentSessionHelper) {
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

      scope.stepList = [
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
          src: 'assets/videos/popover-star.mp4',
          title: _translate('@tutorial-modal2-title'),
          content: _translate('@tutorial-modal2-content')
        },
        {
          className: {
            wrap: 'tutorial-mention',
            arrow: 'bottom'
          },
          src: 'assets/videos/popover-mention.mp4',
          title: _translate('@tutorial-modal3-title'),
          content: _translate('@tutorial-modal3-content')
        },
        {
          className: {
            wrap: 'tutorial-msg-search',
            arrow: 'top'
          },
          src: 'assets/videos/popover-msg-search.mp4',
          title: _translate('@tutorial-modal4-title'),
          content: _translate('@tutorial-modal4-content')
        },
        {
          className: {
            wrap: 'tutorial-jump',
            arrow: 'top'
          },
          src: 'assets/images/new-feature/popover_jump.gif',
          title: _translate('@tutorial-modal5-title'),
          content: _translate('@tutorial-modal5-content')
        },
        {
          className: {
            wrap: 'tutorial-hotkey',
            arrow: 'top'
          },
          src: 'assets/images/new-feature/popover_shortcut.gif',
          title: _translate('@tutorial-modal6-title'),
          content: _translate('@tutorial-modal6-content')
        },
        {
          className: {
            wrap: 'tutorial-connect',
            arrow: 'top'
          },
          src: 'assets/videos/new-feature/jnd-connect.mp4',
          title: _translate('@tutorial-modal7-title'),
          content: _translate('@tutorial-modal7-content')
        },
        {
          className: {
            wrap: 'tutorial-connect tutorial-complete',
            arrow: 'top'
          },
          src: 'assets/images/center/help-create-a-new-team.gif',
          title: _translate('@tutorial_congratulations'),
          content: _translate('@tutorial_congratulations_content').replace('{{teamName}}',
            currentSessionHelper.getCurrentTeam().name)
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
        _attachDomEvents();
        _start();
      }

      /**
       * scope 의 값을 초기화 한다.
       * @private
       */
      function _resetProperties() {
        scope.isLoaded = false;
        scope.curStepIdx = 0;
        scope.curStep = null;
        scope.isVideo = false;
      }

      /**
       * dom 이벤트를 바인딩 한다.
       * @private
       */
      function _attachDomEvents() {
        el.find('video').on('loadeddata', _onVideoLoad);
      }

      /**
       * video load 이벤트 핸들러
       * @private
       */
      function _onVideoLoad() {
        JndUtil.safeApply(scope, function() {
          scope.isLoaded = true;
        });
      }

      /**
       * popover tutorial 을 시작한다.
       * @private
       */
      function _start() {
        _resetProperties();
        scope.curStepIdx = 0;
        //처음 시작 시 fade 효과를 위해 timeout 을 세팅한다
        $timeout(_setCurStep, 100);
      }

      /**
       * 현재 step 을 설정한다.
       * @private
       */
      function _setCurStep() {
        JndUtil.safeApply(scope, function() {
          var curStep = scope.curStep = scope.stepList[scope.curStepIdx];
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

      /**
       * popover 를 닫는다.
       */
      function close() {
        _animateHide();
        //fade out 효과 이후에 popover 를 감추기 위해 timeout 을 이용한다.
        _timer = $timeout(Tutorial.hidePopover, DELAY);
      }

      /**
       * 다음 단계로 넘어간다.
       */
      function next() {
        _animateHide();
        //fade out 효과 이후에 popover 를 감추기 위해 timeout 을 이용한다.
        $timeout.cancel(_timer);
        _timer = $timeout(_next, DELAY);
      }

      /**
       * 실제 다음 단계로 넘어간다.
       * @private
       */
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

      /**
       * progress bar 의 진행률을 설정한다.
       * @private
       */
      function _setProgress() {
        scope.progress = Math.round((scope.curStepIdx / (scope.stepList.length - 1)) * 100);
      }

      /**
       * file 확장자가 이미지인지 여부를 반환한다.
       * @param {string} src
       * @returns {boolean}
       * @private
       */
      function _isImage(src) {
        return /.+\.gif$/.test(src)
      }

      /**
       * fade out 애니메이션을 적용하여 popover 를 감춘다.
       * @private
       */
      function _animateHide() {
        scope.isLoaded = false;
      }

      /**
       * 마지막 단계인지 여부를 반환한다.
       * @returns {boolean}
       * @private
       */
      function _isLastStep() {
        return scope.curStepIdx === scope.stepList.length - 2;
      }

      /**
       * tutorial 을 완료 하였는지 여부를 반환한다.
       * @returns {boolean}
       * @private
       */
      function _isCompleted() {
        return scope.curStepIdx >= scope.stepList.length -1;
      }
    }
  }
})();
