/**
 * @fileoverview union selectbox directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionSelectbox', jndConnectUnionSelectbox);

  function jndConnectUnionSelectbox(JndUtil) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        'list': '=',
        'value': '=?',
        'onSelect': '&select'
      },
      link: link,
      templateUrl: 'app/connect/union/common/jnd.connect.union.selectbox.html'
    };

    function link(scope, el, attrs) {
      var unionSelectboxClass = attrs.unionSelectboxClass || '';

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        scope.unionSelectboxClass = unionSelectboxClass;

        scope.isActive = isActive;
        scope.selectActive = selectActive;
        scope.selectItem = selectItem;
        scope.onToggle = onToggle;

        if (scope.value != null) {
          scope.selectItem(_.findIndex(scope.list, {value: value}));
        } else {
          scope.selectItem(0);
        }
      }

      function isActive(index) {
        return scope.activeIndex === index;
      }

      function selectActive(index) {
        scope.activeIndex = index;
      }

      function selectItem(index) {
        scope.selectedIndex = scope.activeIndex = index;
        scope.selectedItem = scope.list[index];

        scope.onSelect({
          $item: scope.selectedItem
        });
      }

      function onToggle(isOpen) {
        scope.isActiveButton = isOpen

        JndUtil.safeApply(scope, function() {
          scope.activeIndex = scope.selectedIndex;
        });
      }
    }
  }
})();
