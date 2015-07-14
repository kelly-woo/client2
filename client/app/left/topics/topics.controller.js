(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('topicsCtrl', topicsCtrl);

  function topicsCtrl($scope) {
    $scope.onTopicClicked = onTopicClicked;

    // fixme: is anyone using this function?? if not, let's get rid of it.
    function onTopicClicked(entityType, entityId) {
      console.log('me')
      if ($scope.currentEntity.id == entityId) {
        $rootScope.$broadcast('refreshCurrentTopic');
      } else {
        console.log(entityType, entityId)
        $state.go('archives', { entityType: entityType, entityId: entityId });
      }
    }
  }
})();
