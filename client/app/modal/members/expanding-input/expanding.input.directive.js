/**
 * @fileoverview expanding input dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('expandingInput', expandingInput);

  function expandingInput($timeout, jndKeyCode, JndUtil) {
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

      var jqEdit;
      var jqReadonly;

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

        scope.onInputLoaded = onInputLoaded;

        scope.onMouseEnter = _onMouseEnter;
        scope.onMousedown = _onMousedown;

        scope.onViewFocus = onViewFocus;
        scope.onInputFocus = onInputFocus;
        scope.onInputBlur = onInputBlur;

        scope.onSelectOption = _onSelectOption;
        scope.onKeyDown = _onKeyDown;
        scope.onTextChange = _onTextChange;
      }

      function onInputLoaded() {
        jqEdit = el.find(scope.hasList ? 'select' : 'input');
        jqReadonly = el.find('.input-text-wrapper');

        if (scope.input.text === '') {
          _setShowEdit(true);
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
        if (!scope.hasList && scope.status === 'cancel') {
          _cancelValue();
        }
      }

      /**
       * view focus handler
       * @private
       */
      function onViewFocus() {
        _setShowEdit(true);

        scope.onSelect({$index: index});
      }

      /**
       * input focus handler
       */
      function onInputFocus() {
        scope.onSelect({$index: index});
      }

      /**
       * input blur handler
       * @private
       */
      function onInputBlur() {
        _setShowEdit(false);

        scope.onSelect({$index: null});
        setTimeout(function() {
          // jndInputModel에서 blur 처리로 인해 input.text가 공백일때 처리가
          // 의도한 바와 같이 수행되지 않으므로 setTimeout 설정
          if (scope.status === 'cancel') {
            _changeValue();
          }
          scope.status = 'edit';
        }, 50);
      }

      /**
       * show edit 설정
       * @param {boolean} value
       * @private
       */
      function _setShowEdit(value) {
        if (value) {
          // focus시 입력용 element와 읽기용 element를 switch
          jqReadonly.hide();
          jqEdit.css('display', 'block').focus();
        } else if (scope.input.text !== '') {
          // jqEdit의 placeholder를 사용하기 위해 변경값이 존재 하지 않을때에만
          // focus시 입력용 element와 읽기용 element를 switch
          jqEdit.hide();
          jqReadonly.css('display', 'block');
        }
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
          _setShowEdit(false);

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
    }
  }
})();
