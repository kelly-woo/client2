/**
 * @fileoverview scale up animation 을 수행하는 directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('scaleUp', scaleUp);

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
  function scaleUp() {
    return {
      restrict: 'A',
      scope: {
        src: '@src'
      },
      link: link
    };

    function link(scope, el, attrs) {
      var _duration = attrs.duration || 200;
      var _startWidth = attrs.startWidth || 0;
      var _startHeight = attrs.startHeight || 0;
      var _endWidth = attrs.endWidth || 126;
      var _endHeight = attrs.endHeight || 126;

      var _marginVertical;
      var _marginHorizontal;

      scope.$watch('src', _beforeAnimate);

      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _initVariables();
        _attachEvents();
        el.parent().css('min-height', el.height());
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * 변수를 초기화 한다.
       * @private
       */
      function _initVariables() {
        var heightDiff = _endHeight - _startHeight;
        var widthDiff = _endWidth - _startWidth;

        _marginVertical = Math.floor(heightDiff / 2);
        _marginHorizontal = Math.floor(widthDiff / 2);

        //odd
        if (heightDiff % 2) {
          _startHeight++;
        }
        if (widthDiff % 2) {
          _startWidth++;
        }
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachEvents();
      }

      /**
       * 이벤트 바인딩
       * @private
       */
      function _attachEvents() {
        el.on('load', _animate);
      }

      /**
       * 이벤트 바인딩 해제
       * @private
       */
      function _detachEvents() {
        el.off('load', _animate);
      }

      /**
       * animate 시작 전 scale 을 설정한다..
       * @private
       */
      function _beforeAnimate() {
        el.css({
          width: _startHeight + 'px',
          height: _startWidth + 'px',
          marginLeft: _marginHorizontal + 'px',
          marginTop: _marginVertical + 'px'
        });
      }

      /**
       * animate를 시작한다.
       * @private
       */
      function _animate() {
        el.animate({
          width: _endWidth,
          height: _endHeight,
          marginLeft: 0,
          marginTop: 0
        }, _duration);
      }
    }
  }
})();
