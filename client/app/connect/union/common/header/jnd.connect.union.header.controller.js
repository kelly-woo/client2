(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectUnionHeaderCtrl', JndConnectUnionHeaderCtrl);

  /* @ngInject */
  function JndConnectUnionHeaderCtrl($scope, $filter, JndConnect, EntityMapManager, memberService) {
    var regxCreatedAt = /(?:(.+)T)/;
    var dateFilter = $filter('date');

    $scope.getMemberName = getMemberName;
    $scope.getCreatedAt = getCreatedAt;
    $scope.onSuccessRemove = onSuccessRemove;
    $scope.isAllowAccountUpdate = isAllowAccountUpdate;
    $scope.isAllowAccountAdd = isAllowAccountAdd;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
    }

    function requestStatusChange() {

    }

    function requestConnectDelete() {

    }

    function requestAddAccount() {
      // add api call
    }

    function requestDeleteAccount() {
      // delete api call
    }

    /**
     * 삭제 성공시 콜백
     */
    function onSuccessRemove() {
      JndConnect.backToMain();
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
     * get created date
     * @param {string} createdAt
     * @returns {*}
     */
    function getCreatedAt(createdAt) {
      var date = createdAt || new Date();
      var result;
      var match;

      if (date instanceof Date) {
        result = dateFilter(date, 'yyyy-MM-dd');
      } else {
        match = regxCreatedAt.exec(date);
        result = _.isArray(match) && match[1];
      }

      return result;
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
