(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topics', topics);

  function topics() {
    return {
      restrict: 'EA',
      scope: true,
      controller: 'topicsCtrl',
      link: link,
      transclude: true,
      replace: true,
      template: '<div class="lpanel-list__topics">' +
                  '<ul id="topics-list" collapse="leftListCollapseStatus.isTopicsCollapsed">' +
                    '<div ng-transclude></div>' +
                  '</ul>' +
                '</div>'
    };

    function link(scope, element, attrs) {

    }
  }
})();