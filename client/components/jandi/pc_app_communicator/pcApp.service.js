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

    function onSignedOut() {
      if (_isUndefined()) return;

      logger.log('callddding onSignedOut');
      jandipc.onSignedOut();
    }

    function onSignedIn() {
      if (_isUndefined()) return;

      logger.log('calling onSignedIn');
      jandipc.onSignedIn();
    }

    function onAlarmCntChanged(id, alarmCnt) {
      if (_isUndefined()) return;

      jandipc.onAlarmCntChanged(id, alarmCnt);

    }

    function _isUndefined() {
      return typeof jandipc === 'undefined'
    }

  }

})();