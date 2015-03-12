//'use strict';

var app = angular.module('jandiApp');

app.config(function ($stateProvider) {
  $stateProvider
    .state('signin', {
      url         : '/',
      title       : 'Sign In',
      templateUrl : 'app/signin/signin.html',
      controller  : 'authController'
    })
    .state('messages', {
      abstract    : true,
      url         : '/messages',
      views       : {
        '': {
          templateUrl : 'app/left/left.html',
          controller  : 'leftPanelController1',
          resolve     : {
            leftPanel: function (leftpanelAPIservice, publicService, storageAPIservice) {
              return leftpanelAPIservice.getLists()
                .error(function(err) {
                  console.log('lkjasdlfjal;sdkfjl;')
                  publicService.signOut();
                });
            }
          }
        },
        'headerpanel' : {
          templateUrl : 'app/header/header.html',
          controller  : 'headerController'
        },
        'rightpanel': {
          templateUrl: 'app/right/right.html',
          controller: 'rightpanelController'
        },
        'detailpanel': {
          templateUrl : 'app/right/file.html',
          controller  : 'fileController'
        }
      }
    })
    .state('messages.home', {
      url         : '',
      title       : 'Welcome',
      views       : {
        'centerpanel': {
          templateUrl : 'app/main.html'
        }
      }
    })
    .state('messages.detail', {
      url         : '^/{entityType}/{entityId:[0-9]+}',
      title       : 'Messages',
      views       : {
        'centerpanel': {
          templateUrl : 'app/center/center.html',
          controller  : 'centerpanelController'
        }
      }
    })
    .state('messages.detail.files', {
      url         : '/files',
      title       : 'FILE LIST'
    })
    .state('messages.detail.files.item', {
      url         : '/:itemId',
      title       : 'FILE DETAIL'
    })
    .state('messages.detail.files.redirect', {
      params      : [ 'entityType', 'entityId', 'userName', 'itemId' ],
      views       : {
        'detailpanel@': {
          templateUrl : 'app/right/file.html',
          controller  : 'fileController'
        }
      }
    })
    .state('archives', {
      url         : '/archives/{entityType}/{entityId}',
      template    : '<h1>팀사이트 > Recent Activity of {{userId}}</h1>',
      controller  : function($scope, $stateParams) {
        $scope.userId = $stateParams.entityId;
      }
    })
    .state('files', {
      url         : '/files/{userName}/{itemId}',
      controller  : ''
    })
    .state('error', {
      url         : '/error?code&msg&referrer',
      title       : 'ERROR',
      controller  : 'errorController'
    })
    .state('404', {
      url         : '/404',
      title       : '404',
      views       : {
        '': {
          templateUrl : 'app/error/404.html',
          controller  : 'errorController'
        }
      }
    })
    .state('password', {
      url         : '/passwordreset?token',
      title       : 'Reset Password',
      templateUrl : 'app/password/password.reset.html',
      controller  : 'passwordResetController'
    })
    .state('mobile', {
      url         : '/mobile',
      templateUrl : 'app/mobile/mobile.catcher.html',
      controller  : 'mobileCatcherController'
    });
  ;
});
