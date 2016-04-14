/**
 * @fileoverview intercom dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.intercom')
    .directive('intercom', intercom);

  function intercom($window, configuration) {
    return {
      restrict: 'A',
      scope: {
        member: '='
      },
      link: link
    };

    function link(scope, el) {
      // boot 수행 여부
      var _hasBoot = false;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _attachScopeEvents();
        _attachDomEvents()
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$watch('member', _onMemberChanged);
      }

      function _attachDomEvents() {
        el.on('click', _onIntercomOpen);
      }

      /**
       * 현재 멤버 정보가 바뀜 이벤트 핸들러
       */
      function _onMemberChanged(member) {
        if (!_hasBoot) {
          _hasBoot = true;
          $window.Intercom('boot', {
            app_id: configuration.intercom_app_id,
            name: member.name,
            email: member.u_email
          });
        } else {
          // intercom에 설정된 멤버정보를 갱신한다.
          $window.Intercom('update', {
            name: member.name,
            email: member.u_email
          });
        }
      }

      /**
       * intercom 열림 이벤트 핸들러
       * @private
       */
      function _onIntercomOpen() {
        $window.Intercom('show');
      }
    }
  }
})();
