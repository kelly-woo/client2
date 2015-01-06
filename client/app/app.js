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
    'angulartics.google.analytics.custom',
    'monospaced.elastic'
]);

app.run(function($rootScope, $state, $stateParams, $urlRouter, localStorageService, entityAPIservice, gettextCatalog, configuration, storageAPIservice, publicService) {

    $rootScope._ = window._;

    $rootScope.$state       = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.isReady = false;


    // api_version will be no longer needed in this format.
    var api_address = configuration.api_address;
    var api_version = configuration.api_version;

    $rootScope.server_address   = api_address + "inner-api/";
    $rootScope.server_uploaded  = api_address;
    $rootScope.api_version      = api_version;

    /*
        'language'      : is for translator to bring right language for current user. Translator needs this value.
        'serverLang'    : is for server to detect right language for current user.  Server needs this value.
        'notification'  : soon to be implement
     */
    $rootScope.preferences      = {
        language        : gettextCatalog.currentLanguage,
        serverLang      : '',
        notification    : ''
    };

    $rootScope.listLangs = [
        { "value": "ko",    "text": "한국어" },
        { "value": "en", "text": "English" },
        { "value": "zh-cn", "text": "简体中文 " },
        { "value": "zh-tw", "text": "繁體中文" },
        { "value": "ja",    "text": "日本語"}
    ];

    // Stores templates in angular variable.
    // TODO: angular variable로 가지고 있지말고 configuration 처럼 가지고 있는건 어떠한가?
    $rootScope.templates = {
        'header'    : 'app/tpl/header.tpl.html',
        'footer'    : 'app/tpl/footer.tpl.html',
        'loading'   : 'app/tpl/loading.tpl.html'
    };

    $rootScope.$on("$routeChangeError", function(event, current, previous, rejection) {
        $state.go('messages.home');
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

        //console.info("==============================[stateChange]==============================");
        //console.info("   from    ", fromState.name, ' / ', fromParams);
        //console.info("    to     ", toState.name, ' / ',toParams);
        //console.info("=========================================================================");

        if (!fromState.name) {
            // if external access, continue to original state
        }
        else {
            // otherwise, internal access, redirect to messages state
            switch(toState.name) {
                case 'signin':
                    break;
                case 'archives':
                    event.preventDefault();
                    if ( toParams.entityId == $rootScope.member.id ) {
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

                    // If lastState doesn't exist.
                    // Direct user to default channel.
                    if (!lastState || lastState.userId != storageAPIservice.getSessionUserId()) {
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

    var debugMode = (configuration.name === 'development');

    // translate for multi-lang
    $rootScope.setLang = function(setLang, isDebug) {
        isDebug = isDebug || false;

        publicService.getLanguageSetting(setLang);

        // 언어 설정 for nggettext(translator)
        publicService.setCurrentLanguage($rootScope.preferences.language);
        publicService.setDebugMode(isDebug);
    };

    // Language Setup
    $rootScope.setLang(storageAPIservice.getLastLang() || navigator.language || navigator.userLanguage, debugMode);


    <!-- analytics start -->
    initMixPanel();
    initGoogleAnalytics();
    <!-- analytics end -->

    function initMixPanel() {
        (function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
            for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="//cdn.mxpnl.com/libs/mixpanel-2.2.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
        mixpanel.init(configuration.mp_token);
    }
    function initGoogleAnalytics() {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', configuration.ga_token, 'auto');
        ga('create', configuration.ga_token_global, 'auto', {'name': 'global_tracker'});
    }
});

app.config(function ($urlRouterProvider, $httpProvider, $locationProvider, localStorageServiceProvider) {

    $httpProvider.interceptors.push('authInterceptor');

    /* LocalStorage prefix setting */
    localStorageServiceProvider.setPrefix('_jd_');
    localStorageServiceProvider.setStorageCookie(45, '/');
    localStorageServiceProvider.setStorageCookieDomain('jandi.com');

    /* URL routing rule for exception */
    $urlRouterProvider
        .when("", "/")
        .when("/messages/", "/messages")
        .when("/channels/:id/", "/channels/:id")
        .when("/users/:id/", "/users/:id")
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
