(function() {
  angular
    .module('jandiApp')
    .controller('mobileCatcherController', mobileCatcherController);

  function mobileCatcherController($scope, $state, $rootScope, urlScheme) {

    (function() {
      if(angular.isUndefined($rootScope.mobileStatus))
        $state.go('signin');

      $('.mobile-catcher').height($(window).height())

      $('.signin-mobile-background-img').bind('load', function() {
        $('.mobile-catcher').css('opacity', 1);
      });

    })();

    $scope.toMobileApplication = function() {
      urlScheme.urlScheme();
    };

    $scope.isLang = function(lang) {
      return $rootScope.language == lang;
    };
  }
})();