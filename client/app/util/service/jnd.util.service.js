/**
 * @fileoverview 유틸리티 서비스 모음
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndUtil', JndUtil);

  function JndUtil() {
    this.safeApply = safeApply;

    function safeApply(scope, fn) {
      if (scope) {
        fn = _.isFunction(fn) ? fn : function () {
        };
        if (scope.$$phase !== '$apply' && scope.$$phase !== '$digest') {
          scope.$apply(fn);
        } else {
          fn();
        }
      }
    }
  }
})();
