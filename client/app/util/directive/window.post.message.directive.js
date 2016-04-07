
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
        var event = _eventParse(messageEvent.originalEvent);

        if (_isWhiteUrl(origin) && event) {
          JndUtil.safeApply(scope, function() {
            jndPubSub.pub(event.name, event.args);
          });
        }
      }

      /**
       * event parse
       * @param {object} event
       * @returns {{name: *, args: Array}}
       * @private
       */
      function _eventParse(event) {
        var args = [];
        var data = event.data.split('#');

        if (data[1]) {
          _.each(data, function(value, index) {
            if (index > 0) {
              args.push(value);
            }
          });
        }

        return {
          name: data[0],
          args: args
        };
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
