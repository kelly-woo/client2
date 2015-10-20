/**
 * @fileoverview compile 시 { } syntax 를 무시하는 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndCustomFocus', jndCustomFocus);

  function jndCustomFocus(jndKeyCode, jndPubSub) {
    return {
      restrict: 'A',
      link: link,
      scope: {}
    };
   function link(scope, el, attrs) {
     var _jqCurrent;
     _init();

     function _init() {
       scope.$on('custom-focus:blur', _blur);
       scope.$on('custom-focus:focus', _onFocus);
       scope.$on('custom-focus:focus-next', _focusNext);
       scope.$on('custom-focus:focus-prev', _focusPrev);

       _attachDomEvents();
       el.find('input').focus();
     }


     function _attachDomEvents() {
       el.on('keydown', _onKeyDown);
       el.on('mouseover', _onMouseOver);
     }
     function _onMouseOver(mouseEvent) {
       var jqTarget = $(mouseEvent.target);
       var jqSelectable = jqTarget.closest('._selectable');
       if (jqSelectable.length) {
         _focus(jqSelectable);
       }
     }
     function _onKeyDown(keyEvent) {
       var keyCode = keyEvent.keyCode;
       if (jndKeyCode.match('ESC', keyCode)) {
       } else if (jndKeyCode.match('ENTER', keyCode)) {
       } else if (jndKeyCode.match('DOWN_ARROW', keyCode)) {
         keyEvent.preventDefault();
         _focusNext();
       } else if (jndKeyCode.match('UP_ARROW', keyCode)) {
         keyEvent.preventDefault();
         _focusPrev();
       }
     }

     function _onFocus(angularEvent, jqTarget) {
       _focus(jqTarget);
     }
     function _hasFocus() {
       return !!(_jqCurrent && _jqCurrent.length);
     }

     function _focusNext() {
       var jqList = el.find('._selectable');
       var jqEl;
       var jqTarget;
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
       } else {
         jqTarget = jqList.eq(0);
       }
       _focus(jqTarget);
     }

     function _blur() {
       el.find('._selectable').removeClass('active');
     }

     function _focus(jqTarget) {
       _blur();
       _jqCurrent = jqTarget || el.find('._selectable:first');
       _jqCurrent.addClass('active');
     }

     function _adjustScroll() {
       
     }
     
     function _focusPrev() {
       var jqList = el.find('._selectable');
       var jqEl;
       var jqTarget;
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


