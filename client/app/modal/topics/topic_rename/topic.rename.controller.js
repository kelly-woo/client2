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
                           memberService, options, UserList) {
    var duplicate_name_error = 40008;

    var _translate = $filter('translate');

    var _currentEntity = currentSessionHelper.getCurrentEntity();
    var _entityType = _currentEntity.type;
    var _entityId = _currentEntity.id;

    var _isEnableTransferConfirm = options && options.enableTransferConfirm;
    var _onChangeTopicAdminCallback = options && options.onChangeTopicAdmin;
    var _topicAdminId = options && options.topicAdminId;

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

      // 팀관리자
      $scope.isAdmin = memberService.isAdmin();

      // 토픽 관리자
      $scope.isTopicOwner = entityAPIservice.isOwner(_currentEntity, _getMemberId());

      // 토픽에서 선택가능한 유저들
      $scope.selectOptionsUsers = JndSelectBoxMember.getActiveUserListByRoomId(_entityId);
      $scope.showAdminTrans = ($scope.isAdmin || $scope.isTopicOwner) && $scope.selectOptionsUsers.length > 0;

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

      if (!form.$invalid) {
        deferred = $q.defer();
        promise = deferred.promise;

        data = _createRenameData();

        if (_isChangeTopicAdmin()) {
          if (_isEnableTransferConfirm) {
            // 토픽 정보 변경시 확인창을 출력하도록 한다

            _showAdminTransferConfirm(deferred, data);
          } else {
            _updateTopic(deferred, data);
          }
        } else if (_isChangeTopicInfo()) {
          // 토픽의 name, description, autoJoin만 변경한다(관리자 제외).

          _updateTopicInfo(deferred, data);
        }

        promise.then(function() {
          // 변경이 이상없이 완료 되었으므로 modal을 닫는다.

          $scope.cancel();
        }).finally(function() {
          // 변경 요청이 끝났을때 로딩 창을 닫는다.

          jndPubSub.hideLoading();
        });
      }
    }

    /**
     * 관리자 변경하기를 확인하는 창을 출력함.
     * @param {object} deferred
     * @param {object} data
     * @private
     */
    function _showAdminTransferConfirm(deferred, data) {
      var user = UserList.get(data.adminId);

      Dialog.confirm({
        title: _translate('@topic-admin-transfer-confirm'),
        body: user && user.name,
        onClose: function(result) {
          if (result === 'okay') {
            _updateTopic(deferred, data);
          }
        }
      });
    }

    /**
     * 토픽의 name, description, autoJoin, admin을 갱신함.
     * @param {object} deferred
     * @param {object} data
     * @private
     */
    function _updateTopic(deferred, data) {
      jndPubSub.showLoading();

      _requestTopicAdmin(deferred, data);
      if (_isChangeTopicInfo()) {
        _requestTopicRename(deferred, data);
      }
    }

    /**
     * 토픽의 name, description, autoJoin을 갱신함.
     * @param {object} deferred
     * @param {object} data
     * @private
     */
    function _updateTopicInfo(deferred, data) {
      jndPubSub.showLoading();

      _requestTopicRename(deferred, data);
    }

    /**
     * 토픽의 name, description, autJoin을 갱신하도록 요청함.
     * @param {object} deferred
     * @param {object} data
     * @returns {*}
     * @private
     */
    function _requestTopicRename(deferred, data) {
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

    /**
     * 토픽의 admin을 갱신하도록 요청함.
     * @param {object} deferred
     * @param {object} data
     * @returns {*}
     * @private
     */
    function _requestTopicAdmin(deferred, data) {
      return entityheaderAPIservice.transferTopicAdmin(_entityId, data)
        .success(function() {
          _onChangeTopicAdminCallback && _onChangeTopicAdminCallback();

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
     * member id를 전달함.
     * @returns {*|boolean|*|.params.memberId|param.memberId|d.memberId|a.y.memberId|*}
     * @private
     */
    function _getMemberId() {
      // modal open시 전달된 옵션값이 존재하지 않는다면 현재 사용자의 값을 전달한다.
      return _topicAdminId || memberService.getMemberId();
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
      return _isChangeTopicInfo() || _isChangeTopicAdmin();
    }

    /**
     * 토픽의 name, description, autoJoin이 변경되었는지 여부.
     * @returns {boolean}
     * @private
     */
    function _isChangeTopicInfo() {
      return $scope.form.topicName !== $scope.originForm.topicName ||
        $scope.form.topicDescription !== $scope.originForm.topicDescription ||
        $scope.form.isAutoJoin !== $scope.originForm.isAutoJoin;
    }

    /**
     * 토픽의 admin이 변경되었는지 여부
     * @returns {boolean}
     * @private
     */
    function _isChangeTopicAdmin() {
      return $scope.form.adminId !== $scope.originForm.adminId;
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
