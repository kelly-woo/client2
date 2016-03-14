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
                           publicService, $filter, modalHelper, jndPubSub, EntityMapManager, Dialog, JndUtil, centerService,
                           EntityHandler) {
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
    $scope.totalAlarmCnt = 0;

    _init();

    function _init() {
      if ($scope.isMessageListCollapsed) {
        $('#dm-list').css('display', 'none');
      }
      _setTotalAlarmCnt();
      // Must keep watching memberList in 'leftController' in order to keep member's starred status.
      $scope.$on('updateBadgePosition', _setTotalAlarmCnt);
      $scope.$on('updateChatList', getMessageList);
      $scope.$watch('isMessageListCollapsed', _onCollapseStatusChanged);
      getMessageList();
    }

    function openTeamMemberListModal() {
      modalHelper.openTeamMemberListModal();
    }

    /**
     * collapse status 변경시 update badge posision 이벤트 트리거한다.
     * @private
     */
    function _onCollapseStatusChanged() {
      jndPubSub.updateBadgePosition();
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

    /**
     * message header 클릭 이벤트
     */
    function onMessageHeaderClick(clickEvent) {
      var jqBadge = $(clickEvent.target).find('.left-header-badge');
      if ($('#dm-list').css('display') === 'none') {
        jqBadge.hide();
      }
      $('#dm-list').stop().slideToggle({
        always: function() {
          JndUtil.safeApply($scope, function() {
            jqBadge.show();
            $('#dm-list').css('height', '');
            $scope.isMessageListCollapsed = ($('#dm-list').css('display') === 'none');
            storageAPIservice.setLeftDMCollapsed($scope.isMessageListCollapsed);
            _setTotalAlarmCnt();
            jndPubSub.updateBadgePosition();
          });
        }
      });
    }

    /**
     * 전체 뱃지 개수를 설정한다
     * @private
     */
    function _setTotalAlarmCnt() {
      $scope.totalAlarmCnt = $scope.isMessageListCollapsed ? _getTotalAlarmCnt() : 0;
    }

    /**
     * 전체 뱃지 개수를 반환한다
     * @returns {number}
     * @private
     */
    function _getTotalAlarmCnt() {
      var count;
      var totalCnt = 0;
      _.forEach($scope.messageList, function(entity) {
        count = +(entity.alarmCnt || 0);
        totalCnt += count;
      });
      return totalCnt;
    }

    function _generateMessageList(messages) {
      EntityHandler.parseChatRoomLists(messages);

      var messageList = [];

      //EntityMapManager.reset('memberEntityId');
      messages = _.uniq(messages, 'entityId');

      _.each(messages, function(message) {

        var entity = EntityMapManager.get('total', message.companionId);

        if (!angular.isUndefined(entity)) {
          if (message.unread > 0) {
            //현재 activate DM 이 아닌곳에 한해서 unread count 를 업데이트 한다.
            if (!_isActiveCurrentDm(entity)) {
              entityAPIservice.updateBadgeValue(entity, message.unread);
            }
          }

          // merge message object to entity object so that list can be sorted by 'lastMessageId' attribute in message object.
          //$.extend(entity, message);
          messageList.push(entity);
          //EntityMapManager.add('memberEntityId', entity);
        }
      });
      _setTotalAlarmCnt();
      return messageList;
    }

    /**
     * 현재 active 상태인 DM 인지 여부를 확인한다.
     * @returns {*|Object|boolean}
     * @private
     */
    function _isActiveCurrentDm(entity) {
      var currentEntity = currentSessionHelper.getCurrentEntity();
      return currentEntity &&
        (currentEntity.id === entity.id) &&
        centerService.hasBottomReached() &&
        !currentSessionHelper.isBrowserHidden();
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