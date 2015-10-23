/**
 * @fileoverview compile 시 { } syntax 를 무시하는 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndSelectboxFile', jndSelectboxFile);

  function jndSelectboxFile(EntityMapManager, TopicFolderModel, publicService, jndKeyCode, jndPubSub, JndUtil) {
    return {
      restrict: 'AE',
      link: link,
      replace: true,
      scope: {
        selectedValue: '=jndDataModel',
        list: '=jndDataList'
      },
      templateUrl: 'app/util/directive/custom-selectbox/jnd.selectbox.file.html'
    };

    function link(scope, el, attrs) {
      var CSS_ICON_MAP = {
        'googleDocs': 'fileicon-document-google-drive',
        'document': 'fileicon-hwp',
        'presentation': 'fileicon-ppt',
        'spreadsheet': 'fileicon-excel',
        'pdf': 'fileicon-pdf',
        'image': 'fileicon-img',
        'video': 'fileicon-video',
        'audio': 'fileicon-audio'
      };

      var _lastKeyword = '';

      scope.onKeyUp = onKeyUp;
      scope.toggleShow = toggleShow;
      scope.onChange = onChange;

      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        scope.isShown = false;
        scope.cssIconMap = CSS_ICON_MAP;
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
        var selectedItem;
        selectedItem = _.find(scope.list, function(item) {
          return item.value === scope.selectedValue;
        });
        return selectedItem ? selectedItem.name : '';
      }

      function _initializeData() {
        scope.searchList = [];
        scope.selectedName = _getSelectedName();
      }

      function onChange(targetScope, isInitialSelect) {
        if (targetScope.item) {
          scope.selectedName = targetScope.item.viewValue;
          scope.selectedValue = targetScope.item.value;
        } else {
          scope.selectedName = '';
          //모든 파일의 value
          scope.selectedValue = scope.list[0].value;
        }
        if (!isInitialSelect) {
          scope.isShown = false;
        }
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
            _.each(scope.list, function (item) {
              start = item.viewValue.toLowerCase().search(keyword);
              if (start !== -1) {
                item.extSearchName = _highlight(item.viewValue, start, keyword.length);
                result.push(item);
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
