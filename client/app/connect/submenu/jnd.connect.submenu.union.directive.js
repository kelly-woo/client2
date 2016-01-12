/**
 * @fileoverview connect union directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectSubmenuUnion', jndConnectSubmenuUnion);

  /* @ngInject */
  function jndConnectSubmenuUnion() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
      },
      templateUrl : 'app/connect/submenu/jnd.connect.submenu.union.html',
      link: link
    };

    function link() {
      _init();

      /**
       * init
       * @private
       */
      function _init() {

      }
    }
  }
})();
