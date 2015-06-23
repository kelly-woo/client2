(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicCreateCtrl', TopicCreateCtrl);

  function TopicCreateCtrl($scope, $rootScope, $modalInstance, entityheaderAPIservice, $state, analyticsService, $filter, analyticsHelper) {
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
          var topicType;
          switch (entityType) {
            case 'channel':
              topicType = 'public';
              entity_type = "topic";
              break;
            case 'privateGroup':
              topicType = 'private';
              entity_type = "private group";
              break;
            default:
              topicType = 'invalid';
              entity_type = "invalid";
              break;
          }

          //Analtics Tracker. Not Block the Process
          var property = {};
          property[analyticsHelper.PROPERTY.RESPONSE_SUCCESS] = true;
          property[analyticsHelper.PROPERTY.TOPIC_TYPE] = topicType;
          property[analyticsHelper.PROPERTY.TOPIC_ID] = response.id;
          analyticsHelper.track(analyticsHelper.EVENT.TOPIC_CREATE, property);

          analyticsService.mixpanelTrack( "Entity Create", { "type": entity_type } );

          $rootScope.$emit('updateLeftPanelCaller');
          $state.go('archives', {entityType:entityType + 's', entityId:response.id});
          $modalInstance.dismiss('cancel');
        })
        .error(function(response) {
          //Analtics Tracker. Not Block the Process
          var property = {};
          property[analyticsHelper.PROPERTY.RESPONSE_SUCCESS] = false;
          property[analyticsHelper.PROPERTY.TOPIC_TYPE] = response.code;
          analyticsHelper.track(analyticsHelper.EVENT.TOPIC_CREATE, property);
          
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