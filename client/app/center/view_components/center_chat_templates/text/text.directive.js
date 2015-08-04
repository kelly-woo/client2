(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('text', text);

  /* @ngInject */
  function text() {
    return {
      restrict: 'E',
      scope: {
        msg: '=',
        isChildText: '=',
        index: '='
      },
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/text/text.html',
      controller: 'TextMessageCtrl'
    };

    function link(scope, el, attrs) {
      var jqTextContainer = el;

      _init();

      /**
       * 초기화
       * @private
       */
      function _init() {
        _attachDomEvents();
      }

      /**
       * dom 이벤트를 바인딩한다.
       * @private
       */
      function _attachDomEvents() {
        el.on('mouseover', _onMouseOver);
        el.on('mouseout', _onMouseOut);
      }

      /**
       * mouse over 시 이벤트 핸들러
       * (ng-mouseenter, ng-mouseleave 가 느리다는 포스팅이 있어, 적용해 봄)
       * @param {Event} mouseOverEvent
       * @private
       */
      function _onMouseOver(mouseOverEvent) {
        var jqTarget = $(mouseOverEvent.target);
        if (jqTarget.hasClass('msg-item-icon')) {
          jqTextContainer.addClass('text-highlight-background');
        }
      }

      /**
       * mouse over 시 이벤트 핸들러
       * (ng-mouseenter, ng-mouseleave 가 느리다는 포스팅이 있어, 적용해 봄)
       * @param {Event} mouseOutEvent
       * @private
       */
      function _onMouseOut(mouseOutEvent) {
        var jqTarget = $(mouseOutEvent.target);
        if (jqTarget.hasClass('msg-item-icon')) {
          jqTextContainer.removeClass('text-highlight-background');
        }
      }
    }
  }
})();
