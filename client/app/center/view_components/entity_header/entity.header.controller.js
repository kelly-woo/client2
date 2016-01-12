/**
 * @fileoverview center panel의 header를 관리하는 controller
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('entityHeaderCtrl', entityHeaderCtrl);

  /* @ngInject */
  function entityHeaderCtrl($scope, $filter, $rootScope, entityHeader, entityAPIservice, memberService, currentSessionHelper,
                            publicService, jndPubSub, analyticsService, modalHelper, AnalyticsHelper, $state, TopicMessageCache,
                            Dialog, JndUtil, EntityMapManager) {

    //console.info('[enter] entityHeaderCtrl', currentSessionHelper.getCurrentEntity());
    var _entityId = $state.params.entityId;
    var _entityType = $state.params.entityType;
    var _currentEntity = currentSessionHelper.getCurrentEntity();

    $scope._currentEntity = _currentEntity;
    
    $scope.isConnected = true;
    $scope.isUserType;

    $scope.onEntityTitleClicked = onEntityTitleClicked;

    $scope.openInviteModal = modalHelper.openTopicInviteModal;
    $scope.openRenameModal = modalHelper.openTopicRenameModal;
    $scope.inviteUserToChannel = modalHelper.openTopicInviteFromDmModal;

    $scope.onLeaveClicked = leaveCurrentEntity;
    $scope.onDeleteClicked = deleteCurrentEntity;
    $scope.onCurrentChatLeave = leaveCurrentChat;

    $scope.onFileListClick = onFileListClick;
    $scope.kickOut = kickOut;
    $scope.openMemberModal =  openMemberModal;
    $scope.onPrefixIconClicked = onPrefixIconClicked;

    $scope.onTopicNotificationBellClicked = onTopicNotificationBellClicked;


    _init();

    /**
     * 초기화 함수.
     * @private
     */
    function _init() {
      _initWithParam(_currentEntity);
      _attachEventListeners();
    }

    /**
     * 현재 $scope에 event listener를 단다.
     * @private
     */
    function _attachEventListeners() {
      $scope.$on('connected', _onConnected);
      $scope.$on('disconnected', _onDisconnected);
      $scope.$on('onTopicDeleted', _onTopicDeleted);
      $scope.$on('onTopicLeft', _onTopicLeft);
      $scope.$on('onBeforeEntityChange', changeEntityHeaderTitle);

      $scope.$on('onCurrentEntityChanged', function(event, param) {
        if (_currentEntity !== param) {
          _initWithParam(param);
        }
      });

      $scope.$on('onTopicSubscriptionChanged', function(event, data) {
        if (data.data.roomId === parseInt(_entityId, 10)) {
          _checkNotificationStatus();
        }
      });
    }

    function _initWithParam(param) {
      if (!!param) {
        _checkCurrentEntity(param);
        _checkDisabledMember();

        _checkOwnership();
        _checkIfDefaultTopic();
        _checkNotificationStatus();

        _updateConnectInfo();
      }
    }

    /**
     * Check parameter and update local variable 'currentEntity'.
     * @param param
     * @private
     */
    function _checkCurrentEntity(param) {
      var entity;
      if (publicService.isNullOrUndefined(param)) {
        entity = $scope.currentEntity;
      } else {
        entity = param;
      }

      _setCurrentEntity(entity);
    }

    /**
     * parameter로 들어온 엔티티를 현재 엔티티로 지정한다.
     * @param {object} entity - current entity
     * @private
     */
    function _setCurrentEntity(entity) {
      if (!!entity) {
        entity.members = entityAPIservice.getMemberList(entity);

        _currentEntity = entity;
        _entityId = entity.id;
        _entityType = entity.type;

        $scope.currentEntity = entity;
        $scope.isUserType = _currentEntity.type === 'users';
        $scope.users = entityAPIservice.getUserList(entity);
      }
    }

    /**
     * 사용자를 kickout 한다.
     * @param {number} userId
     */
    function kickOut(userId) {
      Dialog.confirm({
        body: $filter('translate')('@confirm-kickout'),
        onClose: function(result) {
          if (result === 'okay') {
            entityHeader.kickOut(_entityId ,userId)
              .error(_onKickOutFailed);
          }
        }
      });
    }

    /**
     * 강퇴 실패시 이벤트 핸들러
     * @param {object} response
     * @private
     */
    function _onKickOutFailed(response) {
      JndUtil.alertUnknownError(response);
    }

    /**
     * Check ownership of current entity whether I'm an owner of current entity or not.
     * Set updated value to $scope.isOwner variable.
     */
    function _checkOwnership() {
      $scope.myId = memberService.getMemberId();
      $scope.isOwner = entityAPIservice.isOwner(_currentEntity, memberService.getMemberId());
      $scope.isAdmin = memberService.isAdmin();
      $scope.hasAuth = $scope.isOwner || $scope.isAdmin;
      $scope.hasKickoutAuth = !currentSessionHelper.isDefaultTopic(_currentEntity) && $scope.hasAuth;
    }

    /**
     * Check whether current entity is a default topic of current team.
     * * Set updated value to $scope.isDefaultTopic variable.
     */
    function _checkIfDefaultTopic() {
      $scope.isDefaultTopic = currentSessionHelper.isDefaultTopic(_currentEntity);
    }

    /**
     * 현재 entity 가 disabled된 상태인지 아닌지 확인한다.
     * @private
     */
    function _checkDisabledMember() {
      if (publicService.isDisabledMember(_currentEntity)) {
        $scope.isDisabledEntity = true;
      } else {
        $scope.isDisabledEntity = false;
      }
    }

    /**
     * 현재 토픽의 notification setting을 체크한다.
     * @private
     */
    function _checkNotificationStatus() {
      $scope.isTopicNotificationOn = memberService.isTopicNotificationOn(_entityId);

      if ($scope.isTopicNotificationOn) {
        $scope.topicNotificationBellTooltipMsg = $filter('translate')('@turn-off-topic-alarm');
      } else {
        $scope.topicNotificationBellTooltipMsg = $filter('translate')('@turn-on-topic-alarm');
      }
    }

    /**
     * 현재 entity(topic)를 떠난다.
     */
    function leaveCurrentEntity() {
      if (_entityType === 'privategroups') {
        Dialog.confirm({
          body: $filter('translate')('@ch-menu-leave-private-confirm'),
          onClose: function(result) {
            result === 'okay' && _leaveCurrentEntity();
          }
        });
      } else {
        _leaveCurrentEntity();
      }
    }

    /**
     * 현재 entity(topic)을 떠나는 api를 호출한다.
     * @private
     */
    function _leaveCurrentEntity() {
      entityHeader.leaveEntity(_entityType, _entityId)
        .success(function(response) {
          // analytics
          var entity_type = analyticsService.getEntityType(_entityType);

          try {
            AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_LEAVE, {
              'RESPONSE_SUCCESS': true,
              'TOPIC_ID': parseInt(_entityId, 10)
            });
          } catch (e) {
          }
          analyticsService.mixpanelTrack("Entity Leave", {'type': entity_type} );

          TopicMessageCache.remove(_entityId);
          publicService.goToDefaultTopic();
        })
        .error(function(error) {
          try {
            AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_LEAVE, {
              'RESPONSE_SUCCESS': true,
              'ERROR_CODE': error.code
            });
          } catch (e) {
          }
          alert(error.msg);
        })
    }

    /**
     * 현재 entity(toppic)를 지운다.
     */
    function deleteCurrentEntity() {
      Dialog.confirm({
        body: $filter('translate')('@ch-menu-delete-confirm'),
        onClose: function(result) {
          if (result === 'okay') {
            entityHeader.deleteEntity(_entityType, _entityId)
              .success(function() {
                var entity_type = analyticsService.getEntityType(_entityType);
                // analytics
                try {
                  AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_DELETE, {
                    'RESPONSE_SUCCESS': true,
                    'TOPIC_ID': parseInt(_entityId, 10)
                  });
                } catch (e) {
                }

                analyticsService.mixpanelTrack("Entity Delete", {'type': entity_type});
    
                TopicMessageCache.remove(_entityId);
    
                // topic 삭제시 file upload 중이라면 전부 취소하는 event를 broadcast함
                jndPubSub.pub('onFileUploadAllClear');
    
                publicService.goToDefaultTopic();
              })
              .error(function(error) {
                // analytics
                try {
                  AnalyticsHelper.track(AnalyticsHelper.EVENT.TOPIC_DELETE, {
                    'RESPONSE_SUCCESS': false,
                    'ERROR_CODE': error.code
                  });
                } catch (e) {
                }

                alert(error.msg);
              });
          }
        }
      });
    }

    /**
     * 현재 1:1 창을 나간다.
     */
    function leaveCurrentChat() {
      jndPubSub.pub('leaveCurrentChat', _entityId);
    }

    /**
     * 1:1 DM 경우에서 상대방의 파일리스트 보기를 눌렀을 경우.
     * @param memberId
     */
    function onFileListClick(memberId) {
      jndPubSub.pub('showUserFileList', memberId);
    }
    /**
     * title 이 클릭되어졌을 경우에 호출된다.
     */
    function onEntityTitleClicked() {
      if (_currentEntity.type === 'users') {
        openMemberModal();
      }
    }

    /**
     * 엔티티 타입 아이콘 (타이틀 왼쪽에 위치한 아이콘)이 클릭되어졌을 때 호출된다.
     */
    function onPrefixIconClicked() {
      if (_entityType === 'users') {
        openMemberModal();
      }
    }

    /**
     * 토픽별 노티피케이션 설정 아이콘을 클릭했을 때 호출된다.
     */
    function onTopicNotificationBellClicked() {
      entityHeader.toggleTopicNotification(_entityId, !$scope.isTopicNotificationOn);
    }

    /**
     *
     * @param memberId
     */
    function openMemberModal(memberId) {
      jndPubSub.pub('onMemberClick', memberId || _currentEntity);
    }

    // TODO: PLEASE REFACTOR THIS 'onStarClick' method.
    // TODO: THERE ARE MANY DIFFERENT PLACES USING DUPLICATED LINES OF CODES.
    $scope.onStarClick = function() {
      var param = {
        entityType: _entityType,
        entityId: _entityId
      };

      jndPubSub.pub('onStarClick', param);
    };

    /**
     * network connect 가 publish 되었을 때
     * @private
     */
    function _onConnected() {
      $scope.isConnected = true;
    }

    /**
     * network disconnect 가 publish 되었을 때
     * @private
     */
    function _onDisconnected() {
      $scope.isConnected = false;
    }

    /**
     * left에서 토픽이 클릭되었을 때 우선적으로 header의 title을 바꾸세요! 라고 말해준다.
     * 그 이벤트를 듣고있다가 바꾼다.
     * @param event
     * @param param
     */
    function changeEntityHeaderTitle(event, param) {
      $scope.currentEntity = _currentEntity = param;
      _initWithParam(param);
    }

    /**
     * 현재 보고있는 토픽이 지워졌을 경우.
     * @param event
     * @param data
     * @private
     */
    function _onTopicDeleted(event, data) {
      if (data.topic.id === _entityId) {
        TopicMessageCache.remove(_entityId);
        publicService.goToDefaultTopic();
      }
    }

    /**
     * 현재 보고 있는 토픽을 나갔을 경우.
     * @param event
     * @param data
     * @private
     */
    function _onTopicLeft(event, data) {
      _onTopicDeleted(event, data);
    }

    /**
     * update connect info
     * @private
     */
    function _updateConnectInfo() {
      $scope.connectInfo = {};
      entityHeader.getConnectInfo(_entityId)
        .success(function(data) {
          $scope.connectInfo = data;
        });
    }
  }
})();
