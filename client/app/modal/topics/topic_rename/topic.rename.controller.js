(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicRenameCtrl', TopicRenameCtrl);

  /* @ngInject */
  function TopicRenameCtrl($scope, entityheaderAPIservice, $filter, analyticsService,
                           AnalyticsHelper, modalHelper, currentSessionHelper) {
    var duplicate_name_error = 4000;

    var _currentEntity = currentSessionHelper.getCurrentEntity();

    var _entityType = _currentEntity.type;
    var _entityId = _currentEntity.id;

    var _topicName = $scope.topicName = _currentEntity.name;
    var _topicDescription = $scope.topicDescription = _currentEntity.description;

    $scope.cancel = modalHelper.closeModal;

    $scope.onRenameClick = onRenameClick;
    $scope.hasValueChanged = hasValueChanged;

    function onRenameClick(form) {
      var _body;
      if (!form.$invalid) {
        $scope.isLoading = true;

        _body = {
          name: $scope.topicName,
          description: !!$scope.topicDescription ? $scope.topicDescription : 'no description'
        };

        entityheaderAPIservice.renameEntity(_entityType, _entityId, _body)
          .success(function(response) {
            var entity_type = "";
            // TODO: REFACTOR -> ANALYTICS SERVICE
            // analytics
            switch (_entityType) {
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
            try {
              //Analtics Tracker. Not Block the Process
              AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_NAME_CHANGE, {
                'RESPONSE_SUCCESS': true,
                'TOPIC_ID': parseInt(_entityId, 10)
              });
            } catch (e) {
            }
            analyticsService.mixpanelTrack( "Entity Name Change", { "type": entity_type } );

            $scope.cancel();
          })
          .error(function(response) {
            try {
              //Analtics Tracker. Not Block the Process
              AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_NAME_CHANGE, {
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
      }
    }

    // TODO: error handling service 필요함
    function _onCreateError(err) {
      if (err.code === duplicate_name_error) {
        // Duplicate name error.
        alert($filter('translate')('@common-duplicate-name-err'));
      }
    }

    /**
     * 값이 변화했는지 안했는지 체크한다.
     * @param {string} field - 체크하고 싶은 값의 field 이름
     * @returns {boolean}
     */
    function hasValueChanged(field) {
      if (field === 'name') {
        return $scope.topicName === _topicName;
      } else if (field === 'description') {
        return $scope.topicDescription === _topicDescription;
      }
    }
  }
})();
