/**
 * @fileoverview splitter dicrective
 * @example
 *
 * // !important splitter-panel의 element style중 position은 항상 absolute여야 한다.
 * <div splitter splitter-orientation="[horizontal|vertical]">
 *   <div splitter-panel min-size="100" max-size="200"></div>
 *   <div splitter-panel min-size="100"></div>
 *   <div splitter-panel min-size="100"></div>
 *   <div splitter-panel min-size="100"></div>
 * </div>
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.ui.splitter')
    .directive('splitter', splitter);
  
  function splitter() {
    return {
      restrict: 'A',
      scope: {
        orientation: '@splitterOrientation'
      },
      controller: 'SplitterCtrl',
      link: link
    };
    
    function link(scope, el) {
      var _splitBarTemplate = '<div class="split-bar"></div>';

      var _isDrag;
      var _jqSplitBar;
      var _negativeAside;
      var _positiveAside;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        if (scope.panels.length > 1) {
          _appendSplitBar();

          _attachDomEvents();
        }
      }

      /**
       * split bar element를 panel 사이에 추가함
       * @private
       */
      function _appendSplitBar() {
        _.each(scope.panels, function(panel, index) {
          var nextPanel = scope.panels[index + 1];
          var jqSplitBar;

          if (nextPanel) {
            jqSplitBar = $(_splitBarTemplate);

            panel.jqPanel.after(jqSplitBar);

            jqSplitBar.data('leftAside', panel)
              .data('rightAside', nextPanel)
              .on('mousedown');

            if (scope.orientation === 'horizontal') {
              // 수평 bar 생성
              jqSplitBar.addClass('horizontal-bar')
                .css({
                  top: 0,
                  left: panel.jqPanel.css('width')
                });
            } else {
              // 수직 bar 생성
              jqSplitBar.addClass('vertical-bar')
                .css({
                  top: panel.jqPanel.css('height'),
                  left: 0
                });
            }
          }
        });
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        el.on('mousemove', _onMouseMove)
          .on('mousedown', '.split-bar', _onMouseDown);
        $(window).on('mouseup', _onMouseUp);
      }

      /**
       * mouse move event handler
       * @param {object} $event
       * @private
       */
      function _onMouseMove($event) {
        var propertyNames;

        if (_isDrag) {
          // split bar에서 drag 시작하여 mouse move 중이다.

          propertyNames = {};

          if (scope.orientation === 'horizontal') {
            propertyNames.mouse = 'clientX';
            propertyNames.size = 'width';
            propertyNames.positive = 'right';
            propertyNames.negative = 'left';
          } else {
            propertyNames.mouse = 'clientY';
            propertyNames.size = 'height';
            propertyNames.positive = 'bottom';
            propertyNames.negative = 'top';
          }

          _setPanelsSize(el, $event, propertyNames);
        }
      }

      /**
       * panel size 설정함
       * @param {object} el
       * @param {object} $event
       * @param {object} propertyNames
       * @private
       */
      function _setPanelsSize(el, $event, propertyNames) {
        var bounds = el[0].getBoundingClientRect();

        var size = bounds[propertyNames.positive] - bounds[propertyNames.negative];
        var value = $event[propertyNames.mouse] - bounds[propertyNames.negative];

        if (value < _negativeAside.minSize) {
          // splitter bar의 왼쪽 또는 상단의 값이 min size보다 작을 경우 최소값을 유지한다.

          value = _negativeAside.minSize;
        } else if (value > _negativeAside.maxSize) {
          // splitter bar의 왼쪽 또는 상단의 값이 max size보다 클 경우 최대값을 유지한다.

          value = _negativeAside.maxSize;
        } else if (size - value < _positiveAside.minSize) {
          // splitter bar의 오른쪽 또는 하단의 값이 min size보다 작을 경우 최소값을 유지한다.

          value = size - _positiveAside.minSize;
        } else if (size - value > _positiveAside.maxSize) {
          // splitter bar의 오른쪽 또는 하단의 값이 max size보다 클 경우 최대값을 유지한다.

          value = _positiveAside.maxSize;
        }

        _negativeAside.jqPanel.css(propertyNames.size, value);
        _jqSplitBar.css(propertyNames.negative, value);
        _positiveAside.jqPanel.css(propertyNames.negative, value);
      }

      /**
       * mouse up event handler
       * @private
       */
      function _onMouseUp() {
        if (_isDrag) {
          _jqSplitBar.removeClass('active');

          _negativeAside.jqPanel.removeClass('non-selectable');
          _positiveAside.jqPanel.removeClass('non-selectable');
        }

        _isDrag = false;
      }

      /**
       * mouse down event handler
       * @param $event
       * @private
       */
      function _onMouseDown($event) {
        $event.stopPropagation();

        _isDrag = true;
        _jqSplitBar = $($event.currentTarget);
        _negativeAside = _jqSplitBar.data('leftAside');
        _positiveAside = _jqSplitBar.data('rightAside');

        _jqSplitBar.addClass('active');

        // drag시 text select 방지한다.
        _negativeAside.jqPanel.addClass('non-selectable');
        _positiveAside.jqPanel.addClass('non-selectable');
      }
    }
  }
})();
