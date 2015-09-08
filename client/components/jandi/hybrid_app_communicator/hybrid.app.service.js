/**
 * @fileoverview Service that calls functions in hybrid application
 *
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('HybridAppHelper', HybridAppHelper);
  
  /* @ngInject */
  function HybridAppHelper(PcAppHelper, MacAppHelper) {
    var delegator = this;
    var _appHelper;

    _init();

    function _init() {
      var interfas = [
        'trigger',
        'onSignedOut',
        'onSignedIn',
        'onAlarmCntChanged',
        'onLanguageChanged'
      ];

      if (isPcApp()) {
        _appHelper = PcAppHelper;
      } else if (isMacApp()) {
        _appHelper = MacAppHelper;
      }

      _implement(_appHelper, interfas);

      delegator.isPcApp = isPcApp;
      delegator.isMacApp = isMacApp;
      delegator.isHybridApp = isHybridApp;
    }

    /**
     * delegator의 method implements
     * @param {object} appHelper - PcAppHelper 또는 MacAppHelper
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
            return appHelper[key] && appHelper[key].apply(appHelper, arguments);
          };
        }(interfas[i]));
      }
    }

    /**
     * pc app 인지 여부
     * @returns {*}
     */
    function isPcApp() {
      return PcAppHelper.isPcApp();
    }

    /**
     * mac app 인지 여부
     * @returns {*}
     */
    function isMacApp() {
      return MacAppHelper.isMacApp();
    }

    /**
     * hybrid app 인지 여부
     * @returns {boolean}
     */
    function isHybridApp() {
      return !!_appHelper;
    }
  }
})();
