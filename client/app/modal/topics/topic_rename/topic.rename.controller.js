(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicRenameCtrl', TopicRenameCtrl);

  /* @ngInject */
  function TopicRenameCtrl($scope, $modalInstance, entityheaderAPIservice, $state, $filter, analyticsService, fileAPIservice, jndPubSub) {

    var duplicate_name_error = 4000;

    $scope.newTopicName = $scope.currentEntity.name;
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.onRenameClick = function(newTopicName) {

      $scope.isLoading = true;

      entityheaderAPIservice.renameEntity($state.params.entityType, $state.params.entityId, newTopicName)
        .success(function(response) {
          // TODO: REFACTOR -> ANALYTICS SERVICE
          // analytics
          var entity_type = "";
          switch ($state.params.entityType) {
            case 'channels':
              entity_type = "topic";
              break;
            case 'privategroups':
              entity_type = "private group";
              break;
            default:
              entity_type = "invalid";
              break;
          }
          analyticsService.mixpanelTrack( "Entity Name Change", { "type": entity_type } );

          jndPubSub.updateLeftPanel();
          fileAPIservice.broadcastChangeShared();
          $modalInstance.dismiss('cancel');
        })
        .error(function(response) {
          _onCreateError(response);
        })
        .finally(function() {
          $scope.isLoading = false;
        });
    };

    // TODO: error handling service 필요함
    function _onCreateError(err) {
      if (err.code === duplicate_name_error) {
        // Duplicate name error.
        alert($filter('translate')('@common-duplicate-name-err'));
      }
    }
  }
})();
