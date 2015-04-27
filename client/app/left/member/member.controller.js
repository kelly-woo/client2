(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('currentMemberCtrl', currentMemberCtrl);

  /* @ngInject */
  function currentMemberCtrl($scope, $rootScope, publicService, currentSessionHelper, memberService) {
    var vm = $scope;

    (function() {
      _setCurrentTeam();
      _setCurrentMember();
    })();

    vm.onCurrentMemberContainerClick = onCurrentMemberContainerClick;
    vm.onSignOutClick = onSignOutClick;

    function onCurrentMemberContainerClick() {
      publicService.openCurrentMemberModal(vm);
    }

    function onSignOutClick() {
      publicService.signOut();
    }

    function _setCurrentTeam() {
      vm.team = currentSessionHelper.getCurrentTeam();

    }
    function _setCurrentMember() {
      vm.member = memberService.getMember();
    }

    vm.$on('onCurrentMemberChanged', function() {
      _setCurrentMember();
    });

    vm.$on('onTeamInfoUpdated', function() {
      _setCurrentTeam();
    });
  }
})();