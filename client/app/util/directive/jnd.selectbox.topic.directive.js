/**
 * @fileoverview compile 시 { } syntax 를 무시하는 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndSelectboxTopic', jndSelectboxTopic);

  function jndSelectboxTopic(EntityMapManager, TopicFolderModel, publicService, jndKeyCode, jndPubSub) {
    return {
      restrict: 'AE',
      link: link,
      replace: true,
      scope: {},
      templateUrl: 'app/util/directive/jnd.selectbox.topic.html'
    };

    function link(scope, el, attrs) {
      var _jqInput = el.find('input');
      var _lastKeyword = '';
      scope.onKeyUp = onKeyUp;
      //scope.onKeyDown = onKeyDown;
      scope.onClick = onClick;
      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        scope.isShown = false;
        scope.folderData = TopicFolderModel.getFolderData();
        scope.memberData = _getMemberData();
        scope.searchList = [];
        _jqInput.focus();
      }

      /**`
       * member data 를 반환한다
       * @returns {{enabledList: Array, disabledList: Array}}
       * @private
       */
      function _getMemberData() {
        var memberMap = EntityMapManager.getMap('member');
        var enabledList = [];
        var disabledList = [];
        _.each(memberMap, function(member) {

          if (publicService.isDisabledMember(member)) {
            disabledList.push(member);
          } else {
            enabledList.push(member)
          }
        });
        return {
          enabledList: enabledList,
          disabledList: disabledList
        };
      }

      function onClick() {
        scope.isShown = !scope.isShown;
      }
      /**
       * keyup 이벤트 핸들러
       */
      function onKeyUp(keyEvent) {
        _search($(keyEvent.target).val());
      }

      /**
       * keydown 이벤트 핸들러
       * @param {Event} keyEvent
       */
      //function onKeyDown(keyEvent) {
      //  var keyCode = keyEvent.keyCode;
      //
      //  if (jndKeyCode.match('ESC', keyCode)) {
      //  } else if (jndKeyCode.match('ENTER', keyCode)) {
      //  } else if (jndKeyCode.match('DOWN_ARROW', keyCode)) {
      //
      //    keyEvent.preventDefault();
      //    jndPubSub.pub('custom-focus:focus-next');
      //  } else if (jndKeyCode.match('UP_ARROW', keyCode)) {
      //    keyEvent.preventDefault();
      //    jndPubSub.pub('custom-focus:focus-prev');
      //  }
      //}

      /**
       * 메시지를 검색한다
       * @param {string} keyword
       * @private
       */
      function _search(keyword) {
        var start;
        var result = [];
        keyword = _.trim(keyword);

        if (!_isSameKeyword(keyword)) {
          _lastKeyword = keyword;
          if (keyword) {
            keyword = keyword.toLowerCase();
            _.each(EntityMapManager.getMap('joined'), function (entity) {
              start = entity.name.toLowerCase().search(keyword);
              if (start !== -1) {
                result.push({
                  entity: entity,
                  name: _highlight(entity.name, start, keyword.length)
                });
              }
            });
            _.each(EntityMapManager.getMap('member'), function (entity) {
              start = entity.name.toLowerCase().search(keyword);
              if (start !== -1) {
                result.push({
                  entity: entity,
                  name: _highlight(entity.name, start, keyword.length)
                });
              }
            });
          }
          scope.searchList = result;
        }
      }

      function _isSameKeyword(keyword) {
        return _lastKeyword !== keyword;
      }
      /**
       * 검색한 message 를 highlight 처리한다
       * @param {string} string - 검색 대상 string
       * @param {number} start - 검색할 string 이 검출된 시작 위치
       * @param {number} length - 검색할 string 의 길이
       * @returns {string} - highlight 처리된 결과
       * @private
       */
      function _highlight(string, start, length) {
        var strArr = [
          string.substring(0, start),
          '<b>',
          string.substring(start, start + length),
          '</b>',
          string.substring(start + length)
        ];
        return strArr.join('');
      }
    }
  }
})();
