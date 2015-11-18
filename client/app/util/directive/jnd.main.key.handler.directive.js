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
        'shift-ctrl-alt': {

        },
        'shift-ctrl': {
          'CHAR_K': _toggleSticker,
          'CHAR_L': _togglePrivacy
        },
        'shift-alt': {

        },
        'shift': {

        },
        'ctrl-alt': {

        },
        'ctrl': {
          'CHAR_J': _toggleQuickLauncher
        },
        'alt': {

        },
        'none': {
          'ENTER': _setChatInputFocus
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
       * list 의 모든 item 이 false 인지 여부를 반환한다
       * @param {array} list
       * @returns {boolean}
       * @private
       */
      function _isFalsy(list) {
        var isFalsy = true;
        _.forEach(list, function(value) {
          if (value) {
            isFalsy = false;
            return false;
          }
        });
        return isFalsy;
      }

      /**
       * handler 를 반환한다
       * @param {Event} keyEvent
       * @param {String} keyName
       * @returns {Function|undefined}
       * @private
       */
      function _getHandler(keyEvent, keyName) {
        var keyHandler;
        var fnKeyList = [keyEvent.shiftKey, keyEvent.ctrlKey || keyEvent.metaKey, keyEvent.altKey];
        keyHandler = keyHandlerMap[_getHandlerName.apply(this, fnKeyList)][keyName];
        while (!_.isFunction(keyHandler) && !_isFalsy(fnKeyList)) {
          _.forEach(fnKeyList, function(value, key) {
            if (value) {
              fnKeyList[key] = false;
              return false;
            }
          });
          keyHandler = keyHandlerMap[_getHandlerName.apply(this, fnKeyList)][keyName];
        }
        return keyHandler;
      }

      /**
       * keyHandler name 을 반환한다
       * @param {boolean} shift
       * @param {boolean} ctrl
       * @param {boolean} alt
       * @returns {string}
       * @private
       */
      function _getHandlerName(shift, ctrl, alt) {
        var nameList = [];
        if (shift) {
          nameList.push('shift');
        }
        if (ctrl) {
          nameList.push('ctrl');
        }
        if (alt) {
          nameList.push('alt');
        }
        return nameList.join('-') || 'none';
      }

      /**
       * key 이벤트 핸들러
       * @private
       */
      function _onKeyInput(keyEvent) {
        var keyName = jndKeyCode.getName(keyEvent.keyCode);
        var handler;
        if (_isActivated && keyName) {
          handler = _getHandler(keyEvent, keyName);
          _executeHandler(keyEvent, handler);
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
