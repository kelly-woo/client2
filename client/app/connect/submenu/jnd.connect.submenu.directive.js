/**
 * @fileoverview connect submenu directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectSubmenu', jndConnectSubmenu);

  /* @ngInject */
  function jndConnectSubmenu() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
      },
      templateUrl : 'app/connect/submenu/jnd.connect.submenu.html',
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
