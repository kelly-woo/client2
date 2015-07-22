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

    var regxTextMentionMark = /(?:(?:^|\s)(?:[\[]?)(?:[@\uff20])((?:[^ ]|[.,+*?$|#{}()\^\-\[\]\\/!%'"~=<>_:;][^ ]){0,30}))$/;
    var rStrMention = '(?:^|\s)(?:[@\uff20])([^@\uff20 ]{0,30})';

    that.init = init;

    that.getValue = getValue;
    that.setValue = setValue;

    that.getMentions = getMentions;

    that.getMentionLive = getMentionLive;
    that.showMentionAhead = showMentionAhead;

    that.selection = selection;

    function init(originScope, mentionScope, mentionTarget, jqEle) {
      $originScope = originScope;
      $scope = mentionScope;
      $model = mentionTarget;

      $scope.jqEle = jqEle;
      $scope.mentionList = [];
      $scope.onSelect = onSelect;
      //$scope.mentionTarget = '';

      // current entity change event handler에서 한번 mention list 설정
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
        member = members[i];
        mentionList.push(_getCurrentTopicMembers(member));
      }

      // 현재 topic에 포함되지 않고 enabled 상태의 members
      members = $originScope.memberList;
      for (i = 0, len = members.length; i < len; i++) {
        member = members[i];
        if (member.status === 'enabled') {
          mentionList.push(member);
        }
      }

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

    function getMentionLive(selectionBegin) {
      var value = getValue();
      var preStr;
      var match;
      var ret;

      preStr = value.substring(0, selectionBegin);
      if (match = regxTextMentionMark.exec(preStr)) {
        ret = {
          preStr: preStr,
          sufStr: value.substring(selectionBegin),
          match: match[0],
          offset: selectionBegin - match.length,
          length: match.length
        };
      }

      return ret;
    }

    function showMentionAhead(mention) {
      $model.$setViewValue(mention.match);
    }

    function onSelect() {
      var selection = selection();


      $model.$setViewValue('');

    }

    function selection(begin, end) {
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
  }
}());
