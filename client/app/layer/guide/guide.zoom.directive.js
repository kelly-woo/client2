/**
 * @fileoverview ctrl + shift + L 입력 시 사생활 보호 레이어 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('guideZoom', guideZoom);

  function guideZoom($filter, jndKeyCode, jndPubSub, Privacy, Browser) {
    return {
      restrict: 'E',
      link: link,
      replace: true,
      scope: {},
      templateUrl: 'app/layer/guide/guide.zoom.html'
    };

    function link(scope, el, attrs) {
      //var _jqInput = el.find('input');
      //var _jqMsgContainer = el.find('.blurred-msg-container');
      var _timer;

      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _initializeElements();
        _attachEvents();
        //_attachDomEvents();
      }

      /**
       * 엘리먼트를 초기화 한다.
       * @private
       */
      function _initializeElements() {
        //var msg = $filter('translate')('@common-privacy-lock-msg');
        //if (Browser.platform.isMac) {
        //  msg = msg.replace('Ctrl', 'Cmd');
        //}
        //el.find('._msg').html(msg);
        el.hide();
      }

      /**
       * events listener 를 등록한다
       * @private
       */
      function _attachEvents() {
        scope.$on('zoom:change', _onZoomChange);
      }

      function _onZoomChange(angularEvent, scale) {
        _show(scale);
      }

      /**
       * guide text 를 노출한다
       * @private
       */
      function _show(scale) {
        scale *= 100;
        scale = Math.ceil(scale);
        el.find('.zoom-ratio').html(scale + '%');
        clearTimeout(_timer);
        _timer = setTimeout(_hide, 2000);
        el.stop().fadeIn(800);
      }

      /**
       * guide text 를 감춘다
       * @private
       */
      function _hide() {
        clearTimeout(_timer);
        el.stop().fadeOut(800);
      }
    }
  }
})();
