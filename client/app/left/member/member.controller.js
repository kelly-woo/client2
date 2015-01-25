(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('currentMemberCtrl', currentMemberCtrl);

  currentMemberCtrl.$inject = ['$scope', 'publicService'];
  /* @ngInject */
  function currentMemberCtrl($scope, publicService) {
    var vm = this;

    vm.onCurrentMemberContainerClick = onCurrentMemberContainerClick;

    function onCurrentMemberContainerClick() {
      publicService.openCurrentMemberModal($scope);
    }

  }
})();