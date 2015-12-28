/**
 * @fileoverview simple menu directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectSelectboxAccountMenu', jndConnectSelectboxAccountMenu);

  /* @ngInject */
  function jndConnectSelectboxAccountMenu($filter, Dialog, jndPubSub, JndConnectUnionApi, JndConnectGoogleCalendar) {
    return {
      restrict: 'E',
      replace: true,
      scope: false,
      templateUrl : 'app/connect/union/common/selectbox/menu/jnd.connect.union.selectbox.account.menu.html',
      link: link
    };

    function link(scope) {
      var translate = $filter('translate');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        if (_.isObject(scope.headerDataModel)) {
          scope.isSettingMode = scope.headerDataModel.current.connectId != null;
          scope.unionName = scope.headerDataModel.current.union.name;

          scope.isValidMultiAccount = _getIsValidMultiAccount(scope.unionName);
        }

        scope.onAccountDeleteClick = onAccountDeleteClick;
        scope.onAccountAddClick = onAccountAddClick;

        _requestConnectCount();
      }

      /**
       * account delete click handler
       */
      function onAccountDeleteClick() {
        Dialog.confirm({
          body: translate('@jnd-connect-187').replace('{{numberOfConnects}}', scope.numberOfConnects),
          confirmButtonText: translate('@jnd-connect-188'),
          onClose: function (result) {
            if (result === 'okay') {
              _requestAccountDelete();
            }
          }
        });
      }

      /**
       * request connect count
       * @private
       */
      function _requestConnectCount() {
        //JndConnectGoogleCalendar.getConnectCount()
        //  .success(_successConnectCount);
      }

      /**
       * success connect count
       * @param data
       * @private
       */
      function _successConnectCount(data) {
        scope.numberOfConnects = data.count;
      }

      /**
       * account add click handler
       */
      function onAccountAddClick() {

      }

      /**
       * muitl account를 지원하는 union인지 전달함
       * @param {string} unionName
       * @returns {boolean}
       * @private
       */
      function _getIsValidMultiAccount(unionName) {
        var result = false;
        switch (unionName) {
          case 'googleCalendar':
            result = true;
            break;
        }

        return result;
      }

      /**
       * request account delete
       * @private
       */
      function _requestAccountDelete() {

      }

      /**
       * success account delete
       * @param {array} data
       * @private
       */
      function _successAccountDelete(data) {
        if (data && data.length > 0) {
          // account 삭제 후 갱신된 account 정보를 server에서 전달해 준다면
          // 해당 data로 account info를 갱신하는 event pub 함
          jndPubSub.pub('unionHeader:accountInfoChange', data);
        } else {
          _goToUnionList();
        }
      }

      /**
       * request account add
       * @private
       */
      function _requestAccountAdd() {

      }

      /**
       * success account add
       * @param data
       * @private
       */
      function _successAccountAdd(data) {
        if (data && data.length > 0) {
          jndPubSub.pub('unionHeader:accountInfoChange', data);
        }
      }

      /**
       * go union list
       * @private
       */
      function _goToUnionList() {

      }
    }
  }
})();
