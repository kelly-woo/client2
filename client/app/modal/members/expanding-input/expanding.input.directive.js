/**
 * @fileoverview expanding input dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('expandingInput', expandingInput);

  function expandingInput($timeout, $parse, jndKeyCode) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        ngModel: '=',
        list: '=?',
        onChange: '&?'
      },
      link: link,
      templateUrl: 'app/modal/members/expanding-input/expanding.input.html'
    };

    function link(scope, el, attrs) {
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

        scope.status = 'edit';
        scope.hasGuideLine = false;
        scope.placeholder = placeholder;

        scope.inputClass = inputClass;
        scope.inputStatusClass = inputStatusClass;
        scope.maxLength = maxLength;

        scope.hasList = _.isArray(scope.list);

        scope.onMouseEnter = _onMouseEnter;
        scope.onMouseLeave = _onMouseLeave;
        scope.onMousedown = _onMousedown;
        scope.onFocus = _onFocus;
        scope.onBlur = _onBlur;

        scope.onSelect = _onSelect;
        scope.onKeyDown = _onKeyDown;
      }

      /**
       * mouse enter handler
       * @private
       */
      function _onMouseEnter() {
        scope.hasGuideLine = true;
      }

      /**
       * mouse leave handler
       * @private
       */
      function _onMouseLeave() {
        if (scope.status === 'edit') {
          scope.hasGuideLine = false;
        }
      }

      /**
       * mouse down handler
       * @private
       */
      function _onMousedown() {
        if (scope.status === 'edit') {
          scope.input.text = '';

          if (!scope.hasList) {
            setTimeout(function() {
              el.find('input').focus();
            });
          }
        } else if (scope.status === 'cancel') {
          scope.status = 'edit';
          scope.hasGuideLine = false;
          scope.input.text = originalValue;
        }
      }

      /**
       * focus handler
       * @private
       */
      function _onFocus() {
        $timeout.cancel(timerEditStatus);
        scope.status = 'cancel';
        scope.hasGuideLine = true;
      }

      /**
       * blur handler
       * @private
       */
      function _onBlur() {
        if (scope.status === 'cancel') {
          scope.hasGuideLine = false;
          _changeValue();
        }
        _clearStatus();
      }

      /**
       * select event handler
       * @private
       */
      function _onSelect() {
        _changeValue();
      }

      /**
       * key down event handler
       * @param event
       * @private
       */
      function _onKeyDown(event) {
        if (jndKeyCode.match('ENTER', event.keyCode)) {
          setTimeout(function() {
            el.find('input').blur();
          });
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
       * value change event handler
       * @private
       */
      function _changeValue() {
        if (scope.input.text !== originalValue && scope.onChange) {
          scope.onChange({
            $type: type,
            $value: scope.input.text
          });
          originalValue = scope.input.text;
        }
      }
    }
  }
})();
