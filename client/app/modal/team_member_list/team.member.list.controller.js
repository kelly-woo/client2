(function () {

  'use strict';

  angular
    .module('jandiApp')
    .controller('teamMemberListCtrl', teamMemberListCtrl);

  teamMemberListCtrl.$inject = ['$scope', '$rootScope', '$state', '$modalInstance'];
  /* @ngInject */
  function teamMemberListCtrl($scope, $rootScope, $state, $modalInstance) {
    var vm = $scope;

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

      $scope.enabledMemberList = enabledMemberList;
      $scope.disabledMemberList = disabledMemberList;


    }
    function cancel() {
      $modalInstance.dismiss('close');
    }
  }
})();