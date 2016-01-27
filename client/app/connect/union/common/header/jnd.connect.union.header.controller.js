(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionHeaderCtrl', JndConnectUnionHeaderCtrl);

  /* @ngInject */
  function JndConnectUnionHeaderCtrl($scope, $filter, JndConnect, EntityMapManager, memberService) {
    var regxCreatedAt = /(?:(.+)T)/;
    var dateFilter = $filter('date');

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.getMemberName = getMemberName;
      $scope.onSuccessRemove = onSuccessRemove;
      $scope.isAllowAccountUpdate = isAllowAccountUpdate;
      $scope.isAllowAccountAdd = isAllowAccountAdd;
    }

    /**
     * 삭제 성공시 콜백
     */
    function onSuccessRemove() {
      JndConnect.backToMain(true);
    }

    /**
     * get member name
     * @returns {boolean|*}
     * @private
     */
    function getMemberName(memberId) {
      var member = EntityMapManager.get('member', memberId || memberService.getMemberId());
      return _.isObject(member) && member.name;
    }

    /**
     * 읽기전용 account 인지 여부
     * @param {string} unionName
     * @returns {boolean}
     */
    function isAllowAccountUpdate(unionName) {
      var result = true;

      if ($scope.isSettingMode) {
        switch (unionName) {
          case 'googleCalendar':
            result = false;
            break;
        }
      }

      return result;
    }

    /**
     * account를 추가 가능한지 여부
     * @param unionName
     * @returns {boolean}
     */
    function isAllowAccountAdd(unionName) {
      var result = false;
      switch (unionName) {
        case 'googleCalendar':
          result = true;
          break;
      }

      return result;
    }
  }
})();
