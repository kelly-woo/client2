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
        'value': '='
      },
      templateUrl: 'app/connect/union/common/jnd.connect.union.selectbox.html',
      link: link
    };

    function link(scope, el, attrs) {
      var unionSelectboxClass = attrs.unionSelectboxClass || '';

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        var index;

        scope.unionSelectboxClass = unionSelectboxClass;

        scope.isActive = isActive;
        scope.selectActive = selectActive;
        scope.selectItem = selectItem;
        scope.onToggle = onToggle;

        if (scope.value != null) {
          index = _.findIndex(scope.list, {value: scope.value});
          index = scope.list[index] ? index : 0;
          scope.selectItem(index);
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
        var selectedItem;

        if (scope.list[index] != null) {
          scope.selectedIndex = scope.activeIndex = index;

          selectedItem = scope.list[scope.selectedIndex];
          scope.selectedItemText = selectedItem.text;
          scope.value = selectedItem.value;
        }
      }

      function onToggle(isOpen) {
        scope.isActiveButton = isOpen;

        //JndUtil.safeApply(scope, function() {
          scope.activeIndex = scope.selectedIndex;
        //});
      }
    }
  }
})();
