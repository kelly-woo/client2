/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionHeader', jndConnectUnionHeader);

  function jndConnectUnionHeader($filter, memberService, EntityMapManager) {
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
       * init
       * @private
       */
      function _init() {
        scope.isSettingMode = scope.data.current.connectId != null;
        scope.unionImageUrl = scope.data.current.union.icon;

        _attachEvents();

        _setAccountStatus();
        _setFilteredText();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$watch('data.current.union.memberCount', _onAuthCountChange);
      }

      function _setAccountStatus() {
        var unionName = scope.data.current.union.name;

        scope.isReadonlyAccount = scope.isReadonlyAccount(unionName);
        scope.isValidAddAccount = scope.isValidAddAccount(unionName);
      }

      function _setFilteredText() {
        var memberId = scope.data.memberId;
        var createdAt = scope.data.createdAt;

        scope.connectTitle = $filter('translate')('@jnd-connect-33')
          .replace('{{memberName}}', '<span class="user-name">' + scope.getMemberName(memberId) + '</span>')
          .replace('{{serviceName}}', scope.data.current.union.title);
        scope.connectCreateAt = $filter('translate')('@jnd-connect-34').replace('{{yyyy-mm-dd}}', scope.getCreatedAt(createdAt));
      }

      /**
       * auth count change handler
       * @param {number} value
       * @private
       */
      function _onAuthCountChange(value) {
        scope.connectAuthCountDescription =
          $filter('translate')('@jnd-connect-32').replace('{{integratedMemberCount}}', '<b>' + value + '</b>');
      }
    }
  }
})();
