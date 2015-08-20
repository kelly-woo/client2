/**
 * @fileoverview scale up animation 을 수행하는 directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndTooltip', jndTooltip);

  /**
   * on-load-scale-up directive
   * on load 이벤트 발생시 scale up 에니메이션을 수행한다.
   *
   * @returns {{restrict: string, scope: {src: string}, link: link}}
   * @example

   <img src="xxx.com"
   on-load-scale-up
   duration="300"
   start-width="30"
   start-height="30"
   end-width="100"
   end-height="100" />

   */
  function jndTooltip($templateRequest) {
    return {
      restrict: 'E',
      scope: {},
      replace: true,
      link: link
    };

    function link(scope, el, attrs) {
      var TEMPLATE_URL = 'app/util/directive/jnd.tooltip.html';
      var _template;

      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        $templateRequest(TEMPLATE_URL).then(function(template) {
          _template =  Handlebars.compile(template);
        });
        _attachEvents();
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {

      }

      /**
       * 이벤트 바인딩
       * @private
       */
      function _attachEvents() {
        scope.$on('tooltip:show', _onShow);
        scope.$on('tooltip:hide', _onHide);
      }

      /**
       * 이벤트 바인딩 해제
       * @private
       */
      function _detachEvents() {

      }

      function _onShow(angularEvent, data) {
        var position;
        scope.direction = data.direction || 'top';
        scope.content = data.content;

        el.children().stop( true, true).empty();
        el.show().html(_template(data));

        position = _getPosition(data.target);

        el.children().css({
            left: position.left + 'px',
            top: position.top + 'px'
          }).animate({
          opacity: 1
        });
      }

      function _getPosition(jqTarget) {
        var direction = scope.direction;
        var offset = jqTarget.offset();
        switch(direction) {
          case 'top':
            offset.top -= el.children().height();
            offset.left = Math.ceil(offset.left - (0.5 * el.children().width()) + (0.5 * jqTarget.width()));
            break;
          case 'left':
            break;
          case 'right':
            break;
          case 'bottom':
            break;
        }
        return offset;

      }
      function _onHide(angularEvent) {
        el.children().stop( true, true ).animate({
          opacity: 0
        }, function() {
          el.children().hide();
        });
      }
    }
  }
})();
