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

    $scope.form = {
      topicName: _currentEntity.name,
      topicDescription: _currentEntity.description,
      isAutoJoin: !!_currentEntity.autoJoin
    };

    var _topicName = $scope.form.topicName;
    var _topicDescription = $scope.form.topicDescription;
    var _isAutoJoin = $scope.form.isAutoJoin;

    $scope.hasAutoJoin = _hasAutoJoin();

    _init();

    function _init() {
      $scope.nameMaxLength = 60;
      $scope.descMaxLength = 300;
      //$scope.$watch('isAutoJoin', function() {
      //  console.log('autojoin changed', arguments);
      //});
      $scope.cancel = modalHelper.closeModal;

      $scope.onRenameClick = onRenameClick;
      $scope.isInvalid = isInvalid;
    }

    /**
     * 자동 초대 기능을 지원하는지 여부를 반환한다
     * @returns {boolean}
     * @private
     */
    function _hasAutoJoin() {
      return _currentEntity.type !== 'privategroups' && _currentEntity.id !==  currentSessionHelper.getDefaultTopicId();
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

        if ($scope.form.topicName !== _currentEntity.name) {
          _.extend(_body, {name: $scope.form.topicName});
        }

        if ($scope.form.topicDescription !== _currentEntity.description) {
          _.extend(_body, {description: $scope.form.topicDescription});
        }

        if ($scope.form.isAutoJoin !== _currentEntity.autoJoin) {
          _.extend(_body, {autoJoin: $scope.form.isAutoJoin});
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
      console.log($scope.form.isAutoJoin, _isAutoJoin);
      return $scope.form.topicName !== _topicName ||
        $scope.form.topicDescription !== _topicDescription ||
        $scope.form.isAutoJoin !== _isAutoJoin;
    }

    /**
     * 값이 타당하지 않은지 여부
     * @returns {boolean}
     */
    function isInvalid() {
      return !_isChanged() ||
        $scope.form.topicName.length > $scope.nameMaxLength || $scope.form.topicDescription.length > $scope.descMaxLength;
    }
  }
})();
