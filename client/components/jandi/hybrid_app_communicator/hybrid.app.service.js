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
      var appHelper = pcAppHelper.isHybridApp() ? pcAppHelper : macAppHelper;
      var interfas = [
        'connect',
        'onSignedOut',
        'onSignedIn',
        'onAlarmCntChanged',
        'onLanguageChanged',
        'isHybridApp'
      ];

      _implement.call(appHelper, interfas);
      _.extend(delegator, appHelper);

      // hybrid(pc, mac) app°ú connect
      delegator.connect();
    }

    /**
     * delegatorÀÇ method implements
     * @param {array} interfas
     * @private
     */
    function _implement(interfas) {
      var appHelper = this;
      var i;
      var len;

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
