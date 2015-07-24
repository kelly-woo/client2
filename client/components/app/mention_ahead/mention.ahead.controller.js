/**
 * @fileoverview mention ahead controller
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .controller('MentionaheadCtrl', MentionaheadCtrl);

  /* @ngInject */
  function MentionaheadCtrl($parse, entityAPIservice) {
    var that = this;
    var $originScope;
    var $scope;
    var $model;

    // /(?:(?:^|\s)(?:[^\[]?)([@\uff20]((?:[^@\uff20]|[\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?\[\]\^_{|}~\$][^ ]){0,30})))$/; 특수문자 노 상관이므로 아래거
    var regxLiveSearchTextMentionMarkDown = /(?:(?:^|\s)(?:[^\[]?)([@\uff20]((?:[^@\uff20]|.[^ ]){0,30})))$/;
    var rStrContSearchTextMentionMarkDown = '\[\]';

    that.init = init;

    that.getValue = getValue;
    that.setValue = setValue;

    that.getMentions = getMentions;
    that.resetMention = resetMention;

    that.setMentionLive = setMentionLive;
    that.hasMentionLive = hasMentionLive;

    that.isShowMentionahead = isShowMentionahead;
    that.showMentionahead = showMentionahead;

    function init(options) {
      var fn;

      $originScope = options.originScope;
      $scope = options.mentionScope;
      $model = options.mentionModel;
      $scope.jqEle = options.jqEle;

      $scope.onSelect = onSelect;
      $scope.onMatches = onMatches;

      fn = options.attrs.mentionaheadData && $parse(options.attrs.mentionaheadData);
      if (fn) {
        $scope.mentionList = fn($originScope, {
          $mentionScope: $scope
        });
      } else {
        // current entity change event handler에서 한번 mention list 설정
        $scope.$on('onCurrentEntityChanged', function(event, param) {
          //_setMentionList(originScope.currentEntity);
          _setMentionList(param);
        });

        _setMentionList($originScope.currentEntity);
      }
    }

    function _setMentionList(currentEntity) {
      var mentionList = [];
      var members = currentEntity.ch_members || currentEntity.pg_members;
      var member;
      var i;
      var len;

      // 현재 topic의 members
      for (i = 0, len = members.length; i < len; i++) {
        member = _getCurrentTopicMembers(members[i]);
        if (member && member.status === 'enabled') {
          member.exNameMention = '@' + member.name;
          mentionList.push(member);
        }
      }

      $scope.mentionList = _.sortBy(mentionList, 'name');
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
        resetMention();
      }
    }

    function resetMention() {
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
    originSelectActive.call($parent, matchIdx);

    function getMentions() {
      var regxMention = new RegExp(rStrMention, 'g');
      var value = getValue();
      var mention;

      console.log('getMention ::: ', value);
      while(regxMention.exec(value)) {
        mention = RegExp.$1;

        console.log('mention ::: ', mention);
      }
    }

    function onSelect($item) {
      var mention = $scope.mention;
      var mentionTarget = '[@' + $item.name + '] ';
      var text;
      var selection;

      text = mention.preStr.replace(new RegExp(mention.match[1] + '$'), mentionTarget) + mention.sufStr;
      $scope.jqEle.val(text);
      setValue(text);

      selection = mention.offset + mentionTarget.length;
      _selection(selection);

      resetMention();
    }

    function onMatches(matches) {
      if (!matches.length) {
        resetMention();
      }
    }
  }
}());
