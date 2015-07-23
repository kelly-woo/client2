/**
 * @fileoverview text animate 하는 directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('animateText', animateText);

  function animateText($interval) {
    return {
      restrict: 'A',
      link: link,
      scope: {
        animateText: '=',
        delay: '='
      }
    };
    function link(scope, el, attr)  {
      var DEFAULT_DELAY = 800;
      var _messages;
      var _index = 0;
      var _delay;
      var _timer;

      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _delay = $scope.delay || DEFAULT_DELAY;
        _messages = scope.animateText;
        el.text(_messages[_index]);
        _attachEvents();
        _start();
      }

      /**
       * event 바인딩 한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _stop();
      }

      /**
       * animation 을 시작한다.
       * @private
       */
      function _start() {
        _stop();
        _timer = $interval(_animate, _delay);
      }

      /**
       * animate
       * @private
       */
      function _animate() {
        if (_index + 1 === _messages.length) {
          _index = 0;
        } else {
          _index++;
        }
        el.text(_messages[_index]);
      }

      /**
       * animation 을 중지한다.
       * @private
       */
      function _stop() {
        $interval.cancel(_timer);
        _index = 0;
      }
    }
  }
})();
