(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('currentMemberCtrl', currentMemberCtrl);

  /* @ngInject */
  function currentMemberCtrl($scope, $rootScope, publicService, currentSessionHelper, memberService) {
    var vm = $scope;

    vm.team = currentSessionHelper.getCurrentTeam();
    vm.onCurrentMemberContainerClick = onCurrentMemberContainerClick;
    vm.onSignOutClick = onSignOutClick;
    vm.member = memberService.getMember();

    function onCurrentMemberContainerClick() {
      publicService.openCurrentMemberModal(vm);
    }

    function onSignOutClick() {
      publicService.signOut();
    }

    $rootScope.$watch('member', function() {
      vm.member = memberService.getMember();
    })
  }
})();