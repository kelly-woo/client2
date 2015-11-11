/**
 * @fileoverview 잔디 wrapper directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndWrapper', jndWrapper);

  function jndWrapper() {
    return {
      restrict: 'A',
      controller: 'JndWrapperCtrl',
      link: link
    };

    function link(scope, el, attrs) {
    }
  }
})();
