/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndMainKeyHandler', jndMainKeyHandler);

  function jndMainKeyHandler($state, jndKeyCode, jndPubSub, currentSessionHelper, Privacy, modalHelper) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope) {
      var _isActivated = false;
      var jqBody = $('body');
      var _rPanelMenuList = [
        'files',
        'messages',
        'stars',
        'mentions'
      ];
      var keyHandlerMap = {
        'shift-ctrl-alt': {

        },
        'shift-ctrl': {
          'CHAR_K': {
            handler: _toggleSticker,
            isExactMatch: true,
            isPreventDefault: true
          },
          'CHAR_L': {
            handler: _togglePrivacy,
            isExactMatch: true,
            isPreventDefault: true
          }
        },
        'shift-alt': {
          'CHAR_T': {
            handler: _openTeamModal,
            isExactMatch: true,
            isPreventDefault: true
          }
        },
        'shift': {

        },
        'ctrl-alt': {

        },
        'ctrl': {
          'CHAR_J': {
            handler: _toggleQuickLauncher,
            isExactMatch: true,
            isPreventDefault: true
          },
          '[': {
            handler: _toggleRightPanel,
            isExactMatch: true,
            isPreventDefault: true
          }
          //,
          //'RIGHT_ARROW': {
          //  handler: _rPanelNext,
          //  isExactMatch: true,
          //  isPreventDefault: true,
          //  extraCondition: _isNotInput
          //},
          //'LEFT_ARROW': {
          //  handler: _rPanelPrev,
          //  isExactMatch: true,
          //  isPreventDefault: true,
          //  extraCondition: _isNotInput
          //}
        },
        'alt': {

        },
        'none': {
          'ENTER': {
            handler: _setChatInputFocus,
            isExactMatch: true,
            isPreventDefault: true,
            extraCondition: function(keyEvent) {
              return !_isModalShown() && !_isInput($(keyEvent.target));
            }
          }
        }
      };

      _init();


      /**
       * 오른쪽 패널 열고 닫음을 토글한다
       * @private
       */
      function _toggleRightPanel() {
        var index = _getCurrentRightPanelIndex();
        if (index === -1) {
          index = 0;
        }
        jndPubSub.pub('hotkey-open-right', _rPanelMenuList[index]);
      }

      /**
       * right panel 에서 다음 메뉴로 이동한다
       * @private
       */
      function _rPanelNext() {
        var current = _getCurrentRightPanelIndex();
        var next = current + 1;
        if (next === _rPanelMenuList.length) {
          next = 0;
        }
        jndPubSub.pub('hotkey-open-right', _rPanelMenuList[next]);
      }

      /**
       * right panel 에서 이전 메뉴로 이동한다
       * @private
       */
      function _rPanelPrev() {
        var current = _getCurrentRightPanelIndex();
        var prev = current - 1;
        if (current === -1) {
          prev = 0;
        } else if (prev === -1) {
          prev = _rPanelMenuList.length - 1;
        }
        jndPubSub.pub('hotkey-open-right', _rPanelMenuList[prev]);
      }

      /**
       * 현재 right panel 에 open 된 메뉴가 몇 번째 메뉴인지를 반환한다.
       * @returns {number}
       * @private
       */
      function _getCurrentRightPanelIndex() {
        var currentNameList = $state.current.name.split('.');
        var tabName = currentNameList[currentNameList.length - 1];
        return _rPanelMenuList.indexOf(tabName);
      }

      /**
       * 생성자
       * @private
       */
      function _init() {
        _setActiveStatus();
        _on();
      }

      function _openTeamModal() {
        modalHelper.openTeamChangeModal(scope);
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
       * @param {Event} keyEvent
       * @param {Object} keyHandlerObj
       *    @param {function} keyHandlerObj.handler
       *    @param {boolean} keyHandlerObj.isPreventDefault
       * @returns {boolean}
       * @private
       */
      function _executeHandler(keyEvent, keyHandlerObj) {
        if (_.isFunction(keyHandlerObj && keyHandlerObj.handler)) {
          if (keyHandlerObj.isPreventDefault) {
            keyEvent.preventDefault();
          }
          keyHandlerObj.handler(keyEvent);
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
      function _getHandlerObj(keyEvent, keyName) {
        var keyHandlerObj;
        var fnKeyList = [keyEvent.shiftKey, keyEvent.ctrlKey || keyEvent.metaKey, keyEvent.altKey];
        keyHandlerObj = keyHandlerMap[_getHandlerName.apply(this, fnKeyList)][keyName];

        while (!_.isFunction(keyHandlerObj && keyHandlerObj.handler) && !_isFalsy(fnKeyList)) {
          _.forEach(fnKeyList, function(value, key) {
            if (value) {
              fnKeyList[key] = false;
              return false;
            }
          });
          keyHandlerObj = keyHandlerMap[_getHandlerName.apply(this, fnKeyList)][keyName];
          if (keyHandlerObj) {
            if (keyHandlerObj.isExactMatch) {
              keyHandlerObj = null;
            }
          }
        }
        if (keyHandlerObj && _.isFunction(keyHandlerObj.extraCondition)) {
          if (!keyHandlerObj.extraCondition(keyEvent)) {
            keyHandlerObj = null;
          }
        }
        return keyHandlerObj;
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
        var handlerObj;
        if (_isActivated && keyName) {
          handlerObj = _getHandlerObj(keyEvent, keyName);
          _executeHandler(keyEvent, handlerObj);
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
