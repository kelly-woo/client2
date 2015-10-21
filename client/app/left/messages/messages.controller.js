/**
 * @filevoerview left left 밑에 있는  1:1 dm 부분을 control하는 controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('messageListCtrl', messageListCtrl);

  /* @ngInject */
  function messageListCtrl($scope, $timeout, storageAPIservice, messageList, entityAPIservice, currentSessionHelper,
                           publicService, $filter, modalHelper, jndPubSub, EntityMapManager, Dialog) {
    var collapseTimer;
    // okay - okay to go!
    // loading - currently loading.
    // failed - failed to retrieve list from server.
    $scope.messageListLoadingStatus = 'okay';

    // no longer used in this controller. ready to remove?
    $scope.currentEntity = currentSessionHelper.getCurrentEntity();

    $scope.messageList;
    $scope.isMessageListCollapsed = storageAPIservice.isLeftDMCollapsed();

    // TODO: REALLY??? IS THIS THE BEST???
    $scope.onDMInputFocus = onDMInputFocus;
    $scope.onDMInputBlur = onDMInputBlur;

    $scope.onMessageHeaderClick = onMessageHeaderClick;
    $scope.onMeesageLeaveClick = onMessageLeaveClick;

    $scope.openModal= openTeamMemberListModal;

    $scope.isDisabledMember = isDisabledMember;

    function openTeamMemberListModal() {
      modalHelper.openTeamMemberListModal();
    }

    // Must keep watching memberList in 'leftController' in order to keep member's starred status.
    $scope.$watch('memberList', function() {
      getMessageList();
    });

    $scope.$on('updateChatList', function() {
      getMessageList();
    });
    $scope.$watch('isMessageListCollapsed', _onCollapseStatusChanged);

    /**
     * collapse status 변경시 update badge posision 이벤트 트리거한다.
     * @private
     */
    function _onCollapseStatusChanged() {
      $timeout.cancel(collapseTimer);
      /*
       collapse 가 완료되는 시점을 알 수 없기 때문에 0.8 초 뒤에 position update 를 하도록 한다.
       todo: collapse 완료 시점을 알 수 있는 방법이 있다면 timeout 을 제거해야함
       */
      collapseTimer = $timeout(function() {
        jndPubSub.updateBadgePosition();
      }, 800);
    }

    function getMessageList() {
      if ($scope.messageListLoadingStatus == 'loading') return;

      $scope.messageListLoadingStatus = 'loading';

      messageList.getRecentMessageList()
        .success(function(response) {
          $scope.messageList = _generateMessageList(response);
          $scope.messageListLoadingStatus = 'okay';
          publicService.setInitDone();
        })
        .error(function(err) {
          $scope.messageListLoadingStatus = 'failed';
        })
        .finally(function() {
        });
    }

    function onMessageHeaderClick() {
      $scope.isMessageListCollapsed = !$scope.isMessageListCollapsed;
      storageAPIservice.setLeftDMCollapsed($scope.isMessageListCollapsed);
    }

    function _generateMessageList(messages) {
      var messageList = [];
      var _currentEntity;

      EntityMapManager.reset('memberEntityId');
      messages = _.uniq(messages, 'entityId');

      _.each(messages, function(message) {

        var entity = entityAPIservice.getEntityFromListById($scope.memberList, message.companionId);

        if (!angular.isUndefined(entity)) {
          if (message.unread > 0) {
            // Number of unread message can be greater than 0 even I'm currently viewing an entity that just sent a message to me.
            // In this case, message list still needs to be updated because entity may not be on the list.
            // However, I don't need to update/increment badge count for current entity.
            // Thus, update badge count for entities that I'm not viewing.
            // 원래는 위와 같은 이유로 현재 보고 있지 않는 엔티티에 대해서만 badge 를 update했지만,
            // 백앤드에 내가 작성한 메세지에 대해서는 unread를 증가시ㅣ지 않는 방향으로 가기로 함.
            // 그래서 모든 엔티티에 대해서 badge를 update해도 됨.

            entityAPIservice.updateBadgeValue(entity, message.unread);

            //_currentEntity = currentSessionHelper.getCurrentEntity();
            //if (message.companionId != _currentEntity.id) {

            //}
          }

          // merge message object to entity object so that list can be sorted by 'lastMessageId' attribute in message object.
          $.extend(entity, message);
          messageList.push(entity);
          EntityMapManager.add('memberEntityId', entity);
        }
      });

      return messageList;
    }

    function onMessageLeaveClick(entityId) {
      Dialog.confirm({
        body: $filter('translate')('@common-conversation-leave-confirm'),
        onClose: function(result) {
           if (result === 'okay') {
             messageList.leaveCurrentMessage(entityId)
               .success(function(response) {
                 //if (entityId == $scope.currentEntity.id) {
                 if (entityId == currentSessionHelper.getCurrentEntity().id) {
                   publicService.goToDefaultTopic();
                 }
               })
               .error(function(err) {
                 // TODO: WHAT SHOULD I DO WHEN FAILED?
               })
               .finally(function() {
                 getMessageList();
               });
           }
        }
      });
    }

    function onDMInputFocus() {
      $('.absolute-search-icon').stop().animate({opacity: 1}, 400);
    }

    function onDMInputBlur() {
      $('.absolute-search-icon').stop().css({'opacity' : 0.2});
    }

    function isDisabledMember(member) {
      return publicService.isDisabledMember(member);
    }


    $scope.$on('leaveCurrentChat', function(event, entityId) {
      onMessageLeaveClick(entityId);
    });

    // TODO: PLEASE REFACTOR THIS 'onStarClick' method.
    // TODO: THERE ARE MANY DIFFERENT PLACES USING DUPLICATED LINES OF CODES.
    $scope.onStarClick = function(entityType, entityId) {
      var param = {
        entityType: entityType,
        entityId: entityId
      };

      jndPubSub.pub('onStarClick', param);
    }
  }

})();