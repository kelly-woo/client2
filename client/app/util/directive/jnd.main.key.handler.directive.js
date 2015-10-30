/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndMainKeyHandler', jndMainKeyHandler);

  function jndMainKeyHandler(jndKeyCode, jndPubSub, currentSessionHelper) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope) {
      var jqBody = $('body');

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        _on();
      }

      /**
       * on listeners
       * @private
       */
      function _on() {
        scope.$on('$destroy', _onDestroy);
        scope.$on('document:visibilityChange', _onVisibilitychange);

        jqBody
          .on('keydown', _onKeyDown)
          .on('keyup', _onKeyUp);
      }

      /**
       * off listeners
       * @private
       */
      function _off() {
        jqBody
          .off('keydown', _onKeyDown)
          .off('keyup', _onKeyUp);
      }

      /**
       * scope destory event handler
       * @private
       */
      function _onDestroy() {
        _off();
      }

      /**
       * visibility change event handler
       * @private
       */
      function _onVisibilitychange() {
        if (!currentSessionHelper.isBrowserHidden()) {
          jqBody.focus();
        }
      }

      /**
       * keydown 이벤트 핸들러
       * @private
       */
      function _onKeyDown(keyEvent) {
        if (_isQuickLauncherShortcut(keyEvent)) {

          // browser에서 사용하는 shortcut을 override 한다.
          keyEvent.preventDefault();
          jndPubSub.pub('toggleQuickLauncher');
        } else if (_isCenterStickerShortcut(keyEvent)) {
          keyEvent.preventDefault();
          jndPubSub.pub('center:toggleSticker');
        }
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
        var keyCode = keyEvent.keyCode;
        //keyEvent.ctrlKey && (jndKeyCode.match('CHAR_Q', keycode));
        return (keyEvent.ctrlKey || keyEvent.metaKey) && (jndKeyCode.match('CHAR_J', keyCode));
      }

      /**
       * center sticker shortcut 인지 여부를 반환한다.
       * @param {object} keyEvent
       */
      function _isCenterStickerShortcut(keyEvent) {
        var keyCode = keyEvent.keyCode;
        return (keyEvent.ctrlKey || keyEvent.metaKey) && (keyEvent.shiftKey) && jndKeyCode.match('CHAR_K', keyCode);
      }
    }
  }
})();
