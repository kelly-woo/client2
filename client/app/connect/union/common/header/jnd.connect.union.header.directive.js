/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 * @example
 * @param {object}  data
 *    @param {object} data.current - 'jnd.connect.controller'의 current object
 *    @param {number} data.memberId - connect 생성/수정하는 member id. default) login 중인 member id
 *    @param {boolean} [data.hasAccount=true] - 계정 정보가 존재하는지 여부 (webhook의 경우 false 로 넘겨야 함)
 *    @param {boolean} [data.isAccountLoaded] - 계정 정보가 Load 완료 되었는지 여부
 *    @param {string} [data.accountId] - 인정된 계정의 id. ex) tmsla123@gmail.com
 *    @param {array}  [data.accounts] - 인정된 계정 list
 *    @param {string} [data.createdAt] - (수정 모드일 경우) connect 생성 string. default) 현재 date(yyyy-MM-dd)
 *    @param {boolean} [data.isActive] - (수정 모드일 경우) connect status
 *
 * <jnd-connect-union-header jnd-data-model="data"></jnd-connect-union-header>
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

    function link(scope) {

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.isSettingMode = !!scope.data.current.connectId;
        scope.unionImageUrl = scope.data.current.union.imageUrl;
        scope.unionName = scope.data.current.union.name;

        _attachEvents();

        _initAccounts();
        _setPermission();
        _setFilteredText();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$watch('data.current.union.memberCount', _onAuthCountChange);
      }

      /**
       * 계정 초기화 설정
       * @private
       */
      function _initAccounts() {
        scope.data.hasAccount = _.isBoolean(scope.data.hasAccount) ? scope.data.hasAccount : true;
        if (scope.data.hasAccount) {
          scope.data.accounts = scope.data.accounts || [];
        }
        //var accounts = scope.data.accounts;
        //if (!_.isArray(accounts) || accounts.length < 1) {
        //  accounts = accounts || [];
        //  accounts.push({text: '@불러오는 중', value: ''});
        //}
      }

      function _setPermission() {
        var unionName = scope.unionName;

        scope.permission = {
          allowAccountUpdate: scope.isAllowAccountUpdate(unionName),
          allowAccountAdd: scope.isAllowAccountAdd(unionName)
        };
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
