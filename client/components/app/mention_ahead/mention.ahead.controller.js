/**
 * @fileoverview mention ahead controller
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .controller('MentionaheadCtrl', MentionaheadCtrl);

  /* @ngInject */
  function MentionaheadCtrl($state, $parse, entityAPIservice, memberService, configuration) {
    var that = this;
      //
    // /([@])([a-zA-Z0-9_ ]{0,30})$/.exec('@mark @park park @qweqwe @wfkwelfj @서 포트')
    ///????-?/.exec()
    ///(^|\s([@\uff20]((.){0,30})))$/.exec('@qwe @mark @qweqwe');
    ///(?:^|[^a-zA-Z0-9_!#$%&*@＠]|(?:^|[^a-zA-Z0-9_+~.-])(?:rt|RT|rT|Rt):?)([@])([a-zA-Z0-9_ ]{1,20})(\/[a-zA-Z][a-zA-Z0-9_\-]{0,24})?$/.exec('@mark @park park @qweqwe')
    ///(^|\s)([^\[])([@\uff20]((?:[a-z ]){0,30}))$/.exec('[@mark [@park park @qweqwe @wfkwel@fj')
    // /(?:(?:^|\s)(?:[^\[]?)([@\uff20]((?:[^@\uff20]|[\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?\[\]\^_{|}~\$][^ ]){0,30})))$/; 특수문자 노 상관이므로 아래거
    var regxLiveSearchTextMentionMarkDown = /(?:(?:^|\s)(?:[^\[]?)([@\uff20]((?:[^@\uff20]|[\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?\[\]\^_{|}~\$][^ ]){0,30})))$/;
    var rStrContSearchTextMentionMarkDown = '\\[(@([^\\[]|.[^\\[]{0,30}))\\]';

    var MENTION_ALL = 'ALL';
    var MENTION_ALL_VIEW_NAME = MENTION_ALL + '@';
    var entityId = $state.params.entityId;

    var $originScope;
    var $scope;
    var $model;

    that.init = init;

    that.getValue = getValue;
    that.setValue = setValue;

    that.setMentions = setMentions;
    that.clearMention = clearMention;

    that.setMentionLive = setMentionLive;
    that.hasMentionLive = hasMentionLive;

    that.isShowMentionahead = isShowMentionahead;
    that.showMentionahead = showMentionahead;

    function init(options) {
      var fn;

      $originScope = options.originScope;
      $originScope.getMentionAllForText = getMentionAllForText;

      $scope = options.mentionScope;
      $model = options.mentionModel;
      $scope.jqEle = options.jqEle;

      $scope.onSelect = onSelect;
      $scope.onMatches = onMatches;

      $scope.members = options.members;

      fn = options.attrs.mentionaheadData && $parse(options.attrs.mentionaheadData);
      if (fn) {
        $scope.mentionList = fn($originScope, {
          $mentionScope: $scope,
          $mentionCtrl: that
        });
      } else {
        // current entity change event handler에서 한번 mention list 설정
        $scope.$on('onCurrentEntityChanged', function(event, param) {
          _setMentionList(param);
        });

        _setMentionList();
      }

      if (options.attrs.messageSubmit) {
        _hookMessageSubmit(options.attrs, options.attrs.messageSubmit);
      }
    }

    function _setMentionList() {
      var mentionList = [];
      var currentMemberId = memberService.getMemberId();
      var members = $scope.members;
      var member;
      var i;
      var len;

      // 현재 topic의 members
      for (i = 0, len = members.length; i < len; i++) {
        member = _getCurrentTopicMembers(members[i]);
        if (member && currentMemberId !== member.id && member.status === 'enabled') {
          member.exViewName = '[@' + member.name + ']';
          member.exSearchName = member.name;
          mentionList.push(member);
        }
      }

      setMentions(mentionList, function() {
        if (mentionList && mentionList.length > 0) {
          mentionList.push({
            // mention item 출력용 text
            name: MENTION_ALL + ' - Notify all members in this topic',
            // mention target에 출력용 text
            exViewName : '[@' + MENTION_ALL_VIEW_NAME + ']',
            // mention search text
            exSearchName: 'topic',
            u_photoThumbnailUrl: {
              smallThumbnailUrl: configuration.assets_url + 'assets/images/mention_profile_all.png'
            },
            id: entityId,
            type: 'room'
          });
        }

        return _.sortBy(mentionList, 'exSearchName');
      });
    }

    function setMentions(mentionList, fn) {
      var mentionMap = {};
      var mentionItem;
      var duplicateNameMentions = [];
      var i;
      var len;

      mentionList = fn ? fn(mentionList): mentionList;

      for (i = 0, len = mentionList.length; i < len; ++i) {
        mentionItem = mentionList[i];
        if (duplicateNameMentions.indexOf(mentionItem.exViewName) < 0) {
          mentionMap[mentionItem.exViewName] = mentionItem;
          duplicateNameMentions.push(mentionItem.exViewName);
        } else {
          delete mentionMap[mentionItem.exViewName];
        }
      }

      $scope._mentionMap = mentionMap;
      $scope.mentionList = mentionList;
    }

    function _getCurrentTopicMembers(member) {
      return entityAPIservice.getEntityFromListById($originScope.totalEntities, member);
    }

    function getValue() {
      return $scope._value;
    }

    function setValue(value) {
      $scope._value = value;
    }

    function isShowMentionahead() {
      return $model.$viewValue !== null;
    }

    function setMentionLive() {
      var selectionBegin = _selection().begin;
      var value = getValue();
      var preStr;
      var match;
      var mention;

      if (value != null) {
        //console.log('selection begin ::: ', selectionBegin);
        preStr = value.substring(0, selectionBegin);
        //console.log('selection value ::: ', preStr);
        if (match = regxLiveSearchTextMentionMarkDown.exec(preStr)) {
          //console.log('mention ::: ', match);
          mention = {
            preStr: preStr,
            sufStr: value.substring(selectionBegin),
            match: match,
            offset: selectionBegin - match[1].length,
            length: match.length
          };
        }
      }

      $scope.mention = mention;
    }

    function hasMentionLive() {
      return $model.$viewValue !== null;
    }

    function showMentionahead() {
      var mention = $scope.mention;

      if (mention) {
        //console.log('show mention ahead ::: ', mention.match[2], $model.$viewValue);
        $model.$setViewValue(mention.match[2]);
      } else {
        clearMention();
      }
    }

    function clearMention() {
      $model.$setViewValue(null);
    }

    function _selection(begin, end) {
      var ele = $scope.jqEle[0];

      if (_.isNumber(begin)) {	// set
        end == null && (end = begin);
        ele.setSelectionRange(begin, end);
      } else {		// get{
        begin = ele.selectionStart;
        end = ele.selectionEnd;

        return {
          begin: begin,
          end: end
        };
      }
    }

    function getMentionAllForText() {
      var regxMention = new RegExp(rStrContSearchTextMentionMarkDown, 'g');
      var value = getValue();
      var msg = '';
      var preStr;
      var match;
      var mentions = [];
      var data;
      var beginIndex = 0;
      var lastIndex;
      var offset = 0;

      while(match = regxMention.exec(value)) {
        if ($scope._mentionMap[match[0]]) {
          lastIndex = regxMention.lastIndex;

          preStr = value.substring(beginIndex, lastIndex).replace(new RegExp( '\\[' + match[1]+ '\\]' + '$'), match[1]);
          msg = msg + preStr;

          beginIndex = lastIndex;
          data = {
            offset: lastIndex - match[0].length - offset,
            length: match[1].length
          };
          offset += match[0].length - match[1].length;

          if (match[2] === MENTION_ALL_VIEW_NAME) {
            data.id = parseInt(entityId, 10);
            data.type = 'room';
          } else {
            data.id = parseInt($scope._mentionMap[match[0]].id, 10);
            data.type = 'member';
          }

          mentions.push(data);
        }
      }

      if (mentions.length > 0) {
        return {
          msg: msg + value.substring(beginIndex),
          mentions: mentions
        };
      }
    }

    function onSelect($item) {
      var mention = $scope.mention;
      var mentionTarget = $item.exViewName;
      var text;
      var selection;

      text = mention.preStr.replace(new RegExp(mention.match[1] + '$'), mentionTarget) + mention.sufStr;
      $scope.jqEle.val(text);
      setValue(text);

      selection = mention.offset + mentionTarget.length;
      _selection(selection);

      clearMention();
    }

    function onMatches(matches) {
      if (!matches.length) {
        clearMention();
      }
    }

    function _hookMessageSubmit(attrs, originMessageSubmit) {
      attrs.messageSubmit = function() {
        if (!that.hasMentionLive()) {
          $originScope.$eval(originMessageSubmit);
        }
      };
    }
  }
}());
