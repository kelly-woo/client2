/**
 * @filevoerview team switch 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('leftTeamSwitch', leftTeamSwitch);

  function leftTeamSwitch($timeout, configuration, JndUtil) {
    return {
      restrict: 'E',
      scope: {
        team: '='
      },
      link: link,
      replace: true,
      templateUrl: 'app/left/team-switch/left.team.switch.html',
      controller: 'LeftTeamSwitchCtrl'
    };

    function link(scope, el, attrs) {
      var _jqList = el.find('._list');
      var _timer;

      _init();

      /**
       * 초기화 메서드
       * @private
       */
      function _init() {
        scope.isOpen = false;

        scope.go = go;

        _attachEvent();
        _attachDomEvent();
        _setMaxHeight();
      }

      /**
       * dom event 를 바인딩한다.
       * @private
       */
      function _attachDomEvent() {
        $(window).on('resize', _onWindowResize);
      }

      /**
       * dom event 바인딩을 해제한다.
       * @private
       */
      function _detachDomEvent() {
        $(window).off('resize', _onWindowResize);
      }

      /**
       * 이벤트를 바인딩 한다.
       * @private
       */
      function _attachEvent() {
        scope.$on('headerCtrl:teamSwitchOpen', _onTeamSwitchOpen);
        scope.$on('jndMainKeyHandler:teamSwitchToggle', _onTeamSwitchToggle);
        scope.$on('jndWebSocketOtherTeam:notificationAfter', _onNotificationAfter);
        scope.$on('$destroy', _onDestroy);

        scope.$watch('isOpen', _onIsOpenChange);
      }

      /**
       * max-height 을 설정한다.
       * @private
       */
      function _setMaxHeight() {
        var height = $('.lpanel-user__user').height() + $('#lpanel-list-container').height() + 17;
        _jqList.css({'max-height': height + 'px'});
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
       * 팀 변경 토글 이벤트 처리함
       * @private
       */
      function _onTeamSwitchToggle() {
        JndUtil.safeApply(scope, function() {
          scope.isOpen = !scope.isOpen;
        });
      }

      /**
       * 팀 변경 열림 이벤트 처리함
       * @private
       */
      function _onTeamSwitchOpen() {
        if (scope.isOpen === false) {
          scope.isOpen = true;
        }
      }

      /**
       * isOpen 변경 이벤트 처리함.
       * @param {boolean} newIsOpen
       * @param {boolean} oldIsOpen
       * @private
       */
      function _onIsOpenChange(newIsOpen, oldIsOpen) {
        if (scope.hasOtherTeam) {
          if (newIsOpen !== oldIsOpen) {
            _jqList.slideToggle();
          }
        } else {
          scope.isOpen = false;
        }
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _detachDomEvent();
      }

      /**
       * 알림 전송 후 이벤트 처리함.
       * @private
       */
      function _onNotificationAfter() {
        // badge dot를 blink 한다.
        scope.hasBlink = false;
        $timeout(function() {
          scope.hasBlink = true;
        }, 10);
      }

      /**
       * 해당 팀으로 이동한다.
       * @param {object} team
       */
      function go(team) {
        window.location.href = configuration.base_protocol + team.t_domain + configuration.base_url;
      }
    }
  }
})();
