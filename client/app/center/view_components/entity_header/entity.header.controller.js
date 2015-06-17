(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('entityHeaderCtrl', entityHeaderCtrl);

  /* @ngInject */
  function entityHeaderCtrl($scope, $filter, $rootScope, entityHeader, entityAPIservice, memberService, currentSessionHelper,
                            publicService, jndPubSub, fileAPIservice, analyticsService, modalHelper) {

    var currentEntity;
    var entityId;
    var entityType;

    $scope.isConnected = true;

    (function() {
      _init();
    })();

    $scope.$on('connected', _onConnected);
    $scope.$on('disconnected', _onDisconnected);
    $scope.$on('onCurrentEntityChanged', function(event, param) {
      _initWithParam(param);
    });

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

    function _init() {
      _initWithParam($scope.currentEntity);
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
      var members = currentEntity.ch_members || currentEntity.pg_members;
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
      return currentEntity;
    }

    /**
     * Check parameter and update local variable 'currentEntity'.
     *
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
      entity = _filterDeactivateMembers(entity);
      _setCurrentEntity(entity);
    }

    function _setCurrentEntity(entity) {
      if (!!entity) {
        currentEntity = entity;
        entityId = entity.id;
        entityType = entity.type;
        $scope.currentEntity = entity;
      }
    }
    /**
     * Check ownership of current entity whether I'm an owner of current entity or not.
     * Set updated value to $scope.isOwner variable.
     */
    function _checkOwnership() {
      $scope.isOwner = entityAPIservice.isOwner(currentEntity, memberService.getMemberId());
    }

    /**
     * Check whether current entity is a default topic of current team.
     * * Set updated value to $scope.isDefaultTopic variable.
     */
    function _checkIfDefaultTopic() {
      $scope.isDefaultTopic = currentSessionHelper.isDefaultTopic(currentEntity);
    }


    $scope.onLeaveClick = function() {
      var isLeaveChannel;

      isLeaveChannel = entityType === 'privategroups' ? confirm($filter('translate')('@ch-menu-leave-private-confirm')) : true;

      if (isLeaveChannel) {
        entityHeader.leaveEntity(entityType, entityId)
          .success(function(response) {
            // analytics
            var entity_type = analyticsService.getEntityType(entityType);

            analyticsService.mixpanelTrack("Entity Leave", {'type': entity_type} );
            updateLeftPanel();
          })
          .error(function(error) {
            alert(error.msg);
          })
      }

    };

    $scope.onDeleteClick = function() {
      if (confirm($filter('translate')('@ch-menu-delete-confirm'))) {
        entityHeader.deleteEntity(entityType, entityId)
          .success(function() {
            // analytics
            var entity_type = analyticsService.getEntityType(entityType);
            analyticsService.mixpanelTrack("Entity Delete", {'type': entity_type});

            updateLeftPanel();
            fileAPIservice.broadcastChangeShared();
          })
          .error(function(error) {
            alert(error.msg);
          });
      }
    };

    $scope.onCurrentChatLeave = function() {
      jndPubSub.pub('leaveCurrentChat', entityId);
    };

    function updateLeftPanel() {
      jndPubSub.pub('updateLeftPanelCaller');
      publicService.goToDefaultTopic();
    }

    $scope.onPrefixIconCicked = function() {
      if (entityType === 'users') {
        _onUserPrefixIconClicked();
      }
    };

    function _onUserPrefixIconClicked() {
      modalHelper.openMemberProfileModal($scope, currentEntity);
    }

    // TODO: PLEASE REFACTOR THIS 'onStarClick' method.
    // TODO: THERE ARE MANY DIFFERENT PLACES USING DUPLICATED LINES OF CODES.
    $scope.onStarClick = function(entityType, entityId) {
      var param = {
        entityType: entityType,
        entityId: entityId
      };

      jndPubSub.pub('onStarClick', param);
    };
  }
})();