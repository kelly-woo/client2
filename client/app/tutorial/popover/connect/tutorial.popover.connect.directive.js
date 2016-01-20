/**
 * @fileoverview 커넥트 튜토리얼 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialPopoverConnect', tutorialPopoverConnect);

  function tutorialPopoverConnect(JndUtil, jndPubSub) {
    return {
      link: link,
      scope: {},
      restrict: 'E',
      controller: 'TutorialPopoverConnectCtrl',
      templateUrl: 'app/tutorial/popover/connect/tutorial.popover.connect.html'
    };

    function link(scope, el, attrs) {
      scope.isVideoLoaded = false;

      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        el.find('video').on('loadeddata', _onVideoLoad);
      }

      /**
       * video load 핸들러
       * @private
       */
      function _onVideoLoad() {
        JndUtil.safeApply(scope, function() {
          scope.isVideoLoaded = true;
        });
      }
    }
  }
})();
