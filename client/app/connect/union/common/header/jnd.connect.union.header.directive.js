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
        accountList: '=',
        connectMemberCount: '=',
        memberName: '=',
        unionName: '=',
        createDate: '='
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
        _attachEvents();
      }

      function _attachEvents() {
        scope.$watch('connectMemberCount', _onConnectMemberCountChange);
        scope.$watch('memberName', _onConnectTitleChange);
        scope.$watch('unionName', _onConnectTitleChange);
      }

      function _onConnectMemberCountChange(value) {
        scope.connectMemberDescription =
          $filter('translate')('@jnd-connect-32').replace('{{integratedMemberCount}}', value);
      }

      function _onConnectTitleChange() {
        scope._onConnectTitleChange = $filter('translate')('@jnd-connect-33')
          .replace('{{memberName}}', scope.memberName)
          .replace('{{serviceName}}', scope.unionName);
      }
    }
  }
})();
