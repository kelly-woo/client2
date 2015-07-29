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

      $scope.writer = EntityMapManager.get('total', record.writerId);
      $scope.topic = EntityMapManager.get('total', record.roomId);

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = $filter('getSmallThumbnail')($scope.writer);
      $scope.updateDate = $filter('getyyyyMMddformat')(record.updatedAt);
      $scope.startPoint = _getMentionStartPoint(record);
      $scope.content = _getContent(record);

      $scope.onMentionCardClick = onMentionCardClick;
    }

    function _getContent(record) {
      var content = record.content;
      var mentions = record.mentions;
      var mention;
      var i;

      for (i = mentions.length - 1; i > -1; --i) {
        mention = mentions[i];

        content = content;
      }

      return content;
    }

    function _getMentionStartPoint(record) {
      var startPoint;

      if (record.contentType === 'comment') {
        $scope.isComment = true;
        startPoint = record.feedbackTitle;
      } else {
        startPoint =  record.roomName || 'unknown topic';
      }

      return startPoint;
    }

    function _isPrivateTopicLeaved() {
      var result = false;
      var topic = $scope.topic;
      var currentMemberId;
      var members;

      if (topic && topic.type === 'privategroups') {
        currentMemberId = memberService.getMemberId();
        if (members = topic.pg_members) {
          if (members.indexOf(currentMemberId) < 0) {
            result = true;
          }
        }
      }

      return result;
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
      if (record.contentType === 'comment') {
        _goToFileDetail(record, writer);
      } else {
        if (_isPrivateTopicLeaved()) {
          alert('현재 삭제되거나 나간 토픽이므로 원본을 확인할 수 없습니다.');
        } else {
          _goToTopic(record);
        }
      }
    }

    function _goToFileDetail(record, writer) {
      $state.go('files', {userName: writer.name, itemId: record.feedbackId});
    }

    function _goToTopic(record) {
      var toEntityId = record.roomId;
      var toLinkId = record.linkId;

      MessageQuery.setSearchLinkId(toLinkId);

      if (_isToEntityCurrent(toEntityId)) {
        jndPubSub.pub('jumpToMessageId');
      } else {
        $state.go('archives', {entityType: $scope.topic.type, entityId: toEntityId});
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
