(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topic', topic);

  function topic(JndUtil) {
    return {
      restrict: 'E',
      controller: 'TopicCtrl',
      templateUrl: 'app/left/topics/topic/topic.html',
      scope: {
        currentRoom: '='
      },
      link: link,
      replace: true
    };

    function link(scope, el, attrs) {
      var _timer;

      /**
       * tooltip 이 노출 되었는지 여부
       * @type {boolean}
       */
      scope.isTooltipShown = false;

      _init();

      /**
       * 초기화 메서드
       * @private
       */
      function _init() {
        _attachDomEvents();
      }

      /**
       * 
       * @private
       */
      function _attachDomEvents() {
        el.find('._topicName').on('mouseenter', _onMouseEnter)
          .on('mouseleave', _onMouseLeave);
      }

      /**
       * mouse enter 이벤트 핸들러
       * @param {object} mouseEvent
       * @private
       */
      function _onMouseEnter(mouseEvent) {
        var jqTarget = $(mouseEvent.target);
        clearTimeout(_timer);
        _timer = setTimeout(_.bind(_showTooltip, this, jqTarget), 100);
      }

      /**
       * mouse leave 이벤트 핸들러
       * @param {object} mouseEvent
       * @private
       */
      function _onMouseLeave(mouseEvent) {
        clearTimeout(_timer);
        _hideTooltip();
      }

      /**
       * topic name 이 overflow 되었는지 여부를 반환한다.
       * @param {object} jqTarget
       * @returns {boolean}
       * @private
       */
      function _isTopicNameOverflow(jqTarget) {
        var jqClone = jqTarget.clone()
          .css( {display: 'block', width: '100%', visibility: 'hidden'} )
          .appendTo(jqTarget.parent());
        var isOverflow = jqClone.width() <= jqTarget.width();
        jqClone.remove();
        return isOverflow;
      }

      /**
       * 잘린 토픽 이름에 대한 전체 이름 tooltip 을 노출한다.
       * @param jqTarget
       * @private
       */
      function _showTooltip(jqTarget) {
        if (!scope.isTooltipShown && _isTopicNameOverflow(jqTarget)) {
          JndUtil.safeApply(scope, function() {
            scope.isTooltipShown = true;
          });
        }
      }

      /**
       * 전체 이름 tooltip 을 감춘다.
       * @private
       */
      function _hideTooltip() {
        if (scope.isTooltipShown) {
          JndUtil.safeApply(scope, function() {
            scope.isTooltipShown = false;
          });
        }
      }
    }
  }
})();
