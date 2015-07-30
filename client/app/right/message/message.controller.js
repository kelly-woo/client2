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
      var data = $scope.data = MessageData.convert($scope.messageType, $scope.messageData);

      $scope.writer = EntityMapManager.get('total', data.writerId);
      $scope.topic = EntityMapManager.get('total', data.roomId);

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = $filter('getSmallThumbnail')($scope.writer);
      $scope.createDate = $filter('getyyyyMMddformat')(data.createdAt);
      $scope.startPoint = _getMessageStartPoint(data);
      $scope.content = _getContent(data);

      $scope.onMessageCardClick = onMessageCardClick;
    }

    function _getContent(data) {
      var content = data.contentBody;

      if (data.mentions) {
        content = $filter('mention')(content, data.mentions, false);
      }

      return content;
    }

    function _getMessageStartPoint(data) {
      var startPoint;

      if (data.contentType === 'comment') {
        $scope.isComment = true;
        startPoint = data.feedbackTitle;
      } else {
        startPoint =  data.contentTitle || 'unknown topic';
      }

      return startPoint;
    }

    /**
     * message card click 이벤트 핸들러
     * @param {object} user
     */
    function onMessageCardClick(event) {
      var data = $scope.data;

      if (_isProfileImage(event)) {
        event.stopPropagation();
        jndPubSub.pub('onUserClick', $scope.writer);
      } else if (!data.preventRedirect) {
        _redirect(data, $scope.writer);
      }
    }

    function _redirect(data, writer) {
      if (data.contentType === 'comment' && data.feedbackId > 0) {
        _goToFileDetail(data, writer);
      } else {
        if (_isPrivateTopicLeaved(data)) {
          alert('현재 삭제되거나 나간 토픽이므로 원본을 확인할 수 없습니다.');
        } else {
          _goToTopic(data);
        }
      }
    }

    function _isPrivateTopicLeaved(data) {
      var result = false;
      var topic = $scope.topic;
      var currentMemberId = memberService.getMemberId();
      var members;

      if (data.roomType === 'privateGroup') {
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

    function _goToFileDetail(data, writer) {
      $state.go('files', {userName: writer.name, itemId: data.feedbackId});
    }

    function _goToTopic(data) {
      var toEntityId = data.roomId;
      var toLinkId = data.linkId;

      MessageQuery.setSearchLinkId(toLinkId);

      if (_isToEntityCurrent(toEntityId)) {
        jndPubSub.pub('jumpToMessageId');
      } else {
        $state.go('archives', {entityType: data.roomType + 's', entityId: toEntityId});
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
