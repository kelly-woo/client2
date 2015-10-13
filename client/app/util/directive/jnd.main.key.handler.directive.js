/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndMainKeyHandler', jndMainKeyHandler);

  function jndMainKeyHandler(jndKeyCode, jndPubSub) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el, attrs) {
      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        _attachDomEvents();
      }

      /**
       * 이벤트 바인딩 한다.
       * @private
       */
      function _attachDomEvents() {
        el.on('keyup', _onKeyUp);
      }

      /**
       * keyup 이벤트 핸들러
       * @param {object} keyEvent
       * @private
       */
      function _onKeyUp(keyEvent) {
        var jqTarget = $(keyEvent.target);
        if (jndKeyCode.match('ENTER', keyEvent.keyCode) && !_isInput(jqTarget) && !_isModalShown()) {
          jndPubSub.pub('setChatInputFocus');
        } else if (_isQuickLauncherShortcut(keyEvent)) {
          jndPubSub.pub('toggleQuickLauncher');
        }
      }

      /**
       * modal 이 노출 되었는지 여부를 반환한다.
       * @returns {boolean}
       * @private
       */
      function _isModalShown() {
        return !!$('.modal').length;
      }

      /**
       * 인자로 넘긴 target 이 input 요소인지 확인한다.
       * @param {object} jqTarget
       * @returns {boolean}
       * @private
       */
      function _isInput(jqTarget) {
        return jqTarget.is('input') || jqTarget.is('textarea') || jqTarget.is('button');
      }

      /**
       * quick launcher shortcut인지 여부를 반환한다.
       * @param {boolean} keyEvent
       * @returns {*|boolean}
       * @private
       */
      function _isQuickLauncherShortcut(keyEvent) {
        return jndKeyCode.match('CHAR_Q', keyEvent.keyCode) && keyEvent.ctrlKey;
      }
    }
  }
})();
