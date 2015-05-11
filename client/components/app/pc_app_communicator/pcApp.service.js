(function() {
  'use strict';

  angular
    .module('pcApp')
    .service('pcAppHelper', pcAppHelper);

  /* @ngInject */
  function pcAppHelper() {
    this.onSignedOut = onSignedOut;
    this.onSignedIn = onSignedIn;

    function onSignedOut() {
      if (_isUndefined()) return;

      jandipc.onSignedOut();
    }

    function onSignedin() {
      if (_isUndefined()) return;

      jandipc.onSignedIn();
    }

    function _isUndefined() {
      return typeof jandipc === 'undefined'
    }
  }

})();