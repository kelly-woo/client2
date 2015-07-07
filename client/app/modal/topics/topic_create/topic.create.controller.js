(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicCreateCtrl', TopicCreateCtrl);

  /* @ngInject */
  function TopicCreateCtrl($scope, $rootScope, $modalInstance, entityheaderAPIservice, $state, analyticsService, $filter, AnalyticsHelper) {
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

          //Analtics Tracker. Not Block the Process
          try {
            AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_CREATE, {
              'RESPONSE_SUCCESS': true,
              'TOPIC_ID': response.id
            });
          } catch (e) {

          }

          analyticsService.mixpanelTrack( "Entity Create", { "type": entity_type } );

          $rootScope.$emit('updateLeftPanelCaller');
          $state.go('archives', {entityType:entityType + 's', entityId:response.id});
          $modalInstance.dismiss('cancel');
        })
        .error(function(response) {
          //Analtics Tracker. Not Block the Process
          try {
            AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_CREATE, {
              'RESPONSE_SUCCESS': false,
              'ERROR_CODE': response.code
            });
          } catch (e) {
          }
          
          _onCreateError(response);
        })
        .finally(function() {
          $scope.isLoading = false;
        });
    };

    // todo: error handling service 필요함
    var duplicate_name_error = 4000;
    function _onCreateError(err) {
      if (err.code == duplicate_name_error) {
        // Duplicate name error.
        alert($filter('translate')('@common-duplicate-name-err'));
      }
    }
  }
})();