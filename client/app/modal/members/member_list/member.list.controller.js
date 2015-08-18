/**
 * @fileoverview member list controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('MemberListCtrl', MemberListCtrl);

  /* @ngInject */
  function MemberListCtrl($scope) {

    _init();

    function _init() {
      $scope.select = select;
      $scope.setActiveIndex = setActiveIndex;
      $scope.isActive = isActive;

      $scope.setActiveIndex(0);
    }

    /**
     * item select event handler
     * 상위 scope의 onSelect callback을 수행함
     * @param {number} matchIndex
     */
    function select(matchIndex) {
      var list = $scope[$scope.list];
      var item;

      if (item = list[matchIndex]) {
        $scope.onSelect(item);
      }

      // activeIndex가 제일 마지막 item일때 선택되었다면
      // activeIndex를 마지막 item의 이전 item으로 설정하여 activeIndex list에 항상 보이도록 함
      if (list.length - 1 === matchIndex) {
        $scope.setActiveIndex(list.length - 2);
      }
    }

    /**
     * set active index
     * @param {number} matchIndex
     */
    function setActiveIndex(matchIndex) {
      $scope.activeIndex = matchIndex;
    }

    /**
     * is active
     * @param {number} matchIndex
     * @returns {boolean}
     */
    function isActive(matchIndex) {
      return $scope.activeIndex == matchIndex;
    }
  }
})();
