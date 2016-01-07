
/**
 * window 간 통신을 위한 postMessage 디렉티브
 */
(function() {
  'use strict';

  angular.
    module('jandiApp')
    .directive('windowPostMessage', windowPostMessage);

  /* @ngInject */
  function windowPostMessage(JndUtil, jndPubSub) {

    return {
      restrict: 'A',
      scope: false,
      link: link
    };

    function link(scope, el, attrs) {
      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _attachDomEvents();
      }

      /**
       * dom event 를 바인딩 한다
       * @private
       */
      function _attachDomEvents() {
        $(window).on('message', _onMessageReceive);
      }

      /**
       * message 이벤트 핸들러
       * @param {object} messageEvent
       * @private
       */
      function _onMessageReceive(messageEvent) {
        var origin = messageEvent.originalEvent.origin;
        var data = messageEvent.originalEvent.data;
        if (_isWhiteUrl(origin) && data) {
          JndUtil.safeApply(scope, function() {
            jndPubSub.pub(data);
          });
        }
      }

      /**
       * 안전한 url 인지 확인한다.
       * @param {string} url
       * @returns {boolean}
       * @private
       */
      function _isWhiteUrl(url) {
        return /^https?:\/\/[^\/\.]+.jandi.(com|io)/.test(url);
      }
    }
  }
})();
