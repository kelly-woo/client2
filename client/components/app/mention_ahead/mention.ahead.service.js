/**
 * @fileoverview extract mention
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .service('MentionExtractor', MentionExtractor);

  /* @ngInject */
  function MentionExtractor($filter, memberService, EntityMapManager, configuration, jndKeyCode) {
    var that = this;

    var regxLiveSearchTextMentionMarkDown = /(?:(?:^|\s)(?:[^\[]?)([@\uff20]((?:[^@\uff20]|[\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?\[\]\^_{|}~\$][^ ]){0,30})))$/;
    var rStrContSearchTextMentionMarkDown = '\\[(@([^\\[]|.[^\\[]{0,30}))\\]';
    var regxKr = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;

    that.MENTION_ALL = 'all';
    that.MENTION_ALL_ITEM_TEXT = $filter('translate')('@mention-all');

    that.getMentionOnCursor = getMentionOnCursor;
    that.getMentionAllForText = getMentionAllForText;
    that.getSingleMentionItems = getSingleMentionItems;
    that.getMentionList = getMentionList;

    /**
     * cursor 기준으로 mention data를 찾아 전달함.
     * @param {object} event
     * @param {string} fullText
     * @param {number} begin - cursor 시작점
     * @returns {*}
     */
    function getMentionOnCursor(event, fullText, begin) {
      var preStr;
      var match;
      var mention;
      var nextChar;

      if (fullText != null) {

        // keyup 이벤트로 값 입력시 cursor의 다음 문자가 한글이라면 cursor 값을 1증가 시킴.
        // 한글은 '@박현' 입력시 '박'자와 '현'자 사이에 cursor가 위치하므로 올바른 mention list를
        // 출력하지 못하기 때문에 따로 처리함.
        if (event.type === 'keyup' &&
            !(jndKeyCode.match('LEFT_ARROW', event.which) || jndKeyCode.match('UP_ARROW', event.which) ||  jndKeyCode.match('RIGHT_ARROW', event.which) ||  jndKeyCode.match('DOWN_ARROW', event.which))) {
          nextChar = fullText.substring(begin, begin + 1);
          if (regxKr.test(nextChar)) {
            begin += 1;
          }
        }

        // cursor 기준 앞에 입력된 text를 check
        preStr = fullText.substring(0, begin);

        if (match = regxLiveSearchTextMentionMarkDown.exec(preStr)) {
          mention = {
            preStr: preStr,
            sufStr: fullText.substring(begin),
            match: match,
            offset: begin - match[1].length,
            length: match[1].length
          };
        }
      }

      return mention;
    }

    /**
     * text 전체를 확인하여 mention 입력인 object를 전달함
     * @param {string} fullText
     * @param {object} mentionMap - mention 가능 member name
     * @param {number} entityId
     * @returns {{msg: string, mentions: Array}}
     */
    function getMentionAllForText(fullText, mentionMap, entityId) {
      var regxMention = new RegExp(rStrContSearchTextMentionMarkDown, 'g');
      var msg = '';
      var preStr;
      var match;
      var mentions = [];
      var data;
      var beginIndex = 0;
      var lastIndex;
      var offset = 0;

      // 입력값 trim
      fullText && (fullText = fullText.trim());

      while(match = regxMention.exec(fullText)) {
        if (mentionMap[match[0]]) {
          lastIndex = regxMention.lastIndex;

          preStr = fullText.substring(beginIndex, lastIndex).replace(match[0] , match[1]);
          msg = msg + preStr;

          beginIndex = lastIndex;
          data = {
            offset: lastIndex - match[0].length - offset,
            length: match[1].length
          };
          offset += match[0].length - match[1].length;

          if (match[2] === that.MENTION_ALL) {
            // 모든 member에게 mention

            data.id = parseInt(entityId, 10);
            data.type = 'room';
          } else {
            // 특정 member에게 mention

            data.id = parseInt(mentionMap[match[0]].id, 10);
            data.type = 'member';
          }

          mentions.push(data);
        }
      }

      if (mentions.length > 0) {
        return {
          msg: msg + fullText.substring(beginIndex),
          mentions: mentions
        };
      }
    }

    /**
     * mention list에 user name이 중복되지 않는 memtion item을 선별하여 mention map을 전달함.
     * @param {array} mentionList
     * @private
     */
    function getSingleMentionItems(mentionList) {
      var mentionMap = {};
      var duplicateNameMentions = [];
      var mentionItem;
      var i;
      var len;

      for (i = 0, len = mentionList.length; i < len; ++i) {
        mentionItem = mentionList[i];
        if (duplicateNameMentions.indexOf(mentionItem.extViewName) < 0) {
          mentionMap[mentionItem.extViewName] = mentionItem;
          duplicateNameMentions.push(mentionItem.extViewName);
        } else {
          delete mentionMap[mentionItem.extViewName];
        }
      }

      return mentionMap;
    }

    /**
     * member 목록에 해당하는 mention 목록을 전달함.
     * @param {array} members
     * @param {number} entityId
     * @returns {Array}
     */
    function getMentionList(members, entityId) {
      var currentMemberId = memberService.getMemberId();
      var mentionList = [];
      var member;
      var i;
      var len;

      if (members) {
        // 현재 topic의 members

        for (i = 0, len = members.length; i < len; i++) {
          member = EntityMapManager.get('member', members[i]);
          if (member && currentMemberId !== member.id && member.status === 'enabled') {
            // mention 입력시 text 입력 화면에 보여지게 될 text
            member.extViewName = '[@' + member.name + ']';

            // member 검색시 사용될 text
            member.extSearchName = member.name;
            mentionList.push(member);
          }
        }

        //if (mentionList && mentionList.length > 0) {
        //  // mention 전달이 가능한 member가 2명 이상이라면
        //  // 2명이상의 member 전체에게 mention 하는 all을 제공함

        mentionList = _.sortBy(mentionList, function (item) {
          return item.name.toLowerCase();
        });

        if (entityId != null) {
          mentionList.unshift({
            // mention item 출력용 text
            name: that.MENTION_ALL_ITEM_TEXT,
            // mention target에 출력용 text
            extViewName : '[@' + that.MENTION_ALL + ']',
            // mention search text
            extSearchName: 'all',
            u_photoThumbnailUrl: {
              smallThumbnailUrl: configuration.assets_url + 'assets/images/mention_profile_all.png'
            },
            id: entityId,
            type: 'room'
          });
        }
        //}
      }

      return mentionList;
    }
  }
}());
