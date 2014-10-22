'use strict';

var app = angular.module('jandiApp', [
    'ui.router',
    'ui.bootstrap',
    'services.config',
    'gettext',
    'LocalStorageModule',
    'angularFileUpload',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngAnimate',
    'ngImgCrop',
    'angulartics',
    'angulartics.google.analytics',
    'monospaced.elastic'
]);

app.run(function($rootScope, $state, $stateParams, $urlRouter, localStorageService, entityAPIservice, gettextCatalog, configuration) {

    $rootScope._ = window._;

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    <!-- analytics start -->
    (function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
        for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="//cdn.mxpnl.com/libs/mixpanel-2.2.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
    mixpanel.init(configuration.mp_token);
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    ga('create', configuration.ga_token, 'auto');
    <!-- analytics end -->

    var api_address = configuration.api_address;
    var api_version = configuration.api_version;
    $rootScope.server_address = api_address + "inner-api/";
    $rootScope.server_uploaded = api_address;
    $rootScope.api_version = api_version;

    //  set this value to true if you want to display nickname instead of full name.
    $rootScope.displayNickname = false;

    $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
        $state.go('messages.home');
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

        console.debug("==============================[stateChange]==============================");
        console.debug("   from    ", fromState.name, fromParams);
        console.debug("    to     ", toState.name, toParams);
        console.debug("=========================================================================");

        if (!fromState.name) {
            // if external access, continue to original state
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
        $rootScope.uiState = localStorageService.get('ui-state');

        entityAPIservice.setLastEntityState();

        if ($rootScope.setFileDetailCommentFocus) {
            $rootScope.$broadcast('setCommentFocus');
        }
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

    $rootScope.preferences = {
        language        : gettextCatalog.currentLanguage,
        notification    : ''
    };

    // translate for multi-lang
    $rootScope.setLang = function(setLang, isDebug) {
        setLang = setLang || 'ko_KR';
        isDebug = isDebug || false;
        // 언어 설정
        gettextCatalog.setCurrentLanguage(setLang);
        gettextCatalog.debug = isDebug;
        // 현재 언어 저장
        $rootScope.preferences.language = gettextCatalog.currentLanguage;
    };

    // 시스템(브라우저) 기본 언어로 초기화
    var userLang = navigator.language || navigator.userLanguage;
    var debugMode = (configuration.name === 'development');
    switch( userLang ) {
        case 'ko':
        case 'ko_KR':
        case 'ko-KR':
            userLang = 'ko_KR';
            break;
        case 'en':
        case 'en_US':
        case 'en-US':
        default:
            userLang = 'en_US';
            break;
    }
    $rootScope.setLang(userLang, debugMode);

});

app.config(function ($urlRouterProvider, $httpProvider, $locationProvider, localStorageServiceProvider) {

    $httpProvider.interceptors.push('authInterceptor');

    /* LocalStorage prefix setting */
    localStorageServiceProvider.setPrefix('_jd_');

    /* URL routing rule for exception */
    $urlRouterProvider
        .when("", "/")
        .when("/messages/", "/messages")
        .when("/channels/:id/", "/channels/:id")
        .when("/users/:id/", "/users/:id")
        .when("/privategroups/:id/", "/privategroups/:id")
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
