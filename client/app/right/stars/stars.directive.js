/**
 * @fileoverview stars directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rPanelStarTab', rPanelStarTab);

  function rPanelStarTab() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      templateUrl : 'app/right/stars/stars.html',
      controller: 'RightPanelStarsTabCtrl'
    };

    function link(scope, el, attrs) {
    }
  }
})();
