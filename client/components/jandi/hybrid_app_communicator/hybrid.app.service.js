/**
 * @fileoverview Service that calls functions in hybrid application
 *
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('hybridAppHelper', hybridAppHelper);
  
  /* @ngInject */
  function hybridAppHelper(pcAppHelper, macAppHelper) {
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
        _appHelper = pcAppHelper;
      } else if (isMacApp()) {
        _appHelper = macAppHelper;
      }

      _implement(_appHelper, interfas);

      delegator.isPcApp = isPcApp;
      delegator.isMacApp = isMacApp;
      delegator.isHybridApp = isHybridApp;
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
      return pcAppHelper.isPcApp();
    }

    /**
     * mac app 인지 여부
     * @returns {*}
     */
    function isMacApp() {
      return macAppHelper.isMacApp();
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
