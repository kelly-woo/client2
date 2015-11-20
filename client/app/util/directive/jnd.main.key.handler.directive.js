/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndMainKeyHandler', jndMainKeyHandler);

  function jndMainKeyHandler($state, jndKeyCode, jndPubSub, currentSessionHelper, Privacy, modalHelper, Browser,
                             JndLocalStorage) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope) {
      var MAX_SCALE = 1.30;
      var MIN_SCALE = 0.70;

      var _isActivated = false;
      var _jqBody = $('body');
      var _isLocked = false;
      var _lockTimer;

      var _currentScale = 1;
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
          'CHAR_L': {
            handler: _togglePrivacy
          },
          //파일 검색 탭
          'CHAR_F': {
            handler: function() {
              jndPubSub.pub('hotkey-open-right', _rPanelMenuList[0]);
            }
          },
          //메세지 검색 탭
          'CHAR_G': {
            handler: function() {
              jndPubSub.pub('hotkey-open-right', _rPanelMenuList[1]);
            }
          },
          //즐겨찾기 탭
          'CHAR_S': {
            handler: function() {
              jndPubSub.pub('hotkey-open-right', _rPanelMenuList[2]);
            }
          },
          //멘션 탭
          'CHAR_M': {
            handler: function() {
              jndPubSub.pub('hotkey-open-right', _rPanelMenuList[3]);
            }
          },
          //다음탭 이동
          'CHAR_DOT': {
            handler: _rPanelNext
          },
          //이전탭 이동
          'CHAR_COMMA': {
            handler: _rPanelPrev
          },
          //우측패널 토글
          '[': {
            handler: _toggleRightPanel,
            isExactMatch: false
          }
        },
        'shift-alt': {
        },
        'shift': {

        },
        'ctrl-alt': {
        },
        'ctrl': {
          //스티커 토글
          'CHAR_E': {
            handler: _toggleSticker
          },
          //upload
          'CHAR_U': {
            handler: function() {
              jndPubSub.pub('hotkey-upload');
            }
          },
          //토픽에 멤버 초대
          'CHAR_I': {
            handler: function() {
              if (currentSessionHelper.getCurrentEntityType() !== 'users') {
                modalHelper.openTopicInviteModal(scope);
              }
            }
          },
          //퀵 런처
          'CHAR_J': {
            handler: _toggleQuickLauncher
          },
          'PLUS': {
            handler: _zoomIn
          },
          'MINUS': {
            handler: _zoomOut
          },
          'NUM_0': {
            handler: _zoomReset
          }
        },
        'alt': {
          //파일 검색 탭
          'NUM_1': {
            handler: function() {
              jndPubSub.pub('hotkey-open-right', _rPanelMenuList[0]);
            }
          },
          //메세지 검색 탭
          'NUM_2': {
            handler: function() {
              jndPubSub.pub('hotkey-open-right', _rPanelMenuList[1]);
            }
          },
          //즐겨찾기 탭
          'NUM_3': {
            handler: function() {
              jndPubSub.pub('hotkey-open-right', _rPanelMenuList[2]);
            }
          },
          //멘션 탭
          'NUM_4': {
            handler: function() {
              jndPubSub.pub('hotkey-open-right', _rPanelMenuList[3]);
            }
          },
          //팀전환
          'CHAR_T': {
            handler: function() {
              modalHelper.openTeamChangeModal(scope);
            }
          }
        },
        'none': {
          //중앙 input에 focus
          'ENTER': {
            handler: _setChatInputFocus,
            extraCondition: function(keyEvent) {
              return !_isModalShown() && !_isInput($(keyEvent.target));
            }
          },
          //위로 스크롤
          'PAGE_UP': {
            handler: function() {
              jndPubSub.pub('hotkey-scroll-page-up');
            }
          },
          //아래로 스크롤
          'PAGE_DOWN': {
            handler: function() {
              jndPubSub.pub('hotkey-scroll-page-down');
            }
          }
        }
      };

      _init();

      /**
       * zoom 을 초기화 한다
       * @private
       */
      function _zoomReset() {
        _currentScale = 1;
        _setZoom();
      }

      /**
       * zoom in
       * @private
       */
      function _zoomIn() {
        _currentScale += 0.01;
        _currentScale = Math.ceil(_currentScale * 100) / 100;
        if (_currentScale > MAX_SCALE) {
          _currentScale = MAX_SCALE;
        } else {
          _setZoom();
        }
      }

      /**
       * zoom 을 설정한다
       * @private
       */
      function _setZoom() {
        _currentScale = _.isNumber(_currentScale) ? _currentScale : 1;
        JndLocalStorage.set(0, 'zoom', _currentScale);
        $('.content-wrapper').css({
          'zoom': _currentScale
        });
      }

      /**
       * zoom out
       * @private
       */
      function _zoomOut() {
        _currentScale -= 0.01;
        _currentScale = Math.ceil(_currentScale * 100) / 100;
        if (_currentScale < MIN_SCALE) {
          _currentScale = MIN_SCALE;
        } else {
          _setZoom();
        }
      }

      /**
       * 오른쪽 패널 열고 닫음을 토글한다
       * @private
       */
      function _toggleRightPanel() {
        var index = _getCurrentRightPanelIndex();
        if (!_isLocked) {
          _keyLock();
          if (index === -1) {
            index = 0;
          }
          jndPubSub.pub('hotkey-open-right', _rPanelMenuList[index]);
        }
      }

      /**
       * right panel 에서 다음 메뉴로 이동한다
       * @private
       */
      function _rPanelNext() {
        var current = _getCurrentRightPanelIndex();
        var next = current + 1;

        if (!_isLocked) {
          _keyLock();
          if (next === _rPanelMenuList.length) {
            next = 0;
          }
          jndPubSub.pub('hotkey-open-right', _rPanelMenuList[next]);
        }
      }

      function _keyLock() {
        _isLocked = true;
        _lockTimer = setTimeout(function() {
          _isLocked = false;
        }, 100);
      }

      /**
       * right panel 에서 이전 메뉴로 이동한다
       * @private
       */
      function _rPanelPrev() {
        var current = _getCurrentRightPanelIndex();
        var prev = current - 1;
        if (!_isLocked) {
          _keyLock();
          if (current === -1) {
            prev = 0;
          } else if (prev === -1) {
            prev = _rPanelMenuList.length - 1;
          }
          jndPubSub.pub('hotkey-open-right', _rPanelMenuList[prev]);
        }
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
        _attachEvents();

      }

      /**
       * zoom 상태를 초기화 한다
       * @private
       */
      function _initializeZoom() {
        _currentScale = JndLocalStorage.get(0, 'zoom') || 1;
        _currentScale = parseInt(_currentScale, 10);
        _setZoom();
      }

      /**
       * on listeners
       * @private
       */
      function _attachEvents() {
        scope.$on('dataInitDone', _initializeZoom);
        scope.$on('$destroy', _onDestroy);
        scope.$on('document:visibilityChange', onVisibilityChange);
        scope.$on('$stateChangeSuccess', _onStateChageSuccess);
        _jqBody.on('keydown', _onKeyInput);
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
        _jqBody
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
          _jqBody.focus();
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
        var isPreventDefault;
        if (_.isFunction(keyHandlerObj && keyHandlerObj.handler)) {
          isPreventDefault = _.isBoolean(keyHandlerObj.isPreventDefault) ? keyHandlerObj.isPreventDefault : true;
          if (isPreventDefault) {
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
        var isExactMatch;
        var extraCondition = function() {
          return !_isModalShown();
        };
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
            isExactMatch = _.isBoolean(keyHandlerObj.isExactMatch) ? keyHandlerObj.isExactMatch : true;
            if (isExactMatch) {
              keyHandlerObj = null;
            }
          }
        }
        if (keyHandlerObj) {
          if (_.isFunction(keyHandlerObj.extraCondition)) {
            extraCondition = keyHandlerObj.extraCondition;
          }

          if (!extraCondition(keyEvent)) {
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
