(function () {

  'use strict';

  angular
    .module('jandiApp')
    .controller('teamMemberListCtrl', teamMemberListCtrl);

  teamMemberListCtrl.$inject = ['$scope', '$rootScope', '$state', '$modalInstance'];
  /* @ngInject */
  function teamMemberListCtrl($scope, $rootScope, $state, $modalInstance) {
    var vm = $scope;

    vm.onStarClick = onStarClick;
    vm.onMemberClick = onMemberClick;

    function onStarClick(entityType, entityId) {
      $rootScope.$broadcast('onStarClick', entityType, entityId);
    }

    function onMemberClick(entityId) {
      $state.go('archives', { entityType: 'users',  entityId: entityId });
      $modalInstance.dismiss('done');
    }

  }
})();