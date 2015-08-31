/**
 * @fileoverview Service that calls functions in pc application through 'jandipc'
 * @author JiHoon Kim <jihoonk@tosslab.com>
 *
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('pcAppHelper', pcAppHelper);
  
  /* @ngInject */
  function pcAppHelper() {
    var that = this;

    that.onSignedOut = onSignedOut;
    that.onSignedIn = onSignedIn;
    that.onAlarmCntChanged = onAlarmCntChanged;
    that.onLanguageChanged = onLanguageChanged;
    that.isHybridApp = isHybridApp;

    /**
     * Call 'onSignedOut' function in pc application.
     */
    function onSignedOut() {
      if (isHybridApp()) {
        jandipc.onSignedOut();
      }
    }
    
    /**
     * Call 'onSignedIn' function in pc application.
     */
    function onSignedIn() {
      if (isHybridApp()) {
        jandipc.onSignedIn();
      }
    }
    
    /**
     * Call 'onAlarmCntChanged' function in pc application.
     * @param {number} id id of entity whose alarm count(badge count) just changed.
     * @param {number} alarmCnt number of alarms that was changed to.
     */
    function onAlarmCntChanged(id, alarmCnt) {
      if (isHybridApp()) {
        jandipc.onAlarmCntChanged(id, alarmCnt);
      }
    }
    
    /**
     * Call 'onLangguageChanged' function in pc application.
     * @param {string} lang - 현재 설정된 language
     */
    function onLanguageChanged(lang) {
      if (isHybridApp()) {
        jandipc.onLanguageChanged(lang);
      }
    }
    
    /**
     * Return true if 'jandipc' exists as a variable.
     * 'jandipc' id first declared and defined by pc application. so 'jandipc' is defined if and only if when it's running on pc application.
     * @returns {boolean}
     * @private
     */
    function isHybridApp() {
      return typeof jandipc !== 'undefined';
    }
  }
})();
