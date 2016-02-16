/**
 * @fileoverview ctrl + shift + L 입력 시 사생활 보호 레이어 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('guidePrivacy', guidePrivacy);

  function guidePrivacy($filter, jndKeyCode, jndPubSub, Privacy, Browser) {
    return {
      restrict: 'E',
      link: link,
      replace: true,
      scope: {},
      templateUrl: 'app/layer/guide/guide.privacy.html'
    };

    function link(scope, el, attrs) {
      var _jqInput = el.find('input');
      var _jqMsgContainer = el.find('.blurred-msg-container');
      var _timer;

      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _initializeElements();
        _attachEvents();
        _attachDomEvents();
      }

      /**
       * 엘리먼트를 초기화 한다.
       * @private
       */
      function _initializeElements() {
        var msg = $filter('translate')('@common-privacy-lock-msg');
        if (Browser.platform.isMac) {
          msg = msg.replace('Ctrl', 'Cmd');
        }
        el.find('._msg').html(msg);
        el.hide();
      }

      /**
       * events listener 를 등록한다
       * @private
       */
      function _attachEvents() {
        scope.$on('privacy:set', _onPrivacySet);
        scope.$on('privacy:unset', _onPrivacyUnSet);
        scope.$on('notification-click', _onNotificationClick);
      }

      /**
       * notification click 시 privacy mode 를 unset 한다
       * @private
       */
      function _onNotificationClick() {
        Privacy.unset();
      }

      /**
       * dom 이벤트를 바인딩한다
       * @private
       */
      function _attachDomEvents() {
        el.on('click', _onClick);
        _jqInput.on('keydown', _onKeyDown);
      }

      /**
       * click 이벤트 핸들러
       * @private
       */
      function _onClick() {
        _showGuideText();
        _jqInput.focus();
      }

      /**
       * keydown 이벤트 핸들러
       * @param {Event} keyEvent
       * @private
       */
      function _onKeyDown(keyEvent) {
        if (jndKeyCode.match('ESC', keyEvent.keyCode)) {
          keyEvent.stopPropagation();
          Privacy.unset();
        } else if (!_isLockKeyEntered(keyEvent)) {
          keyEvent.stopPropagation();
          _showGuideText();
        }
      }

      /**
       * guide text 를 노출한다
       * @private
       */
      function _showGuideText() {
        clearTimeout(_timer);
        _timer = setTimeout(_hideGuideText, 2000);
        _jqMsgContainer.stop().fadeIn(800);
      }

      /**
       * guide text 를 감춘다
       * @private
       */
      function _hideGuideText() {
        clearTimeout(_timer);
        _jqMsgContainer.stop().fadeOut(800);
      }

      /**
       * lock toggle key 입력이 들어왔는지 여부를 반환한다
       * @param {Event} keyEvent
       * @returns {boolean|*}
       * @private
       */
      function _isLockKeyEntered(keyEvent) {
        var isSpecialKeyPressed = keyEvent.shiftKey && (keyEvent.ctrlKey || keyEvent.metaKey);
        return isSpecialKeyPressed && jndKeyCode.match('CHAR_L', keyEvent.keyCode);
      }

      /**
       * privacy 모드가 set 된 경우 이벤트 핸들러
       * @private
       */
      function _onPrivacySet() {
        $('body').addClass('blurred');
        el.show();
        _jqMsgContainer.hide();
        _showGuideText();
        _jqInput.focus();
      }

      /**
       * privacy 모드가 unset 된 경우 이벤트 핸들러
       * @private
       */
      function _onPrivacyUnSet() {
        $('body').removeClass('blurred');
        el.hide();
        _jqInput.blur();
        jndPubSub.pub('setChatInputFocus');
      }
    }
  }
})();
