(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('topicsCtrl', topicsCtrl);

  function topicsCtrl($scope) {
    $scope.onTopicClicked = onTopicClicked;

    function onTopicClicked(entityType, entityId) {
      if ($scope.currentEntity.id == entityId) {
        $rootScope.$broadcast('refreshCurrentTopic');
      } else {
        $state.go('archives', { entityType: entityType, entityId: entityId });
      }
    }
  }
})();
