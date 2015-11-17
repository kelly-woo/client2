(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicRenameCtrl', TopicRenameCtrl);

  /* @ngInject */
  function TopicRenameCtrl($scope, entityheaderAPIservice, $filter, analyticsService,
                           AnalyticsHelper, modalHelper, currentSessionHelper, jndPubSub,
                           Dialog) {
    var duplicate_name_error = 40008;

    var _currentEntity = currentSessionHelper.getCurrentEntity();

    var _entityType = _currentEntity.type;
    var _entityId = _currentEntity.id;

    var _topicName = $scope.topicName = _currentEntity.name;
    var _topicDescription = $scope.topicDescription = _currentEntity.description;
    var _isAutoJoin = $scope.isAutoJoin = _currentEntity.autoJoin;

    _init();

    function _init() {
      $scope.nameMaxLength = 60;
      $scope.descMaxLength = 300;

      $scope.cancel = modalHelper.closeModal;

      $scope.onRenameClick = onRenameClick;
      $scope.isInvalid = isInvalid;
    }

    /**
     * rename click event handler
     * @param {object} form
     */
    function onRenameClick(form) {
      var _body;
      if (!form.$invalid) {
        _body = {};
        jndPubSub.showLoading();

        if ($scope.topicName !== _currentEntity.name) {
          _.extend(_body, {name: $scope.topicName});
        }

        if ($scope.topicDescription !== _currentEntity.description) {
          _.extend(_body, {description: $scope.topicDescription});
        }

        if ($scope.isAutoJoin !== _currentEntity.autoJoin) {
          _.extend(_body, {autoJoin: $scope.isAutoJoin});
        }

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
            jndPubSub.hideLoading();
          });
      }
    }

    /**
     * rename request에 대한 error handler
     * @param {object} err
     * @private
     */
    function _onCreateError(err) {
      if (err.code === duplicate_name_error) {
        // Duplicate name error.
        Dialog.error({
          title: $filter('translate')('@common-duplicate-name-err')
        });
      }
    }

    function _isChanged() {
      return $scope.topicName !== _topicName ||
        $scope.topicDescription !== _topicDescription ||
        $scope.isAutoJoin !== _isAutoJoin;
    }

    /**
     * 값이 타당하지 않은지 여부
     * @returns {boolean}
     */
    function isInvalid() {
      return !_isChanged() ||
        $scope.topicName.length > $scope.nameMaxLength || $scope.topicDescription.length > $scope.descMaxLength;
    }
  }
})();
