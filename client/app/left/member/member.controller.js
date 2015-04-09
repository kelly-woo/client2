(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('currentMemberCtrl', currentMemberCtrl);

  /* @ngInject */
  function currentMemberCtrl($scope, publicService, currentSessionHelper) {
    var vm = $scope;

    vm.team = currentSessionHelper.getCurrentTeam();
    vm.onCurrentMemberContainerClick = onCurrentMemberContainerClick;
    vm.onSignOutClick = onSignOutClick;

    function onCurrentMemberContainerClick() {
      publicService.openCurrentMemberModal(vm);
    }

    function onSignOutClick() {
      publicService.signOut();
    }
  }
})();