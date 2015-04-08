(function () {

  'use strict';

  angular
    .module('jandiApp')
    .controller('teamMemberListCtrl', teamMemberListCtrl);

  /* @ngInject */
  function teamMemberListCtrl($scope, $rootScope, $state, $modalInstance, modalHelper) {

    var vm = $scope;

    $scope.emptyMessageStateHelper = 'NO_MEMBER_IN_TEAM';

    vm.cancel = cancel;

    $scope.memberListSetting = {
      enabledMemberList: {
        active: true
      },
      disabledMemberList: {
        active: false
      }
    };

    $scope.$on('onSetStarDone', function() {
      generateMemberList();
    });

    var DISABLED_MEMBER_STATUS = 'disabled';
    var ENABLED_MEMBER_STATUS = 'enabled';

    (function() {
      generateMemberList();
    })();

    function generateMemberList() {
      var enabledMemberList = [];
      var disabledMemberList = [];

      _.forEach($scope.memberList, function(member) {
        if (member.status == DISABLED_MEMBER_STATUS) {
          disabledMemberList.push(member);
        } else {
          enabledMemberList.push(member);
        }

      });

      $scope.hasMember = $scope.memberList.length > 0;
      $scope.enabledMemberList = enabledMemberList;
      $scope.disabledMemberList = disabledMemberList;
      $scope.hasDisabledMember = $scope.disabledMemberList.length > 0;
    }
    function cancel() {
      $modalInstance.dismiss('close');
    }
  }
})();