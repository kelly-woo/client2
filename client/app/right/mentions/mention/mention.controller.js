/**
 * @fileoverview mentions controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('MentionCtrl', MentionCtrl);

  /* @ngInject */
  function MentionCtrl($scope, $state, $filter, EntityMapManager, memberService, MessageQuery, jndPubSub) {
    _init();

    // First function to be called.
    function _init() {
      var record = $scope.record;

      $scope.writer = EntityMapManager.get('total', record.message.writerId);
      $scope.topic = EntityMapManager.get('total', record.room.id);

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = $filter('getSmallThumbnail')($scope.writer);
      $scope.updateDate = $filter('getyyyyMMddformat')(record.message.createdAt);
      $scope.startPoint = _getMentionStartPoint(record);
      $scope.content = _getContent(record);

      $scope.onMentionCardClick = onMentionCardClick;
    }

    function _getContent(record) {
      return $filter('mention')(record.message.contentBody, record.message.mentions, false);
    }

    function _getMentionStartPoint(record) {
      var startPoint;

      if (record.message.contentType === 'file') {
        $scope.isComment = true;
        startPoint = record.message.contentTitle;
      } else {
        startPoint =  record.room.name || 'unknown topic';
      }

      return startPoint;
    }

    /**
     * mention card click 이벤트 핸들러
     * @param {object} user
     */
    function onMentionCardClick(event) {
      if (_isProfileImage(event)) {
        jndPubSub.pub('onUserClick', $scope.writer);
      } else {
        _redirect($scope.record, $scope.writer);
      }
    }

    function _redirect(record, writer) {
      if (record.message.contentType === 'file') {
        _goToFileDetail(record, writer);
      } else {
        if (_isPrivateTopicLeaved(record)) {
          alert('현재 삭제되거나 나간 토픽이므로 원본을 확인할 수 없습니다.');
        } else {
          _goToTopic(record);
        }
      }
    }

    function _isPrivateTopicLeaved(record) {
      var result = false;
      var topic = $scope.topic;
      var currentMemberId = memberService.getMemberId();
      var members;

      if (record.room.type === 'privateGroup') {
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

    function _goToFileDetail(record, writer) {
      $state.go('files', {userName: writer.name, itemId: record.feedbackId});
    }

    function _goToTopic(record) {
      var toEntityId = record.room.id;
      var toLinkId = record.linkId;

      MessageQuery.setSearchLinkId(toLinkId);

      if (_isToEntityCurrent(toEntityId)) {
        jndPubSub.pub('jumpToMessageId');
      } else {
        $state.go('archives', {entityType: record.room.type + 's', entityId: toEntityId});
      }
    }

    function _isToEntityCurrent(toEntityId) {
      return $scope.currentEntity.id === toEntityId;
    }

    function _isProfileImage(event) {
      return /img/i.test(event.target.nodeName);
    }
  }
})();
