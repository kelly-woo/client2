/**
 * @fileoverview compile 시 { } syntax 를 무시하는 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndSelectboxMember', jndSelectboxMember);

  function jndSelectboxMember(EntityMapManager, TopicFolderModel, publicService, jndKeyCode, jndPubSub, JndUtil) {
    return {
      restrict: 'AE',
      link: link,
      replace: true,
      scope: {
        selectedValue: '=jndDataModel',
        list: '=jndDataList'
      },
      templateUrl: 'app/util/directive/custom-selectbox/jnd.selectbox.member.html'
    };

    function link(scope, el, attrs) {
      var _lastKeyword = '';
      scope.onKeyUp = onKeyUp;
      scope.toggleShow = toggleShow;
      scope.onChange = onChange;
      scope.toggleDisabled = toggleDisabled;
      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        scope.isShown = false;
        _initializeData();
        _attachEvents();
        _attachDomEvents();
      }

      function _onDestroy() {
        _detachDomEvents();
      }

      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
      }

      function _attachDomEvents() {
        $(document).on('mousedown', _onMouseDownDocument);
      }

      function _detachDomEvents() {
        $(document).off('mousedown', _onMouseDownDocument);
      }

      function _onMouseDownDocument(clickEvent) {
        if (!$(clickEvent.target).closest('._selectbox').is(el)) {
          JndUtil.safeApply(scope, function() {
            el.find('.custom-select-box').hide();
            scope.isShown = false;
          });
        }
      }

      function _getSelectedName() {
        var selectedEntity;
        selectedEntity = _.find(_getMembers(), function(member) {
          return member.id === scope.selectedValue;
        });
        return selectedEntity ? selectedEntity.name : '';
      }

      function _initializeData() {
        scope.memberData = _getMemberData();
        scope.searchList = [];
        scope.isShowDisabled = _isDisabledMemberSelected();
        scope.selectedName = _getSelectedName();
      }

      function _isDisabledMemberSelected() {
        return !!_.find(scope.memberData.disabledList, function(member) {
          return member.id === scope.selectedValue;
        });
      }

      function onChange(targetScope) {
        if (targetScope.item) {
          scope.selectedName = targetScope.item.name;
          scope.selectedValue = targetScope.item.id;
        } else {
          scope.selectedName = '';
          scope.selectedValue = null;
        }
        scope.isShown = false;
      }

      function toggleDisabled() {
        scope.isShowDisabled = !scope.isShowDisabled;
      }

      /**
       * member data 를 반환한다
       * @returns {{enabledList: Array, disabledList: Array}}
       * @private
       */
      function _getMemberData() {
        var members = _getMembers();
        var enabledList = [];
        var disabledList = [];
        _.each(members, function(member) {
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

      function _getMembers() {
        return scope.list  || EntityMapManager.getMap('member');
      }
      function toggleShow() {
        scope.isShown = !scope.isShown;
        _initializeData();
      }
      /**
       * keyup 이벤트 핸들러
       */
      function onKeyUp(keyEvent) {
        _search($(keyEvent.target).val());
      }

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
            _.each(_getMembers(), function (entity) {
              start = entity.name.toLowerCase().search(keyword);
              if (start !== -1) {
                entity.extSearchName = _highlight(entity.name, start, keyword.length);
                result.push(entity);
              }
            });
          }
          scope.searchList = result;
        }
      }

      function _isSameKeyword(keyword) {
        return _lastKeyword === keyword;
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
