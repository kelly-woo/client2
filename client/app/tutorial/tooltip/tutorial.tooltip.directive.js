/**
 * @fileoverview 튜토리얼 툴팁 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialTooltip', tutorialTooltip);

  function tutorialTooltip() {
    return {
      link: link,
      scope: {
        text: '@tutorialTooltip',
        name: '@tutorialTooltipName',
        placement: '@tutorialTooltipPlacement',
        className: '@tutorialTooltipClass',
        isAppendToBody: '@tutorialTooltipAppendToBody'
      },
      restrict: 'A',
      controller: 'TutorialTooltipCtrl'
    };

    function link(scope, el, attrs) {
      var _template = Handlebars.templates['tutorial.tooltip'];
      var _jqTooltip;
      var _timer;
      var _placementOffset = {
        top: 0,
        left: 0
      };

      _init();


      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _initProperties();
        _attachEvents();
        _attachDomEvents();
      }

      /**
       * scope property 를 초기화 한다.
       * @private
       */
      function _initProperties() {
        scope.isAppendToBody = (scope.isAppendToBody === 'true');
        scope.placement = scope.placement || 'top';
        scope.className = scope.className || '';
      }

      /**
       * 이벤트를 바인딩 한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
        scope.$on('Tutorial:showTooltip', _show);
        scope.$on('Tutorial:hideTooltip', _onClose);
        scope.$on('onNotificationBannerDisappear', _recalculatePosition);
      }

      /**
       * dom 이벤트를 바인딩 한다.
       * @private
       */
      function _attachDomEvents() {
        if (scope.isAppendToBody) {
          $(window).on('resize', _recalculatePosition);
          $('body').on('scroll', _recalculatePosition);
        }
      }

      /**
       * dom 이벤트 바인딩을 해제한다.
       * @private
       */
      function _detachDomEvents() {
        if (scope.isAppendToBody) {
          $(window).off('resize', _recalculatePosition);
          $('body').off('scroll', _recalculatePosition);
        }
      }

      /**
       * Tutorial 서비스의 close 이벤트 핸들러
       * @param {object} angularEvent
       * @param {string} tooltipName
       * @private
       */
      function _onClose(angularEvent, tooltipName) {
        if (tooltipName === scope.name) {
          _hide();
        }
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _remove();
        _detachDomEvents();
      }

      /**
       * tooltip 을 노출한다.
       * @private
       */
      function _show() {
        var jqParent = scope.isAppendToBody ? $('body') : el.parent();
        _jqTooltip = _getTooltipElement();

        jqParent.append(_jqTooltip);
        _setPosition();

        //fade in 효과를 주기 위해 timeout 을 사용한다.
        setTimeout(function() {
          _jqTooltip.addClass('fade in');
        });
      }

      /**
       * tooltip 을 감춘다.
       * @private
       */
      function _hide() {
        if (_jqTooltip) {
          _jqTooltip.removeClass('in').addClass('out');
          setTimeout(_remove, 200);
        }
      }

      /**
       * tooltip 을 제거한다.
       * @private
       */
      function _remove() {
        _jqTooltip && _jqTooltip.remove();
        _jqTooltip = null;
      }

      /**
       * tooltip element 를 생성하여 반환한다.
       * @returns {*|jQuery}
       * @private
       */
      function _getTooltipElement() {
        var classNameList = [scope.placement, scope.className];
        return $(_template({
          css: classNameList.join(' '),
          text: scope.text
        })).on('click', _onClickTooltip);
      }

      /**
       * tooltip click 이벤트 핸들러
       * @param {Event} clickEvent
       * @private
       */
      function _onClickTooltip(clickEvent) {
        var jqTarget = $(clickEvent.target);
        if (jqTarget.hasClass('icon-delete')) {
          _hide();
        }
      }

      /**
       * tooltip 의 위치를 선정한다.
       * @private
       */
      function _setPosition() {
        if (_jqTooltip) {
          switch (scope.placement) {
            case 'top':
              _placementOffset.top = -el.outerHeight() - 5;
              _placementOffset.left = Math.round((el.width() - _jqTooltip.width()) / 2);
              break;
            case 'bottom':
              _placementOffset.top = +el.outerHeight();
              _placementOffset.left = Math.round((el.width() - _jqTooltip.width()) / 2);
              break;
          }
          _setElementPosition();
        }
      }

      /**
       * element 의 위치 속성을 할당한다.
       * @private
       */
      function _setElementPosition() {
        var offset;
        var top;
        var left;

        if (_jqTooltip) {
          offset = scope.isAppendToBody ? el.offset() : el.position();
          top = _placementOffset.top + offset.top;
          left = _placementOffset.left + offset.left;
          _jqTooltip.css({
            top: top + 'px',
            left: left + 'px'
          });
        }
      }

      /**
       * position 을 다시 계산한다.
       * @private
       */
      function _recalculatePosition() {
        //매번 계산하면 성능의 저하를 야기할 수 있기 때문에, timer 를 사용하여 재계산을 최소화 한다.
        clearTimeout(_timer);
        _timer = setTimeout(_setPosition, 100);
      }
    }
  }
})();
