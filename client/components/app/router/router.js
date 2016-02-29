(function() {
  'use strict';

  angular
    .module('app.router', [
      'ui.router'
    ])
    .config(config)
    .run(run);


  /* @ngInject */
  function run($rootScope, Router) {
    // angular ui-router events
    $rootScope.$on('$stateChangeStart', Router.onStateChangeStart);
    $rootScope.$on('$stateChangeSuccess', Router.onStateChangeSuccess);
    $rootScope.$on('$stateNotFound', Router.onStateNotFound);

    // angular $route events
    $rootScope.$on("$routeChangeError", Router.onRouteChangeError);
  }

  /* @ngInject */
  function config($stateProvider, $urlRouterProvider) {
    //_setState();
    //_setTutorialState();
    _setUrlRoutingRule();

    /**
     * routing rule 을 설정한다.
     * @private
     */
    function _setUrlRoutingRule() {
      /* URL routing rule for exception */
      $urlRouterProvider
        .when("", "/")
        .when("/channels/:id/", "/channels/:id")
        .when("/privategroups/:id/", "/privategroups/:id")
        .when("/passwordReset?teamId&token", "/passwordreset?teamId&token")
        .otherwise("/404");

      /* URL must be lower-case */
      $urlRouterProvider.rule(function ($injector, $location) {
        var path = $location.path(),
          normalized = path.toLowerCase();

        if (path !== normalized) {
          return normalized;
        }
      });
    }
  }
})();

