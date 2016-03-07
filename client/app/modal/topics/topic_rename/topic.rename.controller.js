/**
 * @fileoverview topic rename controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicRenameCtrl', TopicRenameCtrl);

  /* @ngInject */
  function TopicRenameCtrl($scope, $q, $filter, entityheaderAPIservice, analyticsService, AnalyticsHelper, modalHelper,
                           currentSessionHelper, jndPubSub, Dialog, entityAPIservice, JndSelectBoxMember,
                           memberService) {
    var duplicate_name_error = 40008;

    var _translate = $filter('translate');

    var _currentEntity = currentSessionHelper.getCurrentEntity();
    var _entityType = _currentEntity.type;
    var _entityId = _currentEntity.id;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.nameMaxLength = 60;
      $scope.descMaxLength = 300;
      $scope.isInvalid = isInvalid;
      $scope.onRenameClick = onRenameClick;
      $scope.cancel = modalHelper.closeModal;

      $scope.allowAutoJoin = _allowAutoJoin();

      $scope.isTopicOwner = entityAPIservice.isOwner(_currentEntity, memberService.getMemberId());
      $scope.selectOptionsUsers = JndSelectBoxMember.getActiveUserListByRoomId(_entityId);
      $scope.showAdminTrans = $scope.isTopicOwner && $scope.selectOptionsUsers.length > 0;

      $scope.form = {
        topicName: _currentEntity.name,
        topicDescription: _currentEntity.description,
        adminId: entityAPIservice.getOwnerId(_currentEntity),
        isAutoJoin: !!_currentEntity.autoJoin
      };
      $scope.originForm = _.extend({}, $scope.form);


    }

    /**
     * 값이 타당하지 않은지 여부
     * @returns {boolean}
     */
    function isInvalid() {
      return !_isChanged() ||
        $scope.form.topicName.length > $scope.nameMaxLength || $scope.form.topicDescription.length > $scope.descMaxLength;
    }

    /**
     * rename click event handler
     * @param {object} form
     */
    function onRenameClick(form) {
      var deferred;
      var promise;
      var data;
      var user;

      if (!form.$invalid) {
        deferred = $q.defer();
        promise = deferred.promise;

        data = _createRenameData();

        if (data.adminId != null) {
          user = entityAPIservice.getEntityById('users', data.adminId);
          Dialog.confirm({
            title: _translate('@topic-admin-transfer-confirm'),
            body: user && user.name,
            onClose: function(result) {
              if (result === 'okay') {
                jndPubSub.showLoading();
                _requestEntityAdmin(deferred, data);

                if (_hasChangeTopicInfo(data)) {
                  _requestEntityInfo(deferred, data);
                }
              }
            }
          });
        } else if (_hasChangeTopicInfo(data)) {
          jndPubSub.showLoading();
          _requestEntityInfo(deferred, data);
        }

        promise.then(function() {
          $scope.cancel();
        }).finally(function() {
          jndPubSub.hideLoading();
        });
      }
    }

    function _hasChangeTopicInfo(data) {
      return data.name != null || data.description != null || data.autoJoin != null;
    }

    function _requestEntityInfo(deferred, data) {
      return entityheaderAPIservice.renameEntity(_entityType, _entityId, data)
        .success(function() {
          _successAnalytics();

          deferred.resolve();
        })
        .error(function(error) {
          _errorAnalytics();
          _onCreateError(error);

          deferred.reject();
        });
    }

    function _requestEntityAdmin(deferred, data) {
      return entityheaderAPIservice.transferTopicAdmin(_entityId, data)
        .success(function() {
          Dialog.success({title: _translate('@topic-admin-transfer-toast')});
          deferred.resolve();
        })
        .error(function() {
          deferred.reject();
        });
    }

    /**
     * 자동 초대 기능을 지원하는지 여부를 반환한다
     * @returns {boolean}
     * @private
     */
    function _allowAutoJoin() {
      return _currentEntity.type !== 'privategroups' && _currentEntity.id !== currentSessionHelper.getDefaultTopicId();
    }

    /**
     * 변경된 topic data를 생성함.
     * @returns {{}}
     * @private
     */
    function _createRenameData() {
      var data = {};

      if ($scope.form.topicName !== $scope.originForm.topicName) {
        data.name = $scope.form.topicName;
      }

      if ($scope.form.topicDescription !== $scope.originForm.topicDescription) {
        data.description = $scope.form.topicDescription;
      }

      if ($scope.form.isAutoJoin !== $scope.originForm.isAutoJoin) {
        data.autoJoin = $scope.form.isAutoJoin;
      }

      if ($scope.form.adminId !== $scope.originForm.adminId) {
        data.adminId = $scope.form.adminId;
      }

      return data;
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

    /**
     * 값 변경여부.
     * @returns {boolean}
     * @private
     */
    function _isChanged() {
      return $scope.form.topicName !== $scope.originForm.topicName ||
        $scope.form.topicDescription !== $scope.originForm.topicDescription ||
        $scope.form.adminId !== $scope.originForm.adminId ||
        $scope.form.isAutoJoin !== $scope.originForm.isAutoJoin;
    }

    /**
     * sucess analytics
     * @private
     */
    function _successAnalytics() {
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
    }

    /**
     * error analytics
     * @private
     */
    function _errorAnalytics() {
      try {
        //Analtics Tracker. Not Block the Process
        AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_NAME_CHANGE, {
          'RESPONSE_SUCCESS': false,
          'ERROR_CODE': response.code
        });
      } catch (e) {
      }
    }
  }
})();
