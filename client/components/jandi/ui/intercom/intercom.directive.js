/**
 * @fileoverview intercom dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandi.ui.intercom')
    .directive('intercom', intercom);

  function intercom($rootScope, Intercom, memberService) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        isOpen: '='
      },
      templateUrl : 'components/jandi/ui/intercom/intercom.html',
      link: link
    };

    function link(scope, el) {
      _init();

      /**
       * init
       * @private
       */
      function _init() {
        _attachScopeEvents();
      }

      function _attachScopeEvents() {
        scope.$on('headerCtrl:intercomOpen', function() {
          _boot();
        });
      }

      function _boot() {
        var member = memberService.getMember();

        //Intercom.show();

        Intercom.shutdown();
        Intercom.boot({
          name: member.name,
          email: member.u_email
          //widget: {
          //  activator: '#intercom'
          //}
        });

        window.Intercom('update');

        //window.Intercom('show');
      }
    }
  }
})();
