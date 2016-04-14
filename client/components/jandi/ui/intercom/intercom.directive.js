/**
 * @fileoverview intercom dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.intercom')
    .directive('intercom', intercom);

  function intercom($injector, Intercom) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        isOpen: '='
      },
      templateUrl : 'components/jandi/ui/intercom/intercom.html',
      link: link
    };

    function link(scope, el, attr) {
      var memberService = $injector.get(attr.memberService);

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _attachScopeEvents();
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        scope.$on('onCurrentMemberChanged', _onCurrentMemberChanged);
        scope.$on('headerCtrl:intercomOpen', _onIntercomOpen);
      }

      /**
       * 현재 멤버 정보가 바뀜 이벤트 핸들러
       */
      function _onCurrentMemberChanged() {
        var member = memberService.getMember();

        // intercom에 설정된 멤버정보를 갱신한다.
        Intercom.update({
          name: member.name,
          email: member.u_email
        });
      }

      /**
       * intercom 열림 이벤트 핸들러
       * @private
       */
      function _onIntercomOpen() {
        Intercom.show();
      }
    }
  }
})();
