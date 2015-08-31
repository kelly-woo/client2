/**
 * @fileoverview Service that calls functions in mac application through 'jandimac'
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('macAppHelper', macAppHelper);
  
  /* @ngInject */
  function macAppHelper() {
    var that = this;

    that.connect = connect;
    that.isHybridApp = isHybridApp;

    /**
     * WebViewJavascriptBridge connect
     *
     * WebViewJavascriptBridge¶õ?
     * An iOS/OSX bridge for sending messages between Obj-C and JavaScript in UIWebViews/WebViews.
     * Âü°í: https://github.com/marcuswestin/WebViewJavascriptBridge
     */
    function connect() {
      _connectWebViewJavascriptBridge(function(bridge) {
        bridge.init(function(message, responseCallback) {
          alert('received message ::: ' + message);

          responseCallback && responseCallback();
        });
      });
    }

    /**
     * WebViewJavascriptBridge ready
     * @private
     */
    function _connectWebViewJavascriptBridge() {
      if (window.WebViewJavascriptBridge) {
        callback(WebViewJavascriptBridge);
      } else {
        document.addEventListener('WebViewJavascriptBridgeReady', function() {
          callback(WebViewJavascriptBridge);
        }, false);
      }
    }

    /**
     * Return true if 'jandimac' exists as a variable.
     * 'jandimac' id first declared and defined by mac application. so 'jandimac' is defined if and only if when it's running on mac application.
     * @returns {boolean}
     * @private
     */
    function isHybridApp() {
      return typeof window.jandimac != null;
    }
  }
})();
