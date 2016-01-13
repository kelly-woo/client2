/**
 * @fileoverview expanding input dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('expandingInput', expandingInput);

  function expandingInput(jndKeyCode) {
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

        scope.maxLength = maxLength;

        scope.hasList = _.isArray(scope.list);

        scope.onInputLoaded = onInputLoaded;

        scope.onMouseEnter = _onMouseEnter;
        scope.onMousedown = _onMousedown;

        scope.onViewFocus = onViewFocus;
        scope.onInputBlur = onInputBlur;

        scope.onSelectOption = _onSelectOption;
        scope.onKeyDown = _onKeyDown;
        scope.onTextChange = _onTextChange;

        _attachEvents();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$watch('activeIndex', _onActiveIndexChange);
      }

      /**
       * 부모 scope의 activeIndex 값 변경 event handler
       * @param value
       * @private
       */
      function _onActiveIndexChange(value) {
        if (value !== index) {
          // 자신의 index가 아니라면 edit 화면 감춘다
          jqEdit.blur();
          _setShowEdit(false);
        }
      }

      /**
       * 입력 element loaded event handler
       */
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
        if (!scope.hasList) {
          if (scope.status === 'edit') {
            jqEdit.focus();
          } else  if (scope.status === 'cancel') {
            _cancelValue();
          }
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
       * input blur handler
       * @private
       */
      function onInputBlur() {
        _setShowEdit(false);
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
          jqEdit.css('display', 'block');
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
