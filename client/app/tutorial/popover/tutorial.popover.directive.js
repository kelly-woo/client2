/**
 * @fileoverview 팝 오버 형태의 tutorial 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialPopover', tutorialPopover);

  function tutorialPopover($filter, $timeout, JndUtil, Tutorial, AccountHasSeen, currentSessionHelper, memberService,
                           HybridAppHelper) {
    return {
      link: link,
      scope: {},
      replace: true,
      restrict: 'E',
      templateUrl: 'app/tutorial/popover/tutorial.popover.html'
    };

    function link(scope, el, attrs) {
      var DELAY = 400;
      var _timer;
      var _translate = $filter('translate');

      scope.stepList = [
        {
          className: {
            wrap: 'tutorial-folder',
            arrow: 'left'
          },
          src: 'assets/images/tutorial/popover/topic-foldering.gif',
          title: _translate('@tutorial-modal1-title'),
          content: _translate('@tutorial-modal1-content')
        },
        {
          className: {
            wrap: 'tutorial-star',
            arrow: 'top'
          },
          src: 'assets/videos/tutorial/popover/star.mp4',
          imgSrc: 'assets/images/tutorial/popover/star.gif',
          title: _translate('@tutorial-modal2-title'),
          content: _translate('@tutorial-modal2-content')
        },
        {
          className: {
            wrap: 'tutorial-mention',
            arrow: 'bottom'
          },
          src: 'assets/videos/tutorial/popover/mention.mp4',
          imgSrc: 'assets/images/tutorial/popover/mention.gif',
          title: _translate('@tutorial-modal3-title'),
          content: _translate('@tutorial-modal3-content')
        },
        {
          className: {
            wrap: 'tutorial-msg-search',
            arrow: 'top'
          },
          src: 'assets/videos/tutorial/popover/msg-search.mp4',
          imgSrc: 'assets/images/tutorial/popover/msg-search.gif',
          title: _translate('@tutorial-modal4-title'),
          content: _translate('@tutorial-modal4-content')
        },
        {
          className: {
            wrap: 'tutorial-jump',
            arrow: 'top'
          },
          src: 'assets/images/tutorial/popover/jump.gif',
          title: _translate('@tutorial-modal5-title'),
          content: _translate('@tutorial-modal5-content')
        },
        {
          className: {
            wrap: 'tutorial-hotkey',
            arrow: 'top'
          },
          src: 'assets/images/tutorial/popover/shortcut.gif',
          title: _translate('@tutorial-modal6-title'),
          content: _translate('@tutorial-modal6-content')
        },
        {
          className: {
            wrap: 'tutorial-connect',
            arrow: 'top'
          },
          src: 'assets/videos/tutorial/popover/connect.mp4',
          imgSrc: 'assets/images/tutorial/popover/connect.gif',
          title: _translate('@tutorial-modal7-title'),
          content: _translate('@tutorial-modal7-content')
        },
        {
          className: {
            wrap: 'tutorial-connect tutorial-complete',
            arrow: 'top'
          },
          src: 'assets/images/center/help-create-a-new-team.gif',
          title: _translate('@tutorial_congratulations').replace('{{username}}',
            memberService.getName(memberService.getMember())),
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
        _initSteps();
        _preloadVideo();
        _resetProperties();
        _attachDomEvents();
        _start();

      }

      /**
       * 윈도우 앱에서 mp4 를 재생 하지 못하므로, image 스냅샷으로 리소스를 대체한다.
       * TODO: mp4 재생 가능한 Electron 윈도우 앱 런칭 완료 이후 해당 로직 및 imgSrc 프로퍼티 제거해야 함.
       * @private
       */
      function _initSteps() {
        if (HybridAppHelper.isPcApp()) {
          _.forEach(scope.stepList, function(step) {
            step.src = step.imgSrc || step.src;
          });
        }
      }

      /**
       * 튜토리얼 비디오 리소스를 preload 한다.
       * @private
       */
      function _preloadVideo() {
        _.forEach(scope.stepList, function(step) {
          var jqEl;
          if (!_isImage(step.src)) {
            jqEl = $('<video></video>');
            jqEl[0].muted = true;
            jqEl[0].autoplay = true;
            jqEl.attr({
              src: step.src
            }).css({
              display: 'none'
            });
            el.append(jqEl);
          }
        });
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
        el.find('video').on('loadeddata', _onLoad);
        el.find('img').on('load', _onLoad);
      }

      /**
       * video load 이벤트 핸들러
       * @private
       */
      function _onLoad() {
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
          scope.isLoaded = false;
          scope.isVideo = !_isImage(curStep.src);
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
