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
                            publicService, jndPubSub, analyticsService, modalHelper, AnalyticsHelper, $state) {


    var _entityId = $state.params.entityId;
    var _entityType = $state.params.entityType;
    var _currentEntity = entityAPIservice.getEntityById(_entityType, _entityId);

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

    $scope.openMemberModal =  openMemberModal;
    $scope.onPrefixIconClicked = onPrefixIconClicked;


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
      $scope.$on('onCurrentEntityChanged', function(event, param) {
        if (_currentEntity !== param) {
          _initWithParam(param);
        }
      });
    }

    function _initWithParam(param) {
      if (!!param) {
        _checkCurrentEntity(param);
        _checkOwnership();
        _checkIfDefaultTopic();
      }
    }

    /**
     * currentEntity 로 부터 deactivate member 를 제거한다.
     * @param {object} currentEntity
     * @returns {object} deactive member 를 제거한 entity
     * @private
     */
    function _filterDeactivateMembers(currentEntity) {
      var members = currentEntity && currentEntity.members || [];
      var totalEntities = $rootScope.totalEntities;
      var member;
      var entity;
      var i;

      if (members && members.length) {
        for (i = 0; i < members.length; i++) {
          member = members[i];
          entity = entityAPIservice.getEntityFromListById(totalEntities, member);
          if (!entity || !entity.name) {
            members.splice(i, 1);
            i -= 1;
          }
        }
      }

      //$scope.members = members;
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
      _filterDeactivateMembers(entity);
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

      }
    }

    /**
     * Check ownership of current entity whether I'm an owner of current entity or not.
     * Set updated value to $scope.isOwner variable.
     */
    function _checkOwnership() {
      $scope.isOwner = entityAPIservice.isOwner(_currentEntity, memberService.getMemberId());
    }

    /**
     * Check whether current entity is a default topic of current team.
     * * Set updated value to $scope.isDefaultTopic variable.
     */
    function _checkIfDefaultTopic() {
      $scope.isDefaultTopic = currentSessionHelper.isDefaultTopic(_currentEntity);
    }

    /**
     * 현재 entity(topic)를 떠난다.
     */
    function leaveCurrentEntity() {
      var isLeaveChannel;
      isLeaveChannel = _entityType === 'privategroups' ? confirm($filter('translate')('@ch-menu-leave-private-confirm')) : true;

      if (isLeaveChannel) {
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

    }

    /**
     * 현재 entity(toppic)를 지운다.
     */
    function deleteCurrentEntity() {
      if (confirm($filter('translate')('@ch-menu-delete-confirm'))) {
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
     *
     * @param memberId
     */
    function openMemberModal(memberId) {
      jndPubSub.pub('onUserClick', memberId || _currentEntity);
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

  }
})();
