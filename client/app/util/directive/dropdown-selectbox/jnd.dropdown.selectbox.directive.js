/**
 * @fileoverview dropdown selectbox 디렉티브
 *
 * @param {Array} list - selectbox 목록
 * @param {*} value - selectbox 에서 선택된 결과를 바인딩 할 변수
 * @param {String} [template] - $templateCache.put('key', template); 으로 저장한 custom template 키 값
 * @param {Boolean} [is-disabled] - disabled 상태로 변경할 지 여부
 * @param {Function} [on-select] - 선택 값이 변경되었을 경우 콜백
 * @param {Function} [on-init] - directive 가 초기화 로직 수행 후 콜백
 * @example
 <jnd-dropdown-selectbox
                list="notificationFrequencyList"
                value="data.notificationFrequency"
                template="'noti-template'"
                is-disabled="isDisabled"
                on-select="onChange();"
                on-init="onInit();">
 </jnd-dropdown-selectbox>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndDropdownSelectbox', jndDropdownSelectbox);

  function jndDropdownSelectbox($templateCache) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        template: '=?',
        list: '=',
        value: '=',
        isDisabled: '=?',
        onInit: '&?onInit',
        onSelectCallback: '&?onSelect'
      },
      link: link,
      templateUrl: 'app/util/directive/dropdown-selectbox/jnd.dropdown.selectbox.html'
    };

    function link(scope) {

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        $templateCache.put('jnd-dropdown-selectbox-template', '<span class="option-text">{{::item.text}}</span>');
        _setSelectItem(_.findIndex(scope.list, {'value': scope.value}));
        scope.onSelectItem = onSelectItem;
        scope.template = scope.template || 'jnd-dropdown-selectbox-template';
        _attachScopeEvents();
        _.isFunction(scope.onInit) && scope.onInit();
      }

      /**
       *
       * @private
       */
      function _attachScopeEvents() {
        scope.$watch('value', _onValueChange);
      }

      /**
       *
       * @param {*} newValue
       * @private
       */
      function _onValueChange(newValue) {
        _setSelectItem(_.findIndex(scope.list, {'value': scope.value}));
      }

      /**
       * 특정 item 선택 이벤트 핸들러
       * @param {number} index
       */
      function onSelectItem(index) {
        _setSelectItem(index);

        scope.onSelectCallback({
          $index: index
        });
      }

      /**
       * 선택 아이템 설정
       * @param {number} index
       * @private
       */
      function _setSelectItem(index) {
        var item;
        if (item = scope.list[index]) {
          scope.selectedItemText = item.text;
          scope.value = item.value;
        }
      }
    }
  }
})();
