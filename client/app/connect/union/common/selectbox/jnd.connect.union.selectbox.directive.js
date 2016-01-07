/**
 * @fileoverview union selectbox directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionSelectbox', jndConnectUnionSelectbox);

  function jndConnectUnionSelectbox() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'list': '=',
        'value': '=',
        'headerDataModel': '=?',
        'permission': '=?'
      },
      templateUrl: 'app/connect/union/common/selectbox/jnd.connect.union.selectbox.html',
      link: link
    };

    function link(scope, el, attrs) {
      var unionSelectboxClass = attrs.unionSelectboxClass || '';

      var menuType = attrs.menuType;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.unionSelectboxClass = unionSelectboxClass;
        scope.isActiveSelectbox = false;
        scope.menuType = menuType;

        scope.isActive = isActive;
        scope.selectActive = selectActive;
        scope.selectItem = selectItem;
        scope.onToggle = onToggle;

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$watch('list', _onListChange);
        scope.$watch('isActiveSelectbox', _onIsActiveSelectboxChange);
      }

      /**
       * highlight되는 item 인지 여부 전달함
       * @param {number} index
       * @returns {boolean}
       */
      function isActive(index) {
        return scope.activeIndex === index;
      }

      /**
       * highlight되는 item으로 선택함
       * @param {number} index
       */
      function selectActive(index) {
        scope.activeIndex = index;
      }

      /**
       * item을 선택함
       * @param {number} index
       */
      function selectItem(index) {
        var selectedItem;

        if (scope.list[index] != null) {
          scope.selectedIndex = scope.activeIndex = index;

          selectedItem = scope.list[scope.selectedIndex];
          scope.selectedItemText = selectedItem.text;
          scope.value = selectedItem.value;
        }
      }

      /**
       * dropdown이 toggle된 직 후 event 처리함
       * @param {isOpen} isOpen
       */
      function onToggle(isOpen) {
        if (isOpen) {
          // dropdown toggle 시 최초 출력시에만 focus 이동함
          _focusItem(scope.selectedIndex);
          scope.onToggle = angular.noop;
        }
      }

      /**
       * selectbox가 동작중 인지 flag 변경 처리함
       * @param {boolean} value
       * @private
       */
      function _onIsActiveSelectboxChange(value) {
        if (scope.permission && scope.permission.allowAccountUpdate === false) {
          scope.isActiveSelectbox = false;
        } else {
          if (!value) {
            // dropdown toggle시 깜빡임 방지를 위해 닫히기 직전 focus 이동함
            _focusItem(scope.selectedIndex);
          }
          scope.activeIndex = scope.selectedIndex;
        }
      }

      /**
       * list change event handler
       * @param value
       * @private
       */
      function _onListChange(value) {
        var index;

        if (value) {
          if (scope.value != null) {
            index = _.findIndex(scope.list, {value: scope.value});
            index = scope.list[index] ? index : 0;
            scope.selectItem(index);
          } else {
            scope.selectItem(0);
          }
        }
      }

      /**
       * list의 특정 item으로 focus 이동함
       * @param {number} index
       * @private
       */
      function _focusItem(index) {
        var jqDropdown = el.find('.dropdown-menu');
        var viewportScrollTop = jqDropdown.scrollTop() || 0;
        var viewportTop = jqDropdown.offset().top;

        var jqItem = jqDropdown.find('.dropdown-list').children().eq(index);

        var compare;
        if (jqItem.length > 0) {
          compare = jqItem.offset().top - viewportTop;
          jqDropdown.scrollTop(viewportScrollTop + compare);
        }
      }
    }
  }
})();
