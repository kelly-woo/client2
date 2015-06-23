(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicRenameCtrl', TopicRenameCtrl);

  /* @ngInject */
  function TopicRenameCtrl($scope, $rootScope, $modalInstance, entityheaderAPIservice, $state, $filter, analyticsService, fileAPIservice, entityAPIservice, jndPubSub, analyticsHelper) {
    var duplicate_name_error = 4000;

    $scope.newTopicName = $scope.currentEntity.name;
    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.onRenameClick = function(newTopicName) {

      $scope.isLoading = true;

      entityheaderAPIservice.renameEntity($state.params.entityType, $state.params.entityId, newTopicName)
        .success(function(response) {
          var entity;

          // TODO: REFACTOR -> ANALYTICS SERVICE
          // analytics
          var entity_type = "";
          var topicType;
          switch ($state.params.entityType) {
            case 'channels':
              topicType = 'public';
              entity_type = "topic";
              break;
            case 'privategroups':
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
          property[analyticsHelper.PROPERTY.TOPIC_ID] = parseInt($state.params.entityId, 10);
          analyticsHelper.track(analyticsHelper.EVENT.TOPIC_NAME_CHANGE, property);
          analyticsService.mixpanelTrack( "Entity Name Change", { "type": entity_type } );

          // topic name이 변경된 사항을 바로 반영한뒤 boroadcast 하기위해 topic entity를 찾아 바로 수정함
          // 그렇지 않으면 modal에서 topic name을 변경하여도 반영되지 않아 반영되지 않은 값을 갱신할 수 있음
          if (entity = entityAPIservice.getEntityFromListById($rootScope.totalEntities, $state.params.entityId)) {
            entity.name = newTopicName;
          }

          // 변경된 topic 명을 topic 명이 출력되는 곳 모두 수정되도록 boardcast 함.
          jndPubSub.updateLeftPanel();
          fileAPIservice.broadcastChangeShared();

          $modalInstance.dismiss('cancel');
        })
        .error(function(response) {

          //Analtics Tracker. Not Block the Process
          var property = {};
          property[analyticsHelper.PROPERTY.RESPONSE_SUCCESS] = false;
          property[analyticsHelper.PROPERTY.ERROR_CODE] = response.code;
          analyticsHelper.track(analyticsHelper.EVENT.TOPIC_NAME_CHANGE, property);


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
