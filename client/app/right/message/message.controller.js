/**
 * @fileoverview message controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightMessageCtrl', RightMessageCtrl);

  /* @ngInject */
  function RightMessageCtrl($scope, $filter, $state, currentSessionHelper, Dialog, EntityHandler, messageAPIservice,
                            jndPubSub, MessageQuery, memberService, publicService, RightMessage, RoomTopicList) {
    var UNKNOWN_ROOM = 'unknown room';

    _init();

    // First function to be called.
    function _init() {
      // message controller에 전달되는 data가 tab(message search, star, mention)마다 각각 다르므로 message data를
      // message controller에서 사용가능한 data format으로 convert함
      var message = $scope.message = RightMessage.convert($scope.messageType, $scope.messageData);

      $scope.writer = EntityHandler.get(message.writerId);

      $scope.writerName = $scope.writer.name;
      $scope.profileImage = memberService.getProfileImage($scope.writer.id, 'small');
      $scope.createDate = $filter('getyyyyMMddformat')(message.createdAt);
      $scope.startPoint = _getMessageStartPoint(message);
      $scope.content = _getContent(message);
      $scope.inlineContent = _getContent(message, ['bolditalic']);

      $scope.isDisabledMember = isDisabledMember;
      $scope.hasStar = message.hasStar || false;
      $scope.isStarred = message.isStarred || false;

      $scope.isJandiBot = memberService.isJandiBot($scope.writer.id);

      $scope.onMessageCardClick = onMessageCardClick;
    }

    /**
     * disabled member 여부
     * @returns {*|boolean|*}
     */
    function isDisabledMember() {
      return publicService.isDisabledMember($scope.writer);
    }

    /**
     * message content 전달
     * @param {object} message
     * @param {Array} allowList - 파싱 할 markdown 종류 배열
     * @returns {*}
     * @private
     */
    function _getContent(message, allowList) {
      var content = message.contentBody;
      if (content) {
        if (message.mentions && message.mentions.length > 0) {
          // mentions가 존재한다면 mentions parse하여 content 설정
          content = $filter('mention')(content, message.mentions, false);
          content = $filter('parseAnchor')(content);
          content = $filter('mentionHtmlDecode')(content);
        } else {
          content = $filter('parseAnchor')(content);
        }
        content = $filter('markdown')(content, allowList);
      }
      return content;
    }

    /**
     *
     * @param message
     * @returns {*}
     * @private
     */
    function _getMessageStartPoint(message) {
      var startPoint;
      var entity;

      if (message.contentType === 'text') {
        // type이 text라면 topic 명으로 설정함
        if (message.roomType === 'chat') {

          // DM의 경우 roomName에 작성자와 대상자의 id가 전달되므로 entity manager에서 member 조회 해야됨
          entity = EntityHandler.get(_getOtherMemberId(message.roomName));
          startPoint = entity ? entity.name : UNKNOWN_ROOM;
        } else {
          startPoint = message.roomName || UNKNOWN_ROOM;
        }
      } else {
        // type이 text가 아니라면 file 명으로 설정함
        startPoint = message.feedbackTitle;
      }

      return startPoint;
    }

    /**
     * message card click event handler
     * @param {object} event
     */
    function onMessageCardClick(event) {
      var message = $scope.message;

      if (_isProfileImage(event)) {
        // open user profile

        event.stopPropagation();
        jndPubSub.pub('onMemberClick', $scope.writer);
      } else if (!message.preventRedirect) {
        if (message.type !== 'message') {
          // message type이 'message'라면 상위 scope에서 event handling함

          _onMessageCardClick(message, $scope.writer);
        }
      }
    }

    /**
     * message card click 이벤트 핸들러
     * @param {object} message
     * @param {object} writer
     * @private
     */
    function _onMessageCardClick(message, writer) {
      if (message.contentType === 'comment' && message.feedbackId > 0) {
        // file detail로

        _goTo(function() {
          _goToFileDetail(message, writer);
        });
      } else {
        // center로

        if (message.roomType === 'chat') {
          _goTo(function() {
            // DM 이라면 나를 제외한 한명의 id가 id로 사용됨
            _goToTopic({
              type: 'user',
              id: _getOtherMemberId(message.roomName),
              linkId: message.linkId
            });
          });
        } else if (RoomTopicList.hasMember(message.roomId, memberService.getMemberId())) {
          // 해당 topic의 member 라면
          _goTo(function() {
            _goToTopic({
              type: message.roomType,
              id: message.roomId,
              linkId: message.linkId
            });
          });
        } else {
          Dialog.error({
            title: $filter('translate')('@common-invalid-access')
          });
        }
      }
    }

    /**
     * 특정 state 로 이동
     * @param {function} fn
     * @private
     */
    function _goTo(fn) {
      messageAPIservice.getMessage($scope.messageData.teamId, $scope.message.id)
        .success(function(message) {
          if (message.status === 'created') {
            // 삭제된 message가 아니라면

            fn();
          } else {
            Dialog.error({
              title: $filter('translate')('@common-removed-origin')
            });
          }
        })
        .error(function() {
          Dialog.error({
            title: $filter('translate')('@common-invalid-access')
          });
        });
    }

    /**
     * go to file detail
     * @param {object} message
     * @param {object} writer
     * @private
     */
    function _goToFileDetail(message, writer) {
      $state.go($scope.message.type === 'message' ? 'files' : $scope.message.type + 's', {userName: writer.name, itemId: message.feedbackId});
    }

    /**
     * go to topic
     * @param {object} message
     * @private
     */
    function _goToTopic(message) {
      var id = message.id;
      var linkId = message.linkId;

      // set link id
      MessageQuery.setSearchLinkId(linkId);

      if (_isToEntityCurrent(id)) {
        jndPubSub.pub('jumpToMessageId');
      } else {
        $state.go('archives', {entityType: message.type + 's', entityId: id});
      }
    }

    /**
     * 현재 center에 노출된 topic 과 같은 topic인지 여부
     * @param {number} toEntityId
     * @returns {boolean}
     * @private
     */
    function _isToEntityCurrent(toEntityId) {
      return currentSessionHelper.getCurrentEntity().id === toEntityId;
    }

    /**
     * element가 profile image인지 여부
     * @param {object} event
     * @returns {boolean}
     * @private
     */
    function _isProfileImage(event) {
      return /img/i.test(event.target.nodeName);
    }

    /**
     * 나를 제외한 다른 멤버 id 전달
     * @param {string} members
     * @returns {*}
     * @private
     */
    function _getOtherMemberId(members) {
      members = members.split(':');
      return members[0] == memberService.getMemberId() ? members[1] : members[0]
    }
  }
})();
