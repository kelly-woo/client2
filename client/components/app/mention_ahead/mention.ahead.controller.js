/**
 * @fileoverview mention ahead controller
 */
(function() {
  'use strict';

  angular
    .module('app.mention')
    .controller('MentionAheadController', MentionAheadController);

  /* @ngInject */
  function MentionAheadController(entityAPIservice) {
    var that = this;
    var $originScope;
    var $scope;
    var $model;
    ///(?:(?:^|\s)(?:[\[]?)([@\uff20]((?:[^@\uff20]|[\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?\[\]\^_{|}~\$][^ ]){0,30})))$/i
    var regxTextMentionMark = /(?:(?:^|\s)(?:[^\[]?)([@\uff20]((?:[^@\uff20]|[\!'#%&'\(\)*\+,\\\-\.\/:;<=>\?\[\]\^_{|}~\$][^ ]){0,30})))$/;
    var rStrMention = '(?:^|\s)(?:[@\uff20])([^@\uff20 ]{0,30})';

    that.init = init;

    that.getValue = getValue;
    that.setValue = setValue;

    that.getMentions = getMentions;

    that.setMentionLive = setMentionLive;
    that.hasMentionLive = hasMentionLive;

    that.isShowMentionAhead = isShowMentionAhead;
    that.showMentionAhead = showMentionAhead;

    function init(originScope, mentionScope, mentionTarget, jqEle) {
      $originScope = originScope;
      $scope = mentionScope;
      $model = mentionTarget;

      $scope.jqEle = jqEle;
      $scope.mentionList = [];
      $scope.onSelect = onSelect;
      $scope.onMatches = onMatches;
      //$scope.mentionTarget = '';

      //// current entity change event handler에서 한번 mention list 설정
      $scope.$on('onCurrentEntityChanged', function(event, param) {
        //_setMentionList(originScope.currentEntity);
        _setMentionList(param);
      });
      _setMentionList(originScope.currentEntity);
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
        member.exNameMention = '@' + member.name;
        mentionList.push(member);
      }

      //// 현재 topic에 포함되지 않고 enabled 상태의 members
      //members = $originScope.memberList;
      //for (i = 0, len = members.length; i < len; i++) {
      //  member = members[i];
      //  if (member.status === 'enabled') {
      //    memberList.push(member);
      //  }
      //}

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

    function isShowMentionAhead() {
      return $model.$viewValue !== null;
    }

    function setMentionLive() {
      var selectionBegin = _selection().begin;
      var value = getValue();
      var preStr;
      var match;
      var mention;

      preStr = value.substring(0, selectionBegin);
      if (match = regxTextMentionMark.exec(preStr)) {
        mention = {
          preStr: preStr,
          sufStr: value.substring(selectionBegin),
          match: match,
          offset: selectionBegin - match[1].length,
          length: match.length
        };
      }

      $scope.mention = mention;
    }

    function hasMentionLive() {
      return $model.$viewValue !== null;
    }

    function showMentionAhead() {
      var mention = $scope.mention;

      if (mention) {
        $model.$setViewValue(mention.match[2]);
      } else {
        _resetMention();
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

      _resetMention();
    }

    function onMatches(matches) {
      if (!matches.length) {
        _resetMention();
      }
    }

    function _resetMention() {
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

  }
}());
