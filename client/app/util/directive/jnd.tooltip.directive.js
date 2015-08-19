/**
 * @fileoverview scale up animation 을 수행하는 directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndTooltip', jndTooltip);

  /**
   * on-load-scale-up directive
   * on load 이벤트 발생시 scale up 에니메이션을 수행한다.
   *
   * @returns {{restrict: string, scope: {src: string}, link: link}}
   * @example

   <img src="xxx.com"
   on-load-scale-up
   duration="300"
   start-width="30"
   start-height="30"
   end-width="100"
   end-height="100" />

   */
  function jndTooltip() {
    return {
      restrict: 'E',
      templateUrl: 'app/util/directive/tootip.html',
      scope: {},
      link: link
    };

    function link(scope, el, attrs) {


      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {

      }

      /**
       * 이벤트 바인딩
       * @private
       */
      function _attachEvents() {
        scope.$on('tooltip:show', _onShow);
        scope.$on('tooltip:hide', _onHide);
      }

      /**
       * 이벤트 바인딩 해제
       * @private
       */
      function _detachEvents() {

      }
    }
  }
})();
