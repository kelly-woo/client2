/**
 * @fileoverview member profile service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MemberProfile', MemberProfile);

  /* @ngInject */
  function MemberProfile($state) {
    var that = this;

    that.openFileList = openFileList;
    that.goToDM = goToDM;

    /**
     * 오른쪽 패널의 파일 리스트 열기
     */
    function openFileList() {
      if ($state.current.name != 'messages.detail.files') {
        $state.go('messages.detail.files');
      }
    }

    /**
     * 센터 패널의 챗 리스트를 해당 DM으로 이동
     * @param {number} memberId
     */
    function goToDM(memberId) {
      // TODO: REFACTOR ROUTE.SERVICE
      var routeParam = {
        entityType: 'users',
        entityId: memberId
      };

      $state.go('archives', routeParam);
    }
  }
})();
