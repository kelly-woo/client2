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

      var keyHandlerMap = {
        //
        'always': {
          'ENTER': _setChatInputFocus
        },
        'ctrlShift': {
          'CHAR_K': _toggleSticker,
          'CHAR_L': _togglePrivate
        },
        'shift': {
        },
        'ctrl': {
          'CHAR_J': _toggleQuickLauncher
        },
        'only': {
        }
      };

      _init();

      function _toggleSticker() {
        jndPubSub.pub('center:toggleSticker');
      }

      function _toggleQuickLauncher() {
        jndPubSub.pub('toggleQuickLauncher');
      }

      function _setChatInputFocus(keyEvent) {
        if (_isChatInputFocus(keyEvent)) {
          jndPubSub.pub('setChatInputFocus');
        }
      }

      function _togglePrivate() {
        if ($('body').hasClass('blurred')) {
          $('body').removeClass('blurred');
        } else {
          $('body').addClass('blurred');
        }
      }
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
        scope.$on('document:visibilityChange', onVisibilityChange);

        jqBody
          .on('keydown', _onKeyInput);
      }

      /**
       * off listeners
       * @private
       */
      function _off() {
        jqBody
          .off('keydown', _onKeyInput);
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
      function onVisibilityChange() {
        if (!currentSessionHelper.isBrowserHidden()) {
          jqBody.focus();
        }
      }

      /**
       *
       * @param keyEvent
       * @param keyHandler
       * @returns {boolean}
       * @private
       */
      function _executeHandler(keyEvent, keyHandler) {
        if (_.isFunction(keyHandler)) {
          keyEvent.preventDefault();
          keyHandler(keyEvent);
          return true;
        } else {
          return false;
        }
      }
      
      /**
       * key 이벤트 핸들러
       * @private
       */
      function _onKeyInput(keyEvent) {
        var keyName = jndKeyCode.getName(keyEvent.keyCode);
        if (keyName) {
          if (!_executeHandler(keyEvent, keyHandlerMap['always'][keyName])) {
            if (keyEvent.shiftKey) {
              if (keyEvent.ctrlKey || keyEvent.metaKey) {
                _executeHandler(keyEvent, keyHandlerMap['ctrlShift'][keyName]);
              } else {
                _executeHandler(keyEvent, keyHandlerMap['shift'][keyName]);
              }
            } else if (keyEvent.ctrlKey || keyEvent.metaKey) {
              _executeHandler(keyEvent, keyHandlerMap['ctrl'][keyName]);
            } else {
              _executeHandler(keyEvent, keyHandlerMap['none'][keyName]);
            }
          }
        }
      }

      /**
       * center의 chat input에 focus가야하는 shortcut인지 여부를 반환한다.
       * @param {object} keyEvent
       * @returns {*|boolean}
       * @private
       */
      function _isChatInputFocus(keyEvent) {
        var jqTarget = $(keyEvent.target);
        return jndKeyCode.match('ENTER', keyEvent.keyCode) && !_isInput(jqTarget) && !_isModalShown();
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
    }
  }
})();
