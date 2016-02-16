(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('currentMemberCtrl', currentMemberCtrl);

  /* @ngInject */
  function currentMemberCtrl($scope, publicService, currentSessionHelper, memberService, modalHelper, AnalyticsHelper) {
    var vm = $scope;

    (function() {
      _setCurrentTeam();
      _setCurrentMember();
    })();

    vm.onCurrentMemberContainerClick = onCurrentMemberContainerClick;
    vm.onSignOutClick = onSignOutClick;

    function onCurrentMemberContainerClick() {
      modalHelper.openUserProfileModal(vm, memberService.getMember());
    }

    function onSignOutClick() {
      //Analtics Tracker. Not Block the Process
      AnalyticsHelper.track(AnalyticsHelper.EVENT.SIGN_OUT);

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