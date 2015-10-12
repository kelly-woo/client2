/**
 * @fileoverview quick launcher modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('quickLauncherModal', quickLauncherModal);

  function quickLauncherModal() {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _on();
      }

      /**
       * on listeners
       * @private
       */
      function _on() {

      }
    }
  }
})();
