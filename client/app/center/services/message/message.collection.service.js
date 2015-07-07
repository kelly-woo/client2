/**
 * @fileoverview 메세지 콜렉션
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MessageCollection', MessageCollection);

  /* @ngInject */
  function MessageCollection($filter, $rootScope, $timeout, $sce, entityAPIservice, fileAPIservice, markerService,
                             jndPubSub, memberService, currentSessionHelper, centerService, MessageComment, MessageText,
                             MessageSending) {
    var that = this;
    var _systemMessageCount = 0;

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
    this.isNewDate = isNewDate;

    this.isElapsed = isElapsed;
    this.getContentType = getContentType;

    this.getQueue = getQueue;
    this.enqueue = enqueue;
    this.spliceQueue = MessageSending.splice;

    this.append = append;
    this.prepend = prepend;
    this.remove = remove;
    this.update = update;
    this.clearQueue = clearQueue;

    this.removeAllSendingMessages = removeAllSendingMessages;
    this.updateUnreadCount = updateUnreadCount;
    _init();

    /**
     * 초기화
     * @private
     */
    function _init() {
      reset();
    }

    /**
     * 번수를 초기화 한다.
     */
    function reset() {
      _systemMessageCount = 0;
      that.list = [];
    }

    /**
     * for each
     * @param {function} iteratee
     * @param {object} context
     */
    function forEach(iteratee, context) {
      _.forEach(that.list, iteratee, context);
    }

    /**
     * status 가 sending 인 messages 를 제거한다.
     */
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

    /**
     * Message Sending 의 queue 를 초기화한다.
     */
    function clearQueue() {
      MessageSending.reset();
    }

    /**
     * MessageSending 의 queue 를 반환한다.
     * @returns {Array}
     */
    function getQueue() {
      return MessageSending.queue;
    }

    /**
     * queue 에 메세지를 추가한다.
     * @param {string} content
     * @param {object} sticker
     * @param {boolean} isSkipAppend message list 에 append 할 지 여부
     */
    function enqueue(content, sticker, isSkipAppend) {
      var messageList = MessageSending.enqueue(content, sticker);
      if (!isSkipAppend) {
        append(messageList);
      }
    }

    /**
     * messageList 를 append 한다.
     * @param {array} messageList
     */
    function append(messageList) {
      messageList = _beforeAddMessages(messageList);
      _.forEach(messageList, function(msg) {
        msg = _getFormattedMessage(msg);
        that.list.push(msg);
      });
    }

    /**
     * messageList 를 prepend 한다.
     * @param {array} messageList
     */
    function prepend(messageList) {
      messageList = _beforeAddMessages(messageList);
      _.forEachRight(messageList, function(msg) {
        msg = _getFormattedMessage(msg);
        that.list.unshift(msg);
      });
    }

    /**
     * 메세지를 삭제한다.
     * @param {number|string} messageId 메세지 id
     * @param {boolean} isReversal  역순으로 순회할지 여부
     * @returns {boolean} 삭제에 성공했는지 여부
     */
    function remove(messageId, isReversal) {
      var targetIdx = at(messageId, isReversal);
      var msg;
      if (targetIdx !== -1) {
        msg = that.list[targetIdx];
        if (msg.status === 'sending') {
          MessageSending.remove(msg);
        }
        that.list.splice(targetIdx, 1);
      }
      return targetIdx !== -1;
    }

    /**
     * messageId 에 해당하는 message 를 반환한다.
     * @param {number|string} messageId messageId 메세지 id
     * @param {boolean} isReversal 역순으로 순회할지 여부
     * @returns {*}
     */
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

    /**
     * messageId 에 해당하는 message 가 몇번째 index 인지 반환한다.
     * @param {number|string} messageId messageId 메세지 id
     * @param {boolean} isReversal 역순으로 순회할지 여부
     * @returns {number}
     */
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

    /**
     * 서버로 부터 update 정보를 받아 해당 메세지들을 업데이트 한다.
     * @param {array} messageList 업데이트 할 메세지 리스트
     */
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

    /**
     * child text 인지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function isChildText(index) {
      var contentType = getContentType(index);
      return !!(centerService.isTextType(contentType) && MessageText.isChild(index, that.list));
    }

    /**
     * child comment 인지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function isChildComment(index) {
      var contentType = getContentType(index);
      return !!(centerService.isCommentType(contentType) && MessageComment.isChild(index, that.list));
    }

    /**
     * title comment 인지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function isTitleComment(index) {
      var contentType = getContentType(index);
      return !!(centerService.isCommentType(contentType) && MessageComment.isTitle(index, that.list));
    }

    /**
     * link preview 가 존재하는지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function hasLinkPreview(index) {
      return !_.isEmpty(that.list[index].message.linkPreview);
    }

    /**
     * 새로운 날짜의 시작인지 여부를 반환한다.
     * @param {number} index
     * @returns {boolean}
     */
    function isNewDate(index) {
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
      //msgRepeatDone 디렉티브에서 사용하기 위해 필요한 마지막 랜더링 아이템 정보 설정
      messageList[messageList.length - 1]._isLast = true;
      return messageList;
    }

    /**
     * 첫번째 id 를 반환한다.
     * @returns {number}
     */
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

    /**
     * 마지막 id 를 반환한다.
     * @returns {number}
     */
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

    /**
     * user message 를 업데이트 한다.
     * @param {object} msg 업데이트할 메세지
     * @private
     */
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
      }
    }

    /**
     * system message 를 업데이트한다.
     * @param {object} msg 업데이트할 메세지
     * @returns {*}
     * @private
     */
    function _updateSystemMessage(msg) {
      msg = _getFormattedSystemMsg(msg);
      append(msg);
      jndPubSub.pub('newSystemMessageArrived', msg);
    }

    /**
     * 기본 메세지에 랜더링에 필요한 추가 정보를 더하여 반환한다.
     * @param {object} msg
     * @returns {object}
     */
    function _getFormattedMessage(msg) {
      msg.date = _getDateKey(msg.time);
      if (_isSystemMessage(msg)) {
        msg = _getFormattedSystemMsg(msg);
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


    /**
     * formatted 된 system message 를 반환한다.
     * @param {object} msg
     * @returns {*}
     * @private
     */
    function _getFormattedSystemMsg(msg) {
      var newMsg = msg;
      var action = '';
      var entity;

      newMsg.eventType = '/' + msg.info.eventType;
      newMsg.message = {};
      newMsg.message.contentType = 'systemEvent';
      newMsg.message.content = {};
      newMsg.message.writer = entityAPIservice.getEntityFromListById($rootScope.memberList, msg.fromEntity);

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
      _systemMessageCount++;
      return newMsg;
    }

    /**
     * 시스템 메세지인지 여부를 반환한다.
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
     * 공유/공유해제 메세지인지 여부를 반환한다.
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
     * unread count 를 업데이트 한다.
     */
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