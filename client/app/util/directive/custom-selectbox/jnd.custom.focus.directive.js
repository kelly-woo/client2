/**
 * @fileoverview compile 시 { } syntax 를 무시하는 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndCustomFocus', jndCustomFocus);

  function jndCustomFocus($timeout, JndUtil, jndKeyCode, jndPubSub) {
    return {
      restrict: 'A',
      link: link,
      scope: {
        'selectedValue': '=jndDataSelected',
        'onChange': '=jndCustomFocus'
      }
    };
   function link(scope, el, attrs) {
     var _jqCurrent;
     var _jqInput;
     _init();

     /**
      * 생성자
      * @private
      */
     function _init() {
       _attachEvents();
       _attachDomEvents();
       _jqInput = el.find('input:first');

       $timeout(_initiialSelect);
     }

     /**
      * event handler 를 attch 한다
      * @private
      */
     function _attachEvents() {
       scope.$on('custom-focus:blur', _blur);
       scope.$on('custom-focus:focus', _onFocus);
       scope.$on('custom-focus:focus-next', _focusNext);
       scope.$on('custom-focus:focus-prev', _focusPrev);
     }

     /**
      * dom 이벤트 핸들러를 attach 한다
      * @private
      */
     function _attachDomEvents() {
       el.on('keydown', _onKeyDown);
       el.on('keyup', _onKeyUp);
       el.on('mouseover', _onMouseOver);
       el.on('click', _onClick);
     }

     /**
      * mouse over 이벤트 핸들러
      * @param {Event} mouseEvent
      * @private
      */
     function _onMouseOver(mouseEvent) {
       var jqTarget = $(mouseEvent.target);
       var jqSelectable = jqTarget.closest('._selectable');
       if (jqSelectable.length) {
         _focus(jqSelectable);
       }
     }

     /**
      * click 이벤트 핸들러
      * @param {Event} mouseEvent
      * @private
      */
     function _onClick(mouseEvent) {
       var jqTarget = $(mouseEvent.target);
       var jqSelectable = jqTarget.closest('._selectable');
       if (jqSelectable.length) {
         _select(jqSelectable);
       }
       _jqInput.focus();
     }

     /**
      * keyup 이벤트 핸들러
      * @private
      */
     function _onKeyUp() {
       $timeout(function() {
         _focus();
       });
     }

     /**
      * select 한다
      * @param {object} [jqTarget] - select 할 jquery 엘리먼트
      * @parma {boolean} [isInitial=false] - 처음 select 인지 여부
      * @private
      */
     function _select(jqTarget, isInitial) {
       jqTarget = jqTarget || _jqCurrent;
       if (_.isFunction(scope.onChange)) {
         JndUtil.safeApply(scope, function() {
           scope.onChange(angular.element(jqTarget).scope(), isInitial);
         });
       }
     }

     function _initiialSelect() {
       if (scope.selectedValue) {
         _focusById(scope.selectedValue);
       } else {
         _focus();
       }
       _select(_jqCurrent, true);
     }
     /**
      * keydown 이벤트 핸들러
      * @param {object} keyEvent
      * @private
      */
     function _onKeyDown(keyEvent) {
       var keyCode = keyEvent.keyCode;
       if (jndKeyCode.match('ESC', keyCode)) {
       } else if (jndKeyCode.match('ENTER', keyCode)) {
         _select();
       } else if (jndKeyCode.match('DOWN_ARROW', keyCode)) {
         keyEvent.preventDefault();
         _focusNext();
       } else if (jndKeyCode.match('UP_ARROW', keyCode)) {
         keyEvent.preventDefault();
         _focusPrev();
       } else if (jndKeyCode.match('PAGE_UP', keyCode)) {
         //_focusNextPage();
       } else if (jndKeyCode.match('PAGE_DOWN', keyCode)) {
         //_focusPrevPage();
       }
     }

     /**
      * focus 이벤트 핸들러
      * @param {object} angularEvent
      * @param {object} jqTarget
      * @private
      */
     function _onFocus(angularEvent, jqTarget) {
       _focus(jqTarget);
     }
     function _hasFocus() {
       return !!(_jqCurrent && _jqCurrent.length);
     }

     function _focusNext() {
       var jqList = el.find('._selectable');
       var jqEl;
       var jqTarget = jqList.eq(0);
       var jqNext;
       if (_hasFocus()) {
         _.forEach(jqList, function (el, index) {
           jqEl = $(el);
           jqNext = jqList.eq(index + 1);
           if (jqEl.is(_jqCurrent) && jqNext && jqNext.length) {
             jqTarget = jqNext;
             return false;
           }
         });
       }
       _focus(jqTarget);
     }

     function _blur() {
       el.find('._selectable').removeClass('active');
     }

     function _focus(jqTarget) {
       _blur();
       if (jqTarget && jqTarget.length) {
         _jqCurrent = jqTarget;
       } else if (!_jqCurrent || !_jqCurrent.length || _jqCurrent.is(':hidden')) {
         _jqCurrent = el.find('._selectable:first');
       }

       _jqCurrent.addClass('active');
       _adjustScroll();
       _jqInput.focus();
     }

     function _focusById(id) {
       var jqList = el.find('._selectable');
       var jqEl;
       var jqTarget = jqList.eq(0);
       var jqNext;

       _.forEach(jqList, function (el, index) {
         jqEl = angular.element(el);
         if (jqEl.scope().item && jqEl.scope().item.id == id) {
           jqTarget = jqEl;
           return false;
         }
       });

       _focus(jqTarget);
     }

     function _adjustScroll() {
       var jqContainer = _jqCurrent.closest('._container');
       var scrollTop = jqContainer.scrollTop();
       if (jqContainer.length) {
         jqContainer.scrollTop(scrollTop + _getDifference());
       }
     }

     function _getDifference() {
       var jqContainer = _jqCurrent.closest('._container');
       var offset = jqContainer.offset();
       var scrollTop = jqContainer.scrollTop();
       var height = jqContainer.outerHeight();

       var currentOffset = _jqCurrent.offset();
       var currentHeight = _jqCurrent.outerHeight();

       var difference = 0;

       if (offset.top > currentOffset.top) {
         difference = currentOffset.top - offset.top;
       } else if (offset.top + height < currentOffset.top + currentHeight) {
         difference = (currentOffset.top + currentHeight) - (offset.top + height);
       }
       return difference;
     }


     function _focusPrev() {
       var jqList = el.find('._selectable');
       var jqEl;
       var jqTarget = jqList.last();
       var jqPrev;
       if (_hasFocus()) {
         _.forEachRight(jqList, function (el, index) {
           jqEl = $(el);
           jqPrev = jqList.eq(index - 1);
           if (jqEl.is(_jqCurrent) && jqPrev && jqPrev.length) {
             jqTarget = jqPrev;
             return false;
           }
         });
       } else {
         jqTarget = jqList.eq(0);
       }
       _focus(jqTarget);
     }
   }

  }
})();


