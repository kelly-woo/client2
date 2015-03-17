(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('rPanelMessagesTab', rPanelMessagesTab)

  function rPanelMessagesTab() {
    return {
      restrict: 'EA',
      scope: true,
      link: link,
      templateUrl : 'app/right/messages.search/messages.search.html',
      controller: 'rPanelMessageTabCtrl'
    };

    function link(scope, element, attrs) {
    }
  }
})();