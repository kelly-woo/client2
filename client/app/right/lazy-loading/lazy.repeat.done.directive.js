/**
 * @fileoverview lazy loading directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('lazyRepeatDone', lazyRepeatDone);

  function lazyRepeatDone() {
    return {
      restrict: 'AC',
      require: '?^lazyLoading',
      link: link
    };

    function link(scope, el, attrs, ctrl) {
      console.log('lazy repeat done ::: ', ctrl);
    }
  }
})();
