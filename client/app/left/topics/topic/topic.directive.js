(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topic', topic)
    .controller('topicCtrl', topicCtrl);

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

  function topicCtrl($scope, $rootScope, $state) {
    $scope.onTopicClicked = onTopicClicked;

    function onTopicClicked(entityType, entityId) {
      console.log('me')
      if ($scope.currentEntity.id == entityId) {
        $rootScope.$broadcast('refreshCurrentTopic');
      } else {
        $state.go('archives', { entityType: entityType, entityId: entityId });
      }
    }
  }
})();