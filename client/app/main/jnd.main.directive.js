/**
 * @fileoverview 잔디 wrapper directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndMain', jndMain);

  function jndMain() {
    return {
      restrict: 'A',
      controller: 'JndMainCtrl',
      link: link
    };

    function link(scope, el, attrs) {
    }
  }
})();
