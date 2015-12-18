/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionHeader', jndConnectUnionHeader);

  function jndConnectUnionHeader($filter) {
    return {
      restrict: 'E',
      controller: 'JndConnectUnionHeaderCtrl',
      link: link,
      scope: {
        connectId: '=',
        connectMemberCount: '=',
        memberName: '=',
        unionName: '=',
        createDate: '=',
        status: '=',
        accountId: '=',
        accountList: '='
      },
      replace: true,
      templateUrl: 'app/connect/union/common/header/jnd.connect.union.header.html'
    };

    function link(scope, el, attrs) {

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        setTimeout(function() {
          console.log('eoifjweoijwe ::: ', scope.accountId, scope.accountList);
        }, 4000);

        scope.connectTitle = $filter('translate')('@jnd-connect-33')
          .replace('{{memberName}}', '<span class="user-name">' + scope.memberName + '</span>')
          .replace('{{serviceName}}', scope.unionName);
        scope.connectCreateAt = $filter('translate')('@jnd-connect-34').replace('{{yyyy-mm-dd}}', scope.createDate);

        _attachEvents();
      }

      function _attachEvents() {
        scope.$watch('connectMemberCount', _onConnectMemberCountChange);
      }

      function _onConnectMemberCountChange(value) {
        scope.connectMemberCountDescription =
          $filter('translate')('@jnd-connect-32').replace('{{integratedMemberCount}}', '<b>' + value + '</b>');
      }
    }
  }
})();
