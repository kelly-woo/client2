/**
 * @fileoverview room 커스텀 셀렉트박스 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndSelectboxRoom', jndSelectboxRoom);

  function jndSelectboxRoom($filter, EntityMapManager, TopicFolderModel, publicService, JndUtil) {
    return {
      restrict: 'AE',
      link: link,
      replace: true,
      scope: {
        selectedValue: '=jndDataModel',
        callback: '=jndSelectboxRoom',
        list: '=jndDataList',
        isDisabled: '=jndDataIsDisabled',
        hasAll: '@jndHasAll',
        hasDisabled: '@jndHasDisabled',
        onlyTopics: '@jndOnlyTopics'
      },
      templateUrl: 'app/util/directive/custom-selectbox/jnd.selectbox.room.html'
    };

    function link(scope, el, attrs) {
      var _lastKeyword = '';
      var _filterMap;
      scope.close = close;
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
        scope.searchKeyword = '';
        _initializeFilter();
        _initializeData();
        _attachEvents();
        _attachDomEvents();
      }

      /**
       * selectbox 를 닫는다
       */
      function close() {
        el.find('.custom-select-box').hide();
        scope.isShown = false;
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvents();
      }

      /**
       * 이벤트 바인딩 한다
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
        scope.$watch('selectedValue', _setSelectedName);
      }

      /**
       * DOM 이벤트 바인딩
       * @private
       */
      function _attachDomEvents() {
        $(document).on('mousedown', _onMouseDownDocument);
      }

      /**
       * DOM 이벤트 바인딩 해제
       * @private
       */
      function _detachDomEvents() {
        $(document).off('mousedown', _onMouseDownDocument);
      }

      /**
       * select 된 name 으로 노출한다
       * @private
       */
      function _setSelectedName() {
        scope.selectedName = _getSelectedName();
      }

      /**
       * Document 의 mouse-down 이벤트 핸들러
       * @param {Event} clickEvent
       * @private
       */
      function _onMouseDownDocument(clickEvent) {
        if (!$(clickEvent.target).closest('._selectbox').is(el)) {
          JndUtil.safeApply(scope, function() {
            close();
          });
        }
      }

      /**
       * 현재 선택된 item 의 name 값을 반환한다
       * @returns {*}
       * @private
       */
      function _getSelectedName() {
        var selectedEntity = _.find(_getAllEntities(), function(entity) {
          return entity.id === scope.selectedValue;
        });
        return selectedEntity ? selectedEntity.name : $filter('translate')('@option-all-rooms');
      }

      /**
       * Data 를 초기화 한다
       * @private
       */
      function _initializeData() {
        scope.folderData = _getFolderData();
        scope.memberData = _getMemberData();
        scope.searchList = [];
        scope.isShowDisabled = _isDisabledMemberSelected();
        scope.selectedName = _getSelectedName();
      }

      /**
       * filter 를 초기화한다
       * @private
       */
      function _initializeFilter() {
        var list = scope.list;
        if (list) {
          _filterMap = {};
          _.forEach(list, function(entity) {
            _filterMap[entity.id] = true;
          });
        }
      }

      /**
       * filter 를 적용한 folder hierarchy 데이터 형태로 가공한다.
       * @returns {*|{}}
       * @private
       */
      function _getFolderData() {
        var folderData = TopicFolderModel.getFolderData();
        var entityList;
        var folderList = [];
        if (_filterMap) {
          _.forEach(folderData.folderList, function(folder) {
            entityList = [];
            _.forEach(folder.entityList, function(entity) {
              if (_filterMap[entity.id]) {
                entityList.push(entity);
              }
            });
            if (entityList.length) {
              folderList.push({
                name: folder.name,
                entityList: entityList
              });
            }
          });
          folderData = {
            folderList: folderList
          };
        }
        return folderData;
      }

      /**
       * change 이벤트 핸들러
       * @param targetScope
       */
      function onChange(targetScope) {
        if (targetScope.item) {
          scope.selectedName = targetScope.item.name;
          scope.selectedValue = targetScope.item.id;
        } else {
          scope.selectedName = $filter('translate')('@option-all-rooms');
          scope.selectedValue = null;
        }

        if (_.isFunction(scope.callback)) {
          scope.callback();
        }
      }

      /**
       * 차단 사용자 노출 여부를 toggle 한다
       */
      function toggleDisabled() {
        scope.isShowDisabled = !scope.isShowDisabled;
      }

      /**
       * (차단 사용자 리스트를 노출할지 여부 확인을 위해)
       * 차단 사용자가 선택되었는지 여부를 반환한다.
       * @returns {boolean}
       * @private
       */
      function _isDisabledMemberSelected() {
        return !!_.find(scope.memberData.disabledList, function(member) {
          return member.id === scope.selectedValue;
        });
      }

      /**
       * member data 를 반환한다
       * @returns {{enabledList: Array, disabledList: Array}}
       * @private
       */
      function _getMemberData() {
        var memberMap = EntityMapManager.getMap('member');
        var enabledList = [];
        var disabledList = [];
        _.each(memberMap, function(member) {
          if (!_filterMap || (_filterMap && _filterMap[member.id])) {
            if (publicService.isDisabledMember(member)) {
              disabledList.push(member);
            } else {
              enabledList.push(member)
            }
          }
        });
        return {
          enabledList: enabledList,
          disabledList: disabledList
        };
      }

      /**
       * select 레이어의 노출 여부를 toggle 한다
       */
      function toggleShow() {
        if (!scope.isDisabled) {
          scope.isShown = !scope.isShown;
          _initializeData();
        }
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
            _.each(_getAllEntities(), function (entity) {
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

      /**
       * filter 에 걸린 모든 entity 들을 반환한다
       * @returns {*}
       * @private
       */
      function _getAllEntities() {
        var allEntities = _.extend(
          EntityMapManager.getMap('joined'),
          EntityMapManager.getMap('private'),
          EntityMapManager.getMap('member')
        );
        if (_filterMap) {
          allEntities = _.filter(allEntities, function(entity) {
            return _filterMap[entity.id];
          });
        }
        return allEntities;
      }

      /**
       * 동일 keyword 인지 여부를 반환한다
       * @param {string} keyword
       * @returns {boolean}
       * @private
       */
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
