/**
 * @fileoverview Service that calls functions in pc application through 'jandipc'
 * @author JiHoon Kim <jihoonk@tosslab.com>
 *
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('hybridAppHelper', hybridAppHelper);
  
  /* @ngInject */
  function hybridAppHelper(macAppHelper, pcAppHelper) {
    var delegator = this;

    _init();

    function _init() {
      if (window.jandimac) {
        window.jandimac.triggerNotification("heelo");
      } else {
        alert('saldkfjlsakdjf');
      }

      var appHelper;
      var interfas = [
        'connect',
        'onSignedOut',
        'onSignedIn',
        'onAlarmCntChanged',
        'onLanguageChanged',
        'isHybridApp'
      ];

      if (window.jandipc != null) {
        appHelper = pcAppHelper;
      } else if (window.jandimac != null) {
        appHelper = macAppHelper;
      }

      _implement(appHelper, interfas);

      // hybrid(pc, mac) app과 connect
      delegator.connect();
    }

    /**
     * delegator의 method implements
     * @param {object} appHelper - pcAppHelper 또는 macAppHelper
     * @param {array} interfas
     * @private
     */
    function _implement(appHelper, interfas) {
      var i;
      var len;

      appHelper = appHelper || {};
      for(i = 0, len = interfas.length; i < len; i++) {
        delegator[interfas[i]] = (function(key) {
          return function() {
            appHelper[key] && appHelper[key].apply(appHelper, arguments);
          };
        }(interfas[i]));
      }
    }
  }
})();
