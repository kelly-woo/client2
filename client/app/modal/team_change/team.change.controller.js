(function() {
    angular
        .module('jandiApp')
        .controller('teamChangeController', teamChangeController);

    function teamChangeController($rootScope, $scope, $modalInstance, accountService) {
        $scope.onModalClose = function() {
            $modalInstance.close('dismiss');
        };
    }
})();