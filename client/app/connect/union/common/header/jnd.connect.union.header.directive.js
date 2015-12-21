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
        data: '=jndDataModel'
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
        scope.isSettingMode = scope.data.current.connectId != null;

        //console.log('data model qweqweqw ::: ', scope.data);
        //setTimeout(function() {
        //  console.log('eoifjweoijwe ::: ', scope.accountId, scope.accountList);
        //  console.log('data model ::: ', scope.data);
        //}, 4000);

        scope.connectTitle = $filter('translate')('@jnd-connect-33')
          .replace('{{memberName}}', '<span class="user-name">' + scope.memberName + '</span>')
          .replace('{{serviceName}}', scope.data.current.union.title);


        _attachEvents();
      }

      function _attachEvents() {
        scope.$watch('data.current.union.memberCount', _onMemberCountChange);
        scope.$watch('data.createTime', _onCreateTimeChange);
      }

      function _onMemberCountChange(value) {
        scope.connectMemberCountDescription =
          $filter('translate')('@jnd-connect-32').replace('{{integratedMemberCount}}', '<b>' + value + '</b>');
      }

      function _onCreateTimeChange(value) {
        scope.connectCreateAt = $filter('translate')('@jnd-connect-34').replace('{{yyyy-mm-dd}}', value);
      }
    }
  }
})();
