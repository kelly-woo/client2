(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('currentMemberCtrl', currentMemberCtrl);

  /* @ngInject */
  function currentMemberCtrl($scope, publicService) {
    var vm = $scope;

    vm.onCurrentMemberContainerClick = onCurrentMemberContainerClick;

    function onCurrentMemberContainerClick() {
      publicService.openCurrentMemberModal(vm);
    }

  }
})();