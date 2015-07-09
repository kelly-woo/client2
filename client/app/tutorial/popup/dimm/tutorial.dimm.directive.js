/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialDimm', tutorialDimm);

  function tutorialDimm() {
    return {
      link: link,
      replace: true,
      templateUrl: 'app/tutorial/popup/dimm/tutorial.dimm.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
