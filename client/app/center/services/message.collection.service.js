(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MessageCollection', MessageCollection);

  /* @ngInject */
  function MessageCollection($filter, $timeout, $sce, entityAPIservice, fileAPIservice, markerService, jndPubSub,
                             currentSessionHelper, centerService, MessageComment, MessageText, MessageSending) {

    var that = this;

    var _systemMessageCount = 0;
    var lastUpdatedLinkId;


    this.list = [];
    this.reset = reset;
    this.at = at;
    this.get = get;
    this.forEach = forEach;

    this.getLastLinkId = getLastLinkId;
    this.getFirstLinkId = getFirstLinkId; 

    this.hasLinkPreview = hasLinkPreview;
    
    this.isChildText = isChildText;
    this.isChildComment = isChildComment;
    this.isTitleComment = isTitleComment;
    this.isDayChanged = isDayChanged;

    this.isElapsed = isElapsed;
    this.getContentType = getContentType;

    this.getQueue = getQueue;
    this.enqueue = enqueue;
    this.append = append;
    this.prepend = prepend;
    this.remove = remove;
    this.update = update;
    this.clearQueue = clearQueue;

    this.removeAllSendingMessages = removeAllSendingMessages;
    this.updateUnreadCount = updateUnreadCount;
    _init();

    function _init() {
      reset();
    }
    function forEach(iteratee, context) {
      _.forEach(that.list, iteratee, context);
    }
    
    
    function reset() {
      _systemMessageCount = 0;
      that.list = [];
    }

    function removeAllSendingMessages() {
      var list = that.list;
      var length = list.length;
      var i = length - 1;
      var msg;
      var count = 0;
      for (; i >= 0; i--) {
        msg = list[i];
        if (msg.status !== 'sending') {
          break;
        }
        count++;
      }
      list.splice(i + 1, count);
    }

    function clearQueue() {
      MessageSending.reset();
    }
    function getQueue() {
      return MessageSending.queue;
    }
    function enqueue(content, sticker) {
      var messageList = MessageSending.enqueue(content, sticker);
      append(messageList);
    }
    function append(messageList) {
      messageList = _beforeAddMessages(messageList);
      _.forEach(messageList, function(msg) {
        msg = _getFormattedMessage(msg);
        that.list.push(msg);
      });
      console.log(that.list);
    }
    function prepend(messageList) {
      messageList = _beforeAddMessages(messageList);
      _.forEachRight(messageList, function(msg) {
        msg = _getFormattedMessage(msg);
        that.list.unshift(msg);
      });
      console.log(that.list);
    }
    function update(messageList) {
      messageList = _beforeAddMessages(messageList);

      _.forEach(messageList, function(msg) {
        if (_isSystemMessage(msg)) {
          _updateSystemMessage(msg);
        } else {
          _updateUserMessage(msg);
        }
      });
    }
    function _updateUserMessage(msg) {
      var isArchived = false;
      var messageId = msg.messageId;
      switch (msg.status) {
        // text writed
        case 'created':
          append(msg);
          break;
        case 'edited':
          if (remove(messageId)) {
            append(msg);
          }
          break;
        // text deleted
        case 'archived':
          isArchived = remove(messageId);
          break;
        // file shared
        case 'shared':
          append(msg);
          break;
        // file unshared
        case 'unshared':
          if (remove(messageId)) {
            append(msg);
          }
          break;
        default:
          console.error("!!! unfiltered message", msg);
          break;
      }

      if (!isArchived) {
        // When there is a message to update on current topic.
        jndPubSub.pub('newMessageArrived', msg);
        //lastMessageId = loadedLastMessageId = localLastMessageId = lastUpdatedLinkId;
        //_newMessageAlertChecker(msg);
      }
    }
    function remove(messageId) {
      var targetIdx = at(messageId);
      if (targetIdx !== -1) {
        that.list.splice(targetIdx, 1);
      }
      return targetIdx !== -1;
    }

    function get(messageId, isReversal) {
      var target;
      var list = that.list;
      var iterator = isReversal ? _.forEachRight : _.forEach;

      iterator(list, function(message) {
        if (message.messageId === messageId) {
          target = message;
          return false;
        }
      });

      return target;
    }
    function at(messageId, isReversal) {
      var targetIdx = -1;
      var list = that.list;
      var iterator = isReversal ? _.forEachRight : _.forEach;

      iterator(list, function(message, index) {
        if (message.messageId === messageId) {
          targetIdx = index;
          return false;
        }
      });

      return targetIdx;
    }

    function _updateSystemMessage(msg) {
      msg = _getFormattedSystemMsg(msg);
      _systemMessageCount++;
      return msg;
    }
    /**
     *
     * @param msg
     * @returns {*}
     */
    function _getFormattedMessage(msg) {
      msg.date = _getDateKey(msg.time);
      if (_isSystemMessage(msg)) {
        _updateSystemMessage(msg);
      } else {
        if (_isSharingStatusMassage(msg))  {

          /*
           shareEntities 중복 제거 & 각각 상세 entity 정보 주입
           center.controller.js 에서 _messageProcessor 실행 시점에 msg.message.shared에 할당되는 값을
           msg.message를 가지고 알 수 없으므로(msg.message.shareEntites의 값이 room ID와 user id 혼용으로 인한)
           meg.message가 확장되는 시점인 messages.controller에 _generateMessageList 실행에 수행하기 위해
           임시로 process를 가지고 있다 전달하는 역활을 하는 method를 만들어 처리하려고 하였으나, messages.controller가 수행되지 않는
           경우가 발견(jandi page가 load된 상태에서 DM이나 topic으로 접속시)되어 불완전한 timeout을 사용하여 처리함.

           - by Mark
           */
          $timeout((function(msg) {
            return function() {
              msg.message.shared = fileAPIservice.updateShared(msg.message);
            };
          }(msg)));
        } else {

        }
        // parse HTML, URL code
        msg.message.content._body = msg.message.content.body;
        _filterContentBody(msg);
      }
      _setMessageFlag(msg);
      return msg;
    }

    function isChildText(index) {
      var contentType = getContentType(index);
      return centerService.isTextType(contentType) && MessageText.isChild(index, that.list);
    }
    function isChildComment(index) {
      var contentType = getContentType(index);
      return centerService.isCommentType(contentType) && MessageComment.isChild(index, that.list);
    }
    function isTitleComment(index) {
      var contentType = getContentType(index);
      return centerService.isCommentType(contentType) && MessageComment.isTitle(index, that.list);
    }
    function hasLinkPreview(index) {
      return _.isEmpty(that.list[index].linkPreview);
    }

    function isDayChanged(index) {
      var messages = that.list;
      var prevMsg;
      var msg = messages[index];

      if (index > 0) {
        prevMsg = messages[index - 1];
        if (msg.date !== prevMsg.date) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }
    /**
     * 해당 메세지의 content type 을 확인한다.
     * @param index 확인할 대상 메세지 인덱스
     * @returns {string} 메세지의 contentType
     */

    function getContentType(index) {
      var data = that.list[index];
      return data && data.message && data.message.contentType;
    }
    function _beforeAddMessages(messageList) {
      messageList = _.isArray(messageList) ? _.sortBy(messageList, 'id') : [messageList];

      return messageList;
    }

    function getFirstLinkId() {
      var linkId = -1;
      _.forEach(that.list, function(msg) {
        if (!MessageSending.isSending(msg)) {
          linkId = msg.id;
          return false;
        }
      });
      return linkId;
    }
    
    function getLastLinkId() {
      var linkId = -1;
      _.forEachRight(that.list, function(msg) {
        if (!MessageSending.isSending(msg)) {
          linkId = msg.id;
          return false;
        }
      });
      return linkId;
    }
    
    function _getDateKey(time) {
      return $filter('ordinalDate')(time, "yyyyMMddEEEE, MMMM doo, yyyy");
    }

    /**
     * message 의 기본 flag를 설정한다.
     * @param {object} msg
     * @private
     */
    function _setMessageFlag(msg) {
      var contentType;
      var message = msg.message;
      contentType = message.contentType;
      if (contentType === 'file') {
        message.isFile = true;
      } else if (centerService.isTextType(contentType)) {
        message.isText = true;
      } else if (centerService.isCommentType(contentType)) {
        message.isComment = true;
      }
      return msg;
    }

    

    function _getFormattedSystemMsg(msg) {
      var newMsg = msg;
      var action = '';
      var entity;

      newMsg.eventType = '/' + msg.info.eventType;
      newMsg.message = {};
      newMsg.message.contentType = 'systemEvent';
      newMsg.message.content = {};
      newMsg.message.writer = entityAPIservice.getEntityFromListById($scope.memberList, msg.fromEntity);

      switch(msg.info.eventType) {
        case 'invite':
          action = $filter('translate')('@msg-invited');
          newMsg.message.invites = [];
          _.each(msg.info.inviteUsers, function(element, index, list) {
            entity = entityAPIservice.getEntityFromListById($rootScope.memberList, element);
            if (!_.isUndefined(entity)) {
              newMsg.message.invites.push(entity);
            }
          });
          break;
        case 'join' :
          action = $filter('translate')('@msg-joined');
          break;
        case 'leave' :
          action = $filter('translate')('@msg-left');
          break;
        case 'create' :
          if (msg.info.entityType == 'channel') {
            action = $filter('translate')('@msg-create-ch');
          } else {
            action = $filter('translate')('@msg-create-pg');
          }
          break;
      }

      newMsg.message.content.actionOwner = memberService.getNameById(msg.fromEntity);
      newMsg.message.content.body = action;

      return newMsg;
    }

    /**
     * 시스템 메세지 여부를 반환한다.
     * @param {object} msg 메세지
     * @returns {boolean} 시스템 메세지 여부
     * @private
     */
    function _isSystemMessage(msg) {
      var sysMap = {
        'event': true
      };
      return !!(msg && sysMap[msg.status]);
    }

    /**
     * 공유 관련된 메세지인지 여부를 반환한다.
     * @param {object} msg 메세지
     * @returns {boolean}
     * @private
     */
    function _isSharingStatusMassage(msg) {
      if (msg && (msg.status === 'shared' || msg.status === 'unshared') &&
        msg.message &&
        msg.message.shareEntities &&
        msg.message.shareEntities.length) {
        return true;
      } else {
        return false;
      }
    }

    /**
     * 메세지를 노출하기 알맞게 가공한다.
     * @param {object} msg 메세지
     * @private
     */
    function _filterContentBody(msg) {
      var safeBody = msg.message.content.body;
      if (safeBody !== undefined && safeBody !== "") {
        safeBody = $filter('parseAnchor')(safeBody);
      }
      msg.message.content.body = $sce.trustAsHtml(safeBody);
    }

    /**
     * 연속된 메세지로 간주할 시간 허용 범위를 초과하였는지 여부
     * @param {number} startTime 시작 시간
     * @param {number} endTime  끝 시간
     * @returns {boolean} 초과했는지 여부
     * @private
     */
    function isElapsed(startTime, endTime) {
      var elapsedMin = Math.floor((endTime - startTime) / 60000);
      return elapsedMin > MAX_MSG_ELAPSED_MINUTES;
    }


    function updateUnreadCount() {
      var list = that.list;
      var globalUnreadCount;
      var lastLinkIdToCount = markerService.getLastLinkIdToCountMap();
      var markerOffset = markerService.getMarkerOffset();


      if (centerService.isChat()) {
        globalUnreadCount = 1;
      } else {
        globalUnreadCount = entityAPIservice.getMemberLength(currentSessionHelper.getCurrentEntity()) - 1;
      }
      globalUnreadCount = globalUnreadCount - markerOffset;

      _.forEachRight(list, function(message, index) {
        if (!!lastLinkIdToCount[message.id]) {
          var currentObj = lastLinkIdToCount[message.id];
          var currentObjCount = currentObj.count;

          globalUnreadCount = globalUnreadCount - currentObjCount;
        }

        if (message.unreadCount === '') {
          // if message.unreadCount is an 'empty string', then globalUnreadCount for current message has reached ZERO!!!
          // There is no need to increment unread count for any type of message.
          // So just leave as it is. as ZERO.
          globalUnreadCount = 0;
        } else if (message.unreadCount < globalUnreadCount) {
          globalUnreadCount = message.unreadCount;
        }

        if (globalUnreadCount < 0) globalUnreadCount = 0;
        if (globalUnreadCount === 0) {
          message.unreadCount = '';
        } else {
          message.unreadCount = globalUnreadCount;
        }
        //message.unreadCount = globalUnreadCount === 0 ? '' : globalUnreadCount;
        list[index] = message;
      });

    }
  }
})();
