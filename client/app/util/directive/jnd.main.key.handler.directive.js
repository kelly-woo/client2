/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndMainKeyHandler', jndMainKeyHandler);

  function jndMainKeyHandler($state, jndKeyCode, jndPubSub, currentSessionHelper, Privacy) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope) {
      var _isActivated = false;
      var jqBody = $('body');
      var keyHandlerMap = {
        //ctrl, shift 입력 상태와 관계없이 수행하는  핸들러
        'always': {
          'ENTER': _setChatInputFocus
        },
        //ctrl + shift 와 함께 입력시 핸들러
        'ctrlShift': {
          'CHAR_K': _toggleSticker,
          'CHAR_L': _togglePrivacy
        },
        //shift 와 함께 입력시 핸들러
        'shift': {
        },
        //ctrl 과 함께 입력시 핸들러
        'ctrl': {
          'CHAR_J': _toggleQuickLauncher
        },
        //ctrl, shift 둘다 입력 없이 수행하는 핸들러
        'only': {
        }
      };

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        _setActiveStatus();
        _on();
      }

      /**
       * on listeners
       * @private
       */
      function _on() {
        scope.$on('$destroy', _onDestroy);
        scope.$on('document:visibilityChange', onVisibilityChange);
        scope.$on('$stateChangeSuccess', _onStateChageSuccess);
        jqBody.on('keydown', _onKeyInput);
      }

      function _onStateChageSuccess(angularEvent, toState, toParams, fromState, fromParams) {
        _setActiveStatus();
      }

      /**
       * key handler 의 active status 를 설정한다.
       * (sign-in 일 경우 key handler 의 기능을 막는다)
       * @private
       */
      function _setActiveStatus() {
        _isActivated = ($state.current.name !== 'signin');
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
        if (_isActivated && keyName) {
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
              _executeHandler(keyEvent, keyHandlerMap['only'][keyName]);
            }
          }
        }
      }

      /**
       * sticker 토글
       * @private
       */
      function _toggleSticker() {
        jndPubSub.pub('center:toggleSticker');
      }

      /**
       * quick launcher 토글
       * @private
       */
      function _toggleQuickLauncher() {
        jndPubSub.pub('toggleQuickLauncher');
      }

      /**
       * center input 에 포커스
       * @param {Event} keyEvent
       * @private
       */
      function _setChatInputFocus(keyEvent) {
        if (_isChatInputFocus(keyEvent)) {
          jndPubSub.pub('setChatInputFocus');
        }
      }

      /**
       * privacy 기능 toggle
       * @private
       */
      function _togglePrivacy() {
        if (Privacy.is()) {
          Privacy.unset();
        } else {
          Privacy.set();
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
