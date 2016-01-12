/**
 * @fileoverview simple menu directive
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('jndConnectSelectboxDefaultMenu', jndConnectSelectboxDefaultMenu);
  
  /* @ngInject */
  function jndConnectSelectboxDefaultMenu() {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      templateUrl : 'app/connect/union/common/selectbox/menu/jnd.connect.union.selectbox.default.menu.html',
      link: angular.noop
    };
  }
})();
