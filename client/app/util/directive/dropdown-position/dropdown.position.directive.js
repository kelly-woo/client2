/**
 * @fileoverview dropdown position dicrective
 * @uses dropdown
 * @example
 *
 * // angular ui-bootstrap(0.13.4)의 'dropdown' directive 사용시에만 사용가능하다.
 * <div dropdown>
 *   <div dropdown-toggle>dropdown button</div>
 *
 *   // 'dropdownMenu' directive가 들어간 곳 다음에 'dropdownPosition' directive를 아래와 같이 넣어주면
 *   // dropdown menu가 열릴때 container에 dropdown menu가 최대한 출력되도록 자동으로 position을 설정해준다.
 *   <div dropdown-menu dropdown-position>
 *     ...
 *   </div>
 * </div>
 *
 */
(function() {
  'use strict';
  
  angular
    .module('jandiApp')
    .directive('dropdownPosition', dropdownPosition);
  
  function dropdownPosition($timeout, $position, $window) {
    return {
      restrict: 'A',
      require: '?^dropdown',
      link: link
    };

    function link(scope, el, attrs, ctrl) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        // 열릴때 깜빡임 방지 class
        el.parent().addClass('dropdown-position');

        _attachScopeEvents();
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$watch(ctrl.isOpen, function(isOpen) {
          // ctrl.isOpen이 포함된 digest cycle이 완료된 후 custom position을 수행하기 위해 timeout 사용한다.
          $timeout(function() {
            _onToggle(isOpen);
          }, 0, false);
        });
      }

      /**
       * dropdown menu toggle event handler
       * @param {boolean} isOpen
       * @private
       */
      function _onToggle(isOpen) {
        var jqDropdown = ctrl.$element;
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
        var query = ctrl.$element.attr('dropdown-menu-container');
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
        var jqDropdown = ctrl.$element;
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
