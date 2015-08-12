/**
 * @fileoverview messages directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rPanelMessagesTab', rPanelMessagesTab);

  function rPanelMessagesTab() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      templateUrl : 'app/right/search.messages/search.messages.html',
      controller: 'rPanelMessageTabCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();