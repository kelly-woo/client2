/**
 * @fileoverview message controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('MessageCtrl', MessageCtrl);

  /* @ngInject */
  function MessageCtrl($scope, $state, $filter, EntityMapManager, memberService, MessageQuery, jndPubSub, MessageData, currentSessionHelper) {
    _init();

    // First function to be called.
    function _init() {
      var message = $scope.message = MessageData.convert($scope.messageType, $scope.messageData);

      $scope.writer = EntityMapManager.get('total', message.writerId);
      $scope.topic = EntityMapManager.get('total', message.roomId);

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = $filter('getSmallThumbnail')($scope.writer);
      $scope.createDate = $filter('getyyyyMMddformat')(message.createdAt);
      $scope.startPoint = _getMessageStartPoint(message);
      $scope.content = _getContent(message);

      $scope.hasStar = message.hasStar || false;
      $scope.isStarred = message.isStarred || false;

      $scope.onMessageCardClick = onMessageCardClick;
    }

    function _getContent(message) {
      var content = message.contentBody;

      if (message.mentions) {
        content = $filter('mention')(content, message.mentions, false);
      }

      return content;
    }

    function _getMessageStartPoint(message) {
      var startPoint;

      if (message.contentType === 'text') {
        startPoint =  message.roomName || 'unknown topic';
      } else {
        startPoint = message.feedbackTitle;
      }

      return startPoint;
    }

    /**
     * message card click 이벤트 핸들러
     * @param {object} user
     */
    function onMessageCardClick(event) {
      var message = $scope.message;

      if (_isProfileImage(event)) {
        event.stopPropagation();
        jndPubSub.pub('onUserClick', $scope.writer);
      } else if (!message.preventRedirect) {
        _redirect(message, $scope.writer);
      }
    }

    function _redirect(message, writer) {
      if (message.contentType === 'comment' && message.feedbackId > 0) {
        _goToFileDetail(message, writer);
      } else {
        if (_isPrivateTopicLeaved(message)) {
          alert('현재 삭제되거나 나간 토픽이므로 원본을 확인할 수 없습니다.');
        } else {
          _goToTopic(message);
        }
      }
    }

    function _isPrivateTopicLeaved(message) {
      var result = false;
      var topic = $scope.topic;
      var currentMemberId = memberService.getMemberId();
      var members;

      if (message.roomType === 'privateGroup') {
        if (topic) {
          members = topic.pg_members;
          if (members.indexOf(currentMemberId) < 0) {
            result = true;
          }
        } else {
          result = true;
        }
      }

      return result;
    }

    function _goToFileDetail(message, writer) {
      $state.go('files', {userName: writer.name, itemId: message.feedbackId});
    }

    function _goToTopic(message) {
      var toEntityId = message.roomId;
      var toLinkId = message.linkId;

      MessageQuery.setSearchLinkId(toLinkId);

      if (_isToEntityCurrent(toEntityId)) {
        jndPubSub.pub('jumpToMessageId');
      } else {
        $state.go('archives', {entityType: message.roomType + 's', entityId: toEntityId});
      }
    }

    function _isToEntityCurrent(toEntityId) {
      return currentSessionHelper.getCurrentEntity().id === toEntityId;
    }

    function _isProfileImage(event) {
      return /img/i.test(event.target.nodeName);
    }
  }
})();
