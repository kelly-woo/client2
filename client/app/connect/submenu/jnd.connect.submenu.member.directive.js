/**
 * @fileoverview connect member directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectSubmenuMember', jndConnectSubmenuMember);

  /* @ngInject */
  function jndConnectSubmenuMember() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
      },
      templateUrl : 'app/connect/submenu/jnd.connect.submenu.member.html',
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
