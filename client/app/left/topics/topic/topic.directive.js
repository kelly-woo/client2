(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topic', topic);

  function topic() {
    return {
      restrict: 'EA',
      require: '^topics',
      scope: true,
      link: link,
      replace: true,
      templateUrl: 'app/left/topics/topic/topic.html'
    };

    function link(scope, element, attrs, ctrl) {

    }
  }
})();