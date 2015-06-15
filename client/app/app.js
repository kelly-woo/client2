'use strict';

var app = angular.module('jandiApp', [
  'config.framework',
  'jandi.framework',
  'base.framework',
  'app.framework'
]);

app.run(function($rootScope, $state, $stateParams, $urlRouter, storageAPIservice, publicService, entityAPIservice,
                 fileAPIservice, configuration, Preloader) {

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
        if (fromState.name === '') {
          // fromState name이 없고 toState name이 files 일때(/files/ uri에 direct로 접근하는 경우) $state 로직상 계속 해서 request를 전달하여
          // browser가 멈추는 현상이 발생 하므로 이경우 toParam에 포함된 message id로 특정 file의 fileUrl로 redirect 하도록 처리함.
          fileAPIservice.getFileDetail(toParams.itemId)
            .success(function(response) {
              var msgs;
              var msg;
              var url;
              var i;
              var len;

              if (response) {
                msgs = response.messageDetails;
                for (i = msgs.length - 1; i > -1; --i) {
                  msg = msgs[i]
                  if (msg.contentType === 'file') {
                    url = msg.content.fileUrl;
                    location.href = /^[http|https]/.test(url) ? url : configuration.api_address + url;
                    break;
                  }
                }
              }
            })
            .error(function(err) {
              console.error(err.msg);
            });
          return;
        } else {
          event.preventDefault();
          $state.transitionTo('messages.detail.files.redirect', _.extend(fromParams, toParams), {  });
        }
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
      case '404':
        event.preventDefault();
        $state.go('notfound');
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

  _preload();

  /**
   * preload template & images
   * @private
   */
  function _preload() {
    Preloader.template([
      'app/disconnect/disconnect.html'
    ]).img([
      '../assets/images/icon_network_error.png'
    ]);
  }
});

app.config(function ($urlRouterProvider, $httpProvider) {

  $httpProvider.interceptors.push('authInterceptor');
  $httpProvider.interceptors.push('NetInterceptor');

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

});
