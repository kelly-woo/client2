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

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = $filter('getSmallThumbnail')($scope.writer);
      $scope.updateDate = $filter('getyyyyMMddformat')(record.updatedAt);
      $scope.startPoint = _getMentionStartPoint(record);

      $scope.content = _getContent(record);

      $scope.onMentionCardClick = onMentionCardClick;
      //console.log('mention ::: ', record);
      //console.log('member ::: ', $scope.writer);
      //console.log('profile ::: ', $filter('getSmallThumbnail')($scope.writer));
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
      if (record.contentType === 'comment') {
        //$state.go('files', {userName: file.writer.name, itemId: file.id});
      } else {
        _getTopicPoint(record);
      }
    }

    function _isPrivateTopicLeaved(record) {
      var result = false;
      var topic = EntityMapManager.get('total', record.roomId);
      var currentMemberId;
      var members;


      if (topic) {
        currentMemberId = memberService.getMemberId();
        if (members = topic.ch_members || topic.pg_members) {
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
        var toEntityId = record.roomId;
        var toLinkId = record.linkId;
        _isPrivateTopicLeaved
        MessageQuery.setSearchLinkId(toLinkId);

        if (!_isToEntityCurrent(toEntityId)) {
          _goToTopic(record);
        } else {
          jndPubSub.pub('jumpToMessageId');
        }
      }
    }

    function _isToEntityCurrent(toEntityId) {
      return $scope.currentEntity.id === toEntityId;
    }

    function _goToFileDetail(record, writer) {
      $state.go('files', {userName: writer.name, itemId: record.feedbackId});
    }

    function _goToTopic(record) {
      $state.go('archives', {entityType: record.type + 's', entityId: record.toLinkId});
    }

    function _isProfileImage(event) {
      return /img/i.test(event.target.nodeName);
    }
  }
})();
