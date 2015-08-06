(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topics', topics);

  function topics() {
    return {
      restrict: 'EA',
      scope: false,
      controller: 'topicsCtrl',
      link: link,
      transclude: true,
      replace: true,
      templateUrl: 'app/left/topics/topics.html'
    };

    function link(scope, element, attrs) {

    }
  }
})();