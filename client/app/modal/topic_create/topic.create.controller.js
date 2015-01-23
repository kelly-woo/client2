(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('createEntityModalCtrl', createEntityModalCtrl);

  function createEntityModalCtrl($scope, $rootScope, $modalInstance, entityheaderAPIservice, $state, analyticsService) {
    $scope.entityType = 'public';

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.onCreateClick = function(entityType, entityName) {

      if ($scope.isLoading) return;

      if (entityType == 'private')
        entityType = 'privateGroup';
      else
        entityType = 'channel';

      $scope.isLoading = true;

      entityheaderAPIservice.createEntity(entityType, entityName)
        .success(function(response) {
          // analytics
          var entity_type = "";
          switch (entityType) {
            case 'channel':
              entity_type = "topic";
              break;
            case 'privateGroup':
              entity_type = "private group";
              break;
            default:
              entity_type = "invalid";
              break;
          }
          analyticsService.mixpanelTrack( "Entity Create", { "type": entity_type } );

          $rootScope.$emit('updateLeftPanelCaller');
          $state.go('archives', {entityType:entityType + 's', entityId:response.id});
          $modalInstance.dismiss('cancel');
        })
        .error(function(response) {
          alert(response.msg);
        })
        .finally(function() {
          $scope.isLoading = false;
        });
    };
  }
})();