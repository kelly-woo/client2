(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('teamMemberListTemplateCtrl', teamMemberListTemplateCtrl);


  function teamMemberListTemplateCtrl($scope, $rootScope, $state, jndPubSub) {
    $scope.onMemberClick = onMemberClick;
    $scope.onStarClick = onStarClick;

    function onMemberClick(entityId) {
      $state.go('archives', { entityType: 'users',  entityId: entityId });
      $scope.cancel();
    }

    function onStarClick(entityType, entityId) {
      var param = {
        entityType: entityType,
        entityId: entityId
      };

      jndPubSub.pub('onStarClick', param);
    }


  }
})();