'use strict';

var app = angular.module('jandiApp', [
  'base.framework',
  'app.framework'
]);

app.run(function($rootScope, $state, $stateParams, $urlRouter, storageAPIservice, publicService, entityAPIservice) {

  $rootScope._ = window._;

  $rootScope.$state       = $state;
  $rootScope.$stateParams = $stateParams;

  $rootScope.isReady = false;

  // Stores templates in angular variable.
  // TODO: angular variable로 가지고 있지말고 configuration 처럼 가지고 있는건 어떠한가?
  // TODO: STUDY AND USE 'ngTemplate'
  $rootScope.templates = {
    'header'    : 'app/tpl/header.tpl.html',
    'footer'    : 'app/tpl/footer.tpl.html',
    'loading'   : 'app/tpl/loading.tpl.html',
    'msgList'   : 'app/left/messages/messages.html'
  };

  $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
    $state.go('messages.home');
  });

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

    //console.info("==============================[stateChange]==============================");
    //console.info("   from    ", fromState.name, ' / ', fromParams);
    //console.info("    to     ", toState.name, ' / ',toParams);
    //console.info("=========================================================================");


    if ($rootScope.isMobile  && toState.name != 'mobile') {
      if (toState.name == "password") {
        return;
      }
      else if (storageAPIservice.getAccessToken()) {
        event.preventDefault();
        $state.go('mobile');
      }
    }

      // otherwise, internal access, redirect to messages state
      switch(toState.name) {
        case 'signin':
          break;
        case 'archives':
          event.preventDefault();

          if ( fromState.name.indexOf("files") !== -1 ) {
            if (fromParams.itemId) {
              // file detail view
              $state.go('messages.detail.files.item', _.extend(toParams, {"itemId": fromParams.itemId}));
            } else {
              // file list view
              $state.go('messages.detail.files', toParams);
            }
          } else {
            $state.go('messages.detail', toParams);
          }
          break;
        case 'files':
          event.preventDefault();
          $state.transitionTo('messages.detail.files.redirect', _.extend(fromParams, toParams), {  });
          break;
        case 'messages' :
        case 'messages.home' :
          var lastState = entityAPIservice.getLastEntityState();

          // If lastState doesn't exist.
          // Direct user to default channel.
          if (!lastState || angular.isUndefined(entityAPIservice.getEntityById(lastState.entityType, lastState.entityId))) {
            entityAPIservice.removeLastEntityState();
            $rootScope.toDefault = true;
            return;
          }

          event.preventDefault();

          if (lastState.rpanel_visible) {
            if (lastState.itemId) {
              $state.go('messages.detail.files.item', { entityType:lastState.entityType, entityId: lastState.entityId, itemId: lastState.itemId });
              return;
            }
            $state.go('messages.detail.files', { entityType:lastState.entityType, entityId: lastState.entityId });
          }
          else {
            $state.go('messages.detail', { entityType:lastState.entityType, entityId: lastState.entityId });
          }

          break;
        default:
          break;
      }
  });

  $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams) {
    console.info("==============================[stateNotFound]==============================");
    console.info("   to", unfoundState.to); // "lazy.state"
    console.info("   toParams", unfoundState.toParams); // {a:1, b:2}
    console.info("   options", unfoundState.options); // {inherit:false} + default options
    console.info("===========================================================================");
  });

  $rootScope.$on('$locationChangeSuccess', function(event) {
    entityAPIservice.setLastEntityState();
  });

  publicService.getBrowserInfo();

});

app.config(function ($urlRouterProvider, $httpProvider) {

  $httpProvider.interceptors.push('authInterceptor');

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

  /* use the HTML5 History API (http://diveintohtml5.info/history.html) */
//    $locationProvider.html5Mode(true);
});
