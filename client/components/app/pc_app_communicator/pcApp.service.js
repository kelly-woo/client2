(function() {
  'use strict';

  angular
    .module('app.pcApp')
    .service('pcAppHelper', pcAppHelper);

  /* @ngInject */
  function pcAppHelper(logger) {
    this.onSignedOut = onSignedOut;
    this.onSignedIn = onSignedIn;

    function onSignedOut() {
      if (_isUndefined()) return;

      logger.log('calling onSignedOut');
      jandipc.onSignedOut();
    }

    function onSignedIn() {
      if (_isUndefined()) return;

      logger.log('calling onSignedIn');
      jandipc.onSignedIn();
    }

    function _isUndefined() {
      return typeof jandipc === 'undefined'
    }
  }

})();