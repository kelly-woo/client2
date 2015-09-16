(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topic', topic);

  function topic() {
    return {
      restrict: 'E',
      controller: 'TopicCtrl',
      templateUrl: 'app/left/topics/topic/topic.html',
      scope: {
        currentRoom: '='
      },
      link: link,
      replace: true
    };

    function link(scope, element, attrs) {
    }
  }
})();
