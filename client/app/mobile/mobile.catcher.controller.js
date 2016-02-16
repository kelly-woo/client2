(function() {
  angular
    .module('jandiApp')
    .controller('mobileCatcherController', mobileCatcherController);

  function mobileCatcherController($scope, $state, $rootScope, urlScheme, publicService) {

    _init();


    function _init() {
      if(angular.isUndefined($rootScope.mobileStatus))
        $state.go('signin');
      $('.body').removeClass('full-screen');
      $('.mobile-catcher').height($(window).height())

      $('.signin-mobile-background-img').bind('load', function() {
        $('.mobile-catcher').css('opacity', 1);
      });

      publicService.hideTransitionLoading();
    }

    $scope.toMobileApplication = function() {
      urlScheme.urlScheme();
    };

    $scope.isLang = function(lang) {
      return $rootScope.language == lang;
    };
  }
})();