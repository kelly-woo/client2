/**
 * @fileoverview mentions directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rPanelMentionTab', rPanelMentionTab);

  function rPanelMentionTab() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      templateUrl : 'app/right/mentions/mentions.html',
      controller: 'RightPanelMentionsTabCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();
