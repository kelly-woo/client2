'use strict';

var app = angular.module('jandiApp', [
    'ui.router',
    'ui.bootstrap',
    'gettext',
    'LocalStorageModule',
    'angularFileUpload',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngAnimate',
    'ngImgCrop'
]);

app.run(function($rootScope, $state, $stateParams, $urlRouter, localStorageService, entityAPIservice, gettextCatalog) {

    $rootScope._ = window._;

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    var api_address = "https:/dev.jandi.com:2323/";
//    var api_address = "../";
    var api_version = 1;

    $rootScope.server_address = api_address + "inner-api/";
    $rootScope.server_uploaded = api_address;
    $rootScope.api_version = api_version;

    $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
        //change this code to handle the error somehow
        $state.go('messages.home');
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

        console.debug("==============================[stateChange]==============================");
        console.debug("   from    ", fromState.name, fromParams);
        console.debug("    to     ", toState.name, toParams);
        console.debug("=========================================================================");

        if (!fromState.name) {
            // if external access, continue to original state
//                console.log("팀사이트로 이동");
        } else {
            // otherwise, internal access, redirect to messages state
            switch(toState.name) {
                case 'archives':
                    event.preventDefault();

                    if ( toParams.entityId == $rootScope.user.id ) {
                        console.warn("prevent redirect to self direct message");
                        return false;
                    }

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
                    if (!lastState) {
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
        }
    });

    $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams) {
        console.warn("==============================[stateNotFound]==============================");
        console.log("   to", unfoundState.to); // "lazy.state"
        console.log("   toParams", unfoundState.toParams); // {a:1, b:2}
        console.log("   options", unfoundState.options); // {inherit:false} + default options
        console.warn("===========================================================================");
    });

    $rootScope.$on('$locationChangeSuccess', function(event) {
        console.log("[$locationChangeSuccess]");

        $rootScope.uiState = localStorageService.get('ui-state');

        entityAPIservice.setLastEntityState();


        // Halt state change from even starting
        // event.preventDefault();
        // Perform custom logic
        // var meetsRequirement = true;
        // Continue with the update and state transition if logic allows
        // if (meetsRequirement) {
        //     $urlRouter.sync();
        // } else {
        //
        // }
    });

    //translate for multi-lang
    $rootScope.setLang = function(lang, isDebug) {
        if(lang) {
            gettextCatalog.currentLanguage = lang;
        } else {
            gettextCatalog.currentLanguage = 'ko_KR';
        }
        gettextCatalog.debug = isDebug;
    };

    // init
    $rootScope.setLang('ko_KR', true);

})

app.config(function ($urlRouterProvider, $httpProvider, $locationProvider, localStorageServiceProvider) {

    $httpProvider.interceptors.push('authInterceptor');

    /* CORS setting */
    // $httpProvider.defaults.useXDomain = true;
    // delete $httpProvider.defaults.headers.common["X-Requested-With"];
    // $httpProvider.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

    /* LocalStorage prefix setting */
    localStorageServiceProvider.setPrefix('_jd_');

    /* URL routing rule for exception */
    $urlRouterProvider
        .when("/messages/", "/messages")
        .when("/channels/:id/", "/channels/:id")
        .when("/users/:id/", "/users/:id")
        .when("/privategroups/:id/", "/privategroups/:id")
        .otherwise("/");

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
