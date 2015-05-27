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
  function pcAppHelper(logger) {
    this.onSignedOut = onSignedOut;
    this.onSignedIn = onSignedIn;
    this.onAlarmCntChanged = onAlarmCntChanged;

    /**
     * Call 'onSignedOut' function in pc application.
     */
    function onSignedOut() {
      if (_isPcAppUndefined()) {
        return;
      }

      jandipc.onSignedOut();
    }

    /**
     * Call 'onSignedIn' function in pc application.
     */
    function onSignedIn() {
      if (_isPcAppUndefined()) {
        return;
      }

      jandipc.onSignedIn();
    }

    /**
     * Call 'onAlarmCntChanged' function in pc application.
     * @param id {number} id of entity whose alarm count(badge count) just changed.
     * @param alarmCnt {number} number of alarms that was changed to.
     */
    function onAlarmCntChanged(id, alarmCnt) {
      if (_isPcAppUndefined()) {
        return;
      }

      jandipc.onAlarmCntChanged(id, alarmCnt);

    }
    /**
     * Return true if 'jandipc' exists as a variable.
     * 'jandipc' id first declared and defined by pc application. so 'jandipc' is defined if and only if when it's running on pc application.
     * @returns {boolean}
     * @private
     */
    function _isPcAppUndefined() {
      return typeof jandipc === 'undefined';
    }

  }

})();