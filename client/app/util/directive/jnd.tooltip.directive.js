/**
 * @fileoverview jandi tooltip directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndTooltip', jndTooltip);

  /**
   * jnd-tooltip directive
   *
   * tooltip:show
   * tooltip:hide
   *
   * 이벤트를 사용하여 툴팁을 노출한다.
   *
   * @returns {{restrict: string, scope: {src: string}, link: link}}
   * @example

   $rootScope.$broadcast('tooltip:show', {
    direction: 'top',
    content: '더보기',
    target: jqTarget
   });

   $rootScope.$broadcast('tooltip:hide');
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

      /**
       * show 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} data
       *    @param {string} [data.direction=top]  - top|bottom|left|right
       *    @param {string} data.content  - '더보기'
       *    @param {string} data.target - jquery 엘리먼트
       * @private
       */
      function _onShow(angularEvent, data) {
        var position;
        data.direction = data.direction || 'top';
        scope.direction = data.direction;
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

      /**
       * tooltip 을 노출할 position 을 계산한다.
       * @param {element} jqTarget
       * @returns {*}
       * @private
       */
      function _getPosition(jqTarget) {
        var direction = scope.direction;
        var bodyOffset = $('.body-wrapper').offset();
        var offset = jqTarget.offset();
        switch(direction) {
          case 'top':
            offset.top -= el.children().outerHeight();
            offset.left = Math.ceil(offset.left - (0.5 * el.children().width()) + (0.5 * jqTarget.width()));
            break;
          case 'left':
            break;
          case 'right':
            break;
          case 'bottom':
            break;
        }
        offset.top -= bodyOffset.top;
        offset.left -= bodyOffset.left;
        return offset;
      }

      /**
       * hide 이벤트 핸들러
       * @param {object} angularEvent
       * @private
       */
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
