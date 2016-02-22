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
      _init();

      /**
       * 초기화 메서드
       * @private
       */
      function _init() {
        _attachDomEvent();
      }

      /**
       * dom event 를 바인딩한다.
       * @private
       */
      function _attachDomEvent() {
        el.find('._button').on('click', _toggle);
      }

      /**
       * list 를 toggle 한다.
       * @private
       */
      function _toggle() {
        el.find('._list').slideToggle();
      }
    }
  }
})();
