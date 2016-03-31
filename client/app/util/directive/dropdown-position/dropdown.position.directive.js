/**
 * @fileoverview dropdown position dicrective
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('dropdownPosition', dropdownPosition);
  
  function dropdownPosition($window, $position) {
    return {
      restrict: 'AC',
      require: '?^dropdown',
      link: link
    };

    function link(scope, el, attrs, dropdownCtrl) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _attachScopeEvents();
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$watch(dropdownCtrl.isOpen, _onToggle);
      }

      /**
       * dropdown menu toggle event handler
       * @param {boolean} isOpen
       * @private
       */
      function _onToggle(isOpen) {
        var jqDropdown = dropdownCtrl.$element;
        var jqDropdownMenu = jqDropdown.find('.dropdown-menu');
        var appendToBody = jqDropdown.attr('dropdown-append-to-body');

        var containerEdge;
        var dropdownMenuEdge;

        if (isOpen) {
          // 너비값 조회 위해 display
          jqDropdownMenu.css({
            display: 'block',
            visibility: 'hidden'
          });

          if (appendToBody == null) {
            containerEdge = _getContainerEdge();
            dropdownMenuEdge = _getDropdownMenuEdge();

            // 상하
            jqDropdown[dropdownMenuEdge.bottom > containerEdge.bottom ? 'addClass' : 'removeClass']('dropup');

            // 좌우
            jqDropdownMenu[dropdownMenuEdge.right > containerEdge.right ? 'addClass' : 'removeClass']('dropdown-menu-right');
          }

          // 위치 계산 완료 후 visible
          jqDropdownMenu.css({
            visibility: 'visible'
          });
        } else {
          jqDropdownMenu.css({
            display: '',
            visibility: ''
          });
        }
      }

      /**
       * container의 모서리 값 전달
       * @returns {{right: *, bottom: *}}
       * @private
       */
      function _getContainerEdge() {
        var query = dropdownCtrl.$element.attr('dropdown-menu-container');
        var containerEdge = {};
        var containerOffset;

        if (query != null && query !== '') {
          containerOffset = $position.offset($(query));
          containerEdge.right = containerOffset.left + containerOffset.width;
          containerEdge.bottom = containerOffset.top + containerOffset.height;
        } else {
          containerEdge.right = $window.innerWidth + $window.pageXOffset;
          containerEdge.bottom = $window.innerHeight + $window.pageYOffset;
        }

        return containerEdge;
      }

      /**
       * dropdown menu의 모서리 값 전달
       * @private
       */
      function _getDropdownMenuEdge() {
        var jqDropdown = dropdownCtrl.$element;
        var dropdownOffset = $position.offset(jqDropdown);
        var dropdownMenuSize = $position.position(jqDropdown.find('.dropdown-menu'));

        return {
          right: dropdownOffset.left + dropdownMenuSize.width,
          bottom: dropdownOffset.top + dropdownOffset.height + dropdownMenuSize.height
        };
      }
    }
  }
})();
