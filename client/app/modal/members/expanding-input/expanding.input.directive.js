/**
 * @fileoverview expanding input dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('expandingInput', expandingInput);

  function expandingInput($timeout, jndKeyCode) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        ngModel: '=',
        activeIndex: '=',
        list: '=?',
        onSelect: '&',
        onChange: '&?'
      },
      link: link,
      templateUrl: 'app/modal/members/expanding-input/expanding.input.html'
    };

    function link(scope, el, attrs) {
      var index = attrs.index;

      var inputClass = attrs.inputClass || '';
      var inputStatusClass = attrs.inputStatusClass || '';
      var placeholder = attrs.placeholder;

      var maxLength = parseInt(attrs.maxLength, 10);
      var type = attrs.ngModel;

      var originalValue = scope.ngModel;
      var timerEditStatus;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.input = {
          text: originalValue
        };

        scope.hasGuideLine = hasGuideLine;
        scope.status = 'edit';
        scope.placeholder = placeholder;

        scope.inputClass = inputClass;
        scope.inputStatusClass = inputStatusClass;
        scope.maxLength = maxLength;

        scope.hasList = _.isArray(scope.list);

        scope.onMouseEnter = _onMouseEnter;
        scope.onMousedown = _onMousedown;
        scope.onFocus = _onFocus;
        scope.onBlur = _onBlur;

        scope.onSelectOption = _onSelectOption;
        scope.onKeyDown = _onKeyDown;
        scope.onTextChange = _onTextChange;

        if (hasGuideLine()) {
          _focusInput();
        }
      }

      /**
       * mouse enter handler
       * @private
       */
      function _onMouseEnter() {
        scope.onSelect({$index: index});
      }

      /**
       * guideline 출력 여부
       * @returns {boolean}
       */
      function hasGuideLine() {
        return scope.activeIndex === index;
      }

      /**
       * mouse down handler
       * @private
       */
      function _onMousedown() {
        if (scope.status === 'edit') {
          scope.input.text = '';

          if (!scope.hasList) {
            _focusInput();
          }
        } else if (scope.status === 'cancel') {
          _cancelValue();
        }
      }

      /**
       * focus handler
       * @private
       */
      function _onFocus() {
        $timeout.cancel(timerEditStatus);
        scope.onSelect({$index: index});
      }

      /**
       * blur handler
       * @private
       */
      function _onBlur() {
        setTimeout(function() {
          // jndInputModel에서 blur 처리로 인해 input.text가 공백일때 처리가
          // 의도한 바와 같이 수행되지 않으므로 setTimeout 설정
          if (scope.status === 'cancel') {
            _changeValue();
          }
          _clearStatus();
        }, 50);
      }

      /**
       * select event handler
       * @private
       */
      function _onSelectOption() {
        _changeValue();
      }

      /**
       * key down event handler
       * @param event
       * @private
       */
      function _onKeyDown(event) {
        if (jndKeyCode.match('ENTER', event.keyCode)) {
          _changeValue();
          scope.status = 'edit';
        } else if (jndKeyCode.match('ESC', event.keyCode) && scope.status === 'cancel') {
          event.stopPropagation();

          _cancelValue();
        }
      }

      /**
       * text change event handler
       * @private
       */
      function _onTextChange() {
        if (scope.input.text !== originalValue) {
          scope.status = 'cancel';
        }
      }

      /**
       * clear status
       * @private
       */
      function _clearStatus() {
        timerEditStatus = $timeout(function() {
          scope.status = 'edit';
        }, 500);
      }

      /**
       * 변경값을 취소함
       * @private
       */
      function _cancelValue() {
        scope.status = 'edit';
        scope.input.text = originalValue;
      }

      /**
       * value change event handler
       * @private
       */
      function _changeValue() {
        if (index === 'name' && scope.input.text === '') {
          _cancelValue();
        } else if (scope.input.text !== originalValue && scope.onChange) {
          scope.onChange({
            $type: type,
            $value: scope.input.text
          });
          originalValue = scope.input.text;
        }
      }

      function _focusInput() {
        setTimeout(function() {
          el.find('input').focus();
        });
      }
    }
  }
})();
