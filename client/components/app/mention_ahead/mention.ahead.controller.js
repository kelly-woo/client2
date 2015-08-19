/**
 * @fileoverview mention ahead controller
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .controller('MentionaheadCtrl', MentionaheadCtrl);

  /* @ngInject */
  function MentionaheadCtrl($scope, $state, $parse, $filter, $window, $timeout, entityAPIservice, memberService,
                            currentSessionHelper, configuration, MentionExtractor) {
    var that = this;

    var MENTION_ALL_ITEM_TEXT = $filter('translate')('@mention-all');
    var entityId = $state.params.entityId;
    var timerUpdateMentionAhead;

    var $originScope;
    var $model;

    that.init = init;

    that.getValue = getValue;
    that.setValue = setValue;

    that.setMentions = setMentions;
    that.clearMention = clearMention;

    that.setMentionOnLive = setMentionOnLive;

    that.isInputMention = isInputMention;
    that.isShowMentionahead = isShowMentionahead;
    that.showMentionahead = showMentionahead;

    function init(options) {
      var fn;

      $originScope = options.originScope;
      $originScope.getMentions = getMentions;

      $model = options.mentionModel;
      $scope.jqEle = options.jqEle;

      $scope.onSelect = onSelect;
      $scope.onMatches = onMatches;

      $scope.hasOn = false;
      $scope.on = options.on;

      // mention list를 생성 option
      fn = options.attrs.mentionaheadData && $parse(options.attrs.mentionaheadData);

      if (fn) {
        $scope.mentionList = fn($originScope, {
          $mentionScope: $scope,
          $mentionCtrl: that
        });
      } else {
        // current entity change event handler에서 한번 mention list 설정
        $scope.$on('centerUpdateChatList', _centerUpdateChatList);

        $timeout.cancel(timerUpdateMentionAhead);
        timerUpdateMentionAhead = $timeout(function() {
          _setMentionList();
        }, 200);
      }

      // message를 submit하는 method
      if (options.attrs.messageSubmit) {
        _hookMessageSubmit(options.attrs, options.attrs.messageSubmit);
      }
    }

    /**
     * current entity changed event handler
     * @private
     */
    function _centerUpdateChatList() {
      $timeout.cancel(timerUpdateMentionAhead);
      timerUpdateMentionAhead = $timeout(function() {
        _setMentionList();
      }, 200);
    }

    /**
     * default mention list 설정함.
     * @private
     */
    function _setMentionList() {
      var currentEntity = currentSessionHelper.getCurrentEntity();
      var members = entityAPIservice.getMemberList(currentEntity);
      var currentMemberId = memberService.getMemberId();
      var mentionList = [];
      var member;
      var i;
      var len;

      if (members) {
        // 현재 topic의 members

        for (i = 0, len = members.length; i < len; i++) {
          member = _getCurrentTopicMember(members[i]);
          if (member && currentMemberId !== member.id && member.status === 'enabled') {
            // mention 입력시 text 입력 화면에 보여지게 될 text
            member.exViewName = '[@' + member.name + ']';

            // member 검색시 사용될 text
            member.exSearchName = member.name;
            mentionList.push(member);
          }
        }

        //if (mentionList && mentionList.length > 0) {
        //  // mention 전달이 가능한 member가 2명 이상이라면
        //  // 2명이상의 member 전체에게 mention 하는 all을 제공함

        mentionList = _.sortBy(mentionList, 'exSearchName');

        mentionList.unshift({
          // mention item 출력용 text
          name: MENTION_ALL_ITEM_TEXT,
          // mention target에 출력용 text
          exViewName : '[@' + MentionExtractor.MENTION_ALL + ']',
          // mention search text
          exSearchName: 'topic',
          u_photoThumbnailUrl: {
            smallThumbnailUrl: configuration.assets_url + 'assets/images/mention_profile_all.png'
          },
          id: entityId,
          type: 'room'
        });
        //}

        setMentions(mentionList);
      }
    }

    /**
     * mention ahead list 설정함.
     * @param mentionList
     */
    function setMentions(mentionList) {
      var mentionMap = {};

      // 중복 user name에 대한 처리
      _removeDuplicateMentionItem(mentionList, mentionMap);

      $scope.mentionList = mentionList;
      $scope._mentionMap = mentionMap;

      if (!$scope.hasOn && mentionList.length > 0) {
        // mention ahead에 출력할 item이 존재하고 event listener가 연결되지 않았다면 연결함
        $scope.hasOn = true;
        $scope.on();
      }
    }

    /**
     * mention list에 user name이 중복되는 member가 존재한다면 mention list에서는 존재하지만
     * mention은 전달하지 않도록 mention map에서 삭제함.
     * @param mentionList
     * @param mentionMap
     * @private
     */
    function _removeDuplicateMentionItem(mentionList, mentionMap) {
      var duplicateNameMentions = [];
      var mentionItem;
      var i;
      var len;

      for (i = 0, len = mentionList.length; i < len; ++i) {
        mentionItem = mentionList[i];
        if (duplicateNameMentions.indexOf(mentionItem.exViewName) < 0) {
          mentionMap[mentionItem.exViewName] = mentionItem;
          duplicateNameMentions.push(mentionItem.exViewName);
        } else {
          delete mentionMap[mentionItem.exViewName];
        }
      }
    }

    /**
     * 현재 topic의 member object를 전달함.
     * @param {number} memberId
     * @returns {*}
     * @private
     */
    function _getCurrentTopicMember(memberId) {
      return entityAPIservice.getEntityFromListById($originScope.totalEntities, memberId);
    }

    /**
     * mention 입력인지 처리할 value를 전달함.
     * @returns {*}
     */
    function getValue() {
      return $scope._value;
    }

    /**
     * mention 입력인지 처리할 value를 설정함.
     * @param {string} value
     */
    function setValue(value) {
      $scope._value = value;
    }

    /**
     * mention ahead가 출력중인지 여부.
     * @returns {boolean}
     */
    function isShowMentionahead() {
      return $model.$viewValue !== null;
    }

    /**
     * element의 cursor 기준으로 mention을 설정함.
     */
    function setMentionOnLive() {
      var value = getValue();
      var selectionBegin = _getSelection().begin;

      $scope.mention = MentionExtractor.getMentionOnCursor(value, selectionBegin);
    }

    /**
     * text 전체를 확인하여 mention 입력인 object를 전달함
     * @returns {{msg: string, mentions: Array}}
     */
    function getMentions() {
      var value = getValue();

      return MentionExtractor.getMentionAllForText(value, $scope._mentionMap, entityId);
    }

    /**
     * mention 입력인지 여부
     * @returns {boolean}
     */
    function isInputMention() {
      return $model.$viewValue !== null;
    }

    /**
     * mentionahead를 출력함
     */
    function showMentionahead() {
      var mention = $scope.mention;

      if (mention) {
        $model.$setViewValue(mention.match[2]);
      } else {
        // mention이 존재하지 않는다면 mentionahead를 출력하지 않음
        clearMention();
      }
    }

    /**
     * mention 입력을 clear함.
     */
    function clearMention() {
      $model.$setViewValue(null);
    }

    /**
     * element의 selection을 전달함.
     * @returns {{begin: Number, end: Number}}
     * @private
     */
    function _getSelection() {
      var ele = $scope.jqEle[0];

      return {
        begin: ele.selectionStart,
        end : ele.selectionEnd
      };
    }

    /**
     * element의 slection을 설정함.
     * @param {string|number} begin
     * @param {string|number} end
     * @private
     */
    function _setSelection(begin, end) {
      var ele = $scope.jqEle[0];

      end == null && (end = begin);
      ele.setSelectionRange(begin, end);
    }

    /**
     * mentionahead에서 특정 mention 선택 event callback
     * @param {object} $item
     */
    function onSelect($item) {
      var currentEntity;
      var msg;

      if ($item.name === MENTION_ALL_ITEM_TEXT) {
        // 모든 member에게 mention

        currentEntity = currentSessionHelper.getCurrentEntity();
        msg = $filter('translate')('@mention-all-confirm');

        msg = msg
          .replace('{{topicName}}', '\'' + currentEntity.name + '\'')
          .replace('{{topicParticipantsCount}}', entityAPIservice.getMemberLength(currentEntity));

        if ($window.confirm(msg)) {
          _onSelect($item);
        }
      } else {
        _onSelect($item);
      }
    }

    /**
     * mentionahead에서 특정 mention 선택 event callback
     * @param {object} $item
     * @private
     */
    function _onSelect($item) {
      var mention = $scope.mention;
      var mentionTarget = $item.exViewName;
      var extraText = ' ';
      var text;
      var selection;

      // mention 입력 후 text 재설정
      text = mention.preStr.replace(new RegExp(mention.match[1] + '$'), mentionTarget) + extraText + mention.sufStr;
      $scope.jqEle.val(text);
      setValue(text);

      selection = mention.offset + mentionTarget.length + extraText.length;

      // mention 입력 후 element selection 위치 설정
      setTimeout(function() {
        _setSelection(selection);
      }, 10);

      // mention clear
      clearMention();
    }

    /**
     * mentionahead중 입력한 값과 match event callback
     * @param {array} matches
     */
    function onMatches(matches) {
      if (!matches.length) {
        // 입력값에 match 되는 item이 존재하지 않는다면 mention clear
        clearMention();
      }
    }

    /**
     * hook message 전달 함수
     * message 입력하는 element에서 입력한 값을 mention ahead에서 처리하므로
     * mention 입력하는 동안에는 message submit 수행되지 않도록 함.
     * @param {object} attrs
     * @param {function} originMessageSubmit
     * @private
     */
    function _hookMessageSubmit(attrs, originMessageSubmit) {
      attrs.messageSubmit = function() {
        if (!that.isInputMention() || !$scope.hasOn) {
          $originScope.$eval(originMessageSubmit);

          // submit 후 value 초기화
          setValue(null);
        }
      };
    }
  }
}());
