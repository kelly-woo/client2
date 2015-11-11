/**
 * @fileoverview dialog modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandi.dialog')
    .directive('dialogModal', dialogModal);

  /* @ngInject */
  function dialogModal($timeout) {

    return {
      restrict: 'A',
      link: function(scope, el) {
        $timeout(function() {
          scope.onDialogLoad ? scope.onDialogLoad(el) : el.find('.' + scope.okayClass).focus();
        }, 10);
      }
    };
  }
}());
