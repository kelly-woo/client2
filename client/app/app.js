'use strict';

var app = angular.module('jandiApp', [
  'config.framework',
  'jandi.framework',
  'base.framework',
  'app.framework'
]);

app.run(function($rootScope, $state, $stateParams, $urlRouter, storageAPIservice, publicService, entityAPIservice,
                 fileAPIservice, configuration) {

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

  publicService.getBrowserInfo();

});

app.config(function ($urlRouterProvider, $httpProvider, $tooltipProvider) {

  $httpProvider.interceptors.push('AuthInterceptor');
  $httpProvider.interceptors.push('NetInterceptor');

  $tooltipProvider.setTriggers({
      'show': 'hide'
  });
});
