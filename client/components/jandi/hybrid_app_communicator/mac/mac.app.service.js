/**
 * @fileoverview Service that calls functions in pc application through 'jandipc'
 * @author JiHoon Kim <jihoonk@tosslab.com>
 *
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('macAppHelper', pcAppHelper);
  
  /* @ngInject */
  function pcAppHelper() {
    this.init = init;

    function init() {
      _connectWebViewJavascriptBridge(function(bridge) {
        bridge.init(function(message, responseCallback) {
          alert('received message ::: ' + message);

          responseCallback && responseCallback();
        });
      });
    }

    function _connectWebViewJavascriptBridge() {
      if (window.WebViewJavascriptBridge) {
        callback(WebViewJavascriptBridge);
      } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function() {
          callback(WebViewJavascriptBridge);
        }, false);
      }
    }
  }
})();
