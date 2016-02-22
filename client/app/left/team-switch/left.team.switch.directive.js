/**
 * @filevoerview team switch 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('leftTeamSwitch', leftTeamSwitch);

  function leftTeamSwitch() {
    return {
      restrict: 'E',
      scope: true,
      link: link,
      replace: true,
      templateUrl: 'app/left/team-switch/left.team.switch.html',
      controller: 'LeftTeamSwitchCtrl'
    };

    function link(scope, el, attrs) {
      var _timer;

      _init();

      /**
       * 초기화 메서드
       * @private
       */
      function _init() {
        _attachEvent();
        _attachDomEvent();
        _setMaxHeight();
      }

      /**
       * dom event 를 바인딩한다.
       * @private
       */
      function _attachDomEvent() {
        el.find('._button').on('click', _toggle);
        $(window).on('resize', _onWindowResize);
      }

      /**
       * dom event 바인딩을 해제한다.
       * @private
       */
      function _detachDomEvent() {
        el.find('._button').off('click', _toggle);
        $(window).off('resize', _onWindowResize);
      }

      /**
       * 이벤트를 바인딩 한다.
       * @private
       */
      function _attachEvent() {
        scope.$on('$destroy', _onDestroy);
      }

      /**
       * max-height 을 설정한다.
       * @private
       */
      function _setMaxHeight() {
        var height = $('.lpanel-user__user').height() + $('#lpanel-list-container').height() + 17;
        el.find('._list').css({'max-height': height + 'px'});
      }

      /**
       * window resize 시 이벤트 핸들러
       * @private
       */
      function _onWindowResize() {
        clearTimeout(_timer);
        _timer = setTimeout(_setMaxHeight, 100);
      }

      /**
       * list 를 toggle 한다.
       * @private
       */
      function _toggle() {
        el.find('._list').slideToggle();
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvent();
      }
    }
  }
})();
