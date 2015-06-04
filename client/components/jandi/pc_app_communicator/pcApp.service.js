/**
 * @fileoverview Service that calls functions in pc application through 'jandipc'
 * @author JiHoon Kim <jihoonk@tosslab.com>
 *
 */
(function() {
  'use strict';

  angular
    .module('jandi.pcApp')
    .service('pcAppHelper', pcAppHelper);

  /* @ngInject */
  function pcAppHelper() {
    this.onSignedOut = onSignedOut;
    this.onSignedIn = onSignedIn;
    this.onAlarmCntChanged = onAlarmCntChanged;

    /**
     * Call 'onSignedOut' function in pc application.
     */
    function onSignedOut() {
      if (_isPcApp()) {
        jandipc.onSignedOut();
      }
    }

    /**
     * Call 'onSignedIn' function in pc application.
     */
    function onSignedIn() {
      if (_isPcApp()) {
        jandipc.onSignedIn();
      }
    }

    /**
     * Call 'onAlarmCntChanged' function in pc application.
     * @param {number} id id of entity whose alarm count(badge count) just changed.
     * @param {number} alarmCnt number of alarms that was changed to.
     */
    function onAlarmCntChanged(id, alarmCnt) {
      if (_isPcApp()) {
        jandipc.onAlarmCntChanged(id, alarmCnt);

      }
    }
    /**
     * Return true if 'jandipc' exists as a variable.
     * 'jandipc' id first declared and defined by pc application. so 'jandipc' is defined if and only if when it's running on pc application.
     * @returns {boolean}
     * @private
     */
    function _isPcApp() {
      return typeof jandipc !== 'undefined';
    }

  }

})();