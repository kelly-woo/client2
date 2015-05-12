(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('messageListCtrl', messageListCtrl);

  /* @ngInject */
  function messageListCtrl($scope, storageAPIservice, messageList, entityAPIservice, publicService, $filter, modalHelper, jndPubSub) {
    // okay - okay to go!
    // loading - currently loading.
    // failed - failed to retrieve list from server.
    $scope.messageListLoadingStatus = 'okay';

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

    $scope.$on('updateMessageList', function() {
      getMessageList();
    });


    function getMessageList() {
      if ($scope.messageListLoadingStatus == 'loading') return;

      $scope.messageListLoadingStatus = 'loading';

      messageList.getRecentMessageList()
        .success(function(response) {
          $scope.messageList = _generateMessageList(response);
          $scope.messageListLoadingStatus = 'okay';
        })
        .error(function(err) {
          $scope.messageListLoadingStatus = 'failed';
          console.log(err)
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

      messages = _.uniq(messages, 'entityId');
      _.each(messages, function(message) {

        var entity = entityAPIservice.getEntityFromListById($scope.memberList, message.companionId);

        if (!angular.isUndefined(entity)) {
          if (message.unread > 0) {
            // Number of unread message can be greater than 0 even I'm currently viewing an entity that just sent a message to me.
            // In this case, message list still needs to be updated because entity may not be on the list.
            // However, I don't need to update/increment badge count for current entity.
            // Thus, update badge count for entities that I'm not viewing.
            if (!$scope.currentEntity || message.companionId != $scope.currentEntity.id) {
              entityAPIservice.updateBadgeValue(entity, message.unread);
            }

          }

          // merge message object to entity object so that list can be sorted by 'lastMessageId' attribute in message object.
          $.extend(entity, message);
          messageList.push(entity);
        }
      });

      return messageList;
    }

    function onMessageLeaveClick(entityId) {
      if (!confirm($filter('translate')('@common-conversation-leave-confirm'))) {
        return;
      }

      messageList.leaveCurrentMessage(entityId)
        .success(function(response) {
          if (entityId == $scope.currentEntity.id) {
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