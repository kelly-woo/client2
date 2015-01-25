(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('messageListCtrl', messageListCtrl);

  /* @ngInject */
  function messageListCtrl($scope, $rootScope, storageAPIservice, messageList, entityAPIservice, publicService, $filter) {
    var vm = this;


    // okay - okay to go!
    // loading - currently loading.
    // failed - failed to retrieve list from server.
    vm.messageListLoadingStatus = 'okay';

    vm.messageList;
    vm.isMessageListCollapsed = storageAPIservice.isLeftDMCollapsed();

    // TODO: REALLY??? IS THIS THE BEST???
    vm.onDMInputFocus = onDMInputFocus;
    vm.onDMInputBlur = onDMInputBlur;

    vm.onMessageHeaderClick = onMessageHeaderClick;
    vm.onMeesageLeaveClick = onMeesageLeaveClick;

    vm.openModal= openTeamMemberListModal;

    function openTeamMemberListModal() {
      publicService.openTeamMemberListModal($scope);
    }

    // Must keep watching memberList in 'leftController' in order to keep member's starred status.
    $scope.$watch('memberList', function() {
      getMessageList();
    });

    $scope.$on('updateMessageList', function() {
      getMessageList();
    });

    getMessageList();

    function getMessageList() {
      if (vm.messageListLoadingStatus == 'loading') return;

      vm.messageListLoadingStatus = 'loading';

      messageList.getRecentMessageList()
        .success(function(response) {
          vm.messageList = _generateMessageList(response);
          vm.messageListLoadingStatus = 'okay';
        })
        .error(function(err) {
          vm.messageListLoadingStatus = 'failed';
          console.log(err)
        })
        .finally(function() {
        });
    }

    function onMessageHeaderClick() {
      vm.isMessageListCollapsed = !vm.isMessageListCollapsed;
      storageAPIservice.setLeftDMCollapsed(vm.isMessageListCollapsed);
    }

    function _generateMessageList(messages) {
      var messageList = [];
      messages = _.uniq(messages, 'entityId');
      _.each(messages, function(message) {

        var entity = entityAPIservice.getEntityFromListById($scope.memberList, message.entityId);

        if (!angular.isUndefined(entity)) {
          if (message.unread > 0) {
            // Number of unread message can be greater than 0 even I'm currently viewing an entity that just sent a message to me.
            // In this case, message list still needs to be updated because entity may not be on the list.
            // However, I don't need to update/increment badge count for current entity.
            // Thus, update badge count for entities that I'm not viewing.
            if (message.entityId != $scope.currentEntity.id) {
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

    function onMeesageLeaveClick(entityId) {
      if (!confirm($filter('translate')('@common-conversation-leave-confirm'))) {
        return;
      }

      messageList.leaveCurrentMessage(entityId)
        .success(function(response) {
          if (entityId == $scope.currentEntity.id) {
            $rootScope.toDefault = true;
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

    $scope.$on('leaveCurrentChat', function(event, entityId) {
      onMeesageLeaveClick(entityId);
    })
  }

})();