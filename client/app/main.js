//'use strict';

var app = angular.module('jandiApp');

app.config(function ($stateProvider) {
  $stateProvider
    .state('tutorial', {
      url         : '/tutorial',
      templateUrl : 'app/tutorial/popup/tutorial.main.html',
      controller  : 'tutorialMainCtrl'
    })
    .state('tutorial.team', {
      abstract: true,
      url: '/team',
      template: '<ui-view/>'
    })
    .state('tutorial.team.invitation', {
      url         : '/invitation',
      templateUrl : 'app/tutorial/popup/view_components/lecture/team/invitation/lecture.team.invitation.html',
      controller  : 'lectureTeamInvitationCtrl'
    })
    .state('tutorial.topic', {
      abstract: true,
      url: '/topic',
      template: '<ui-view/>'
    })
    .state('tutorial.topic.create', {
      url: '/create',
      templateUrl: 'app/tutorial/popup/view_components/lecture/topic/create/lecture.topic.create.html',
      controller: 'lectureTopicCreateCtrl'
    })
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
                  publicService.signOut();
                });
            }
          }
        },
        'headerpanel' : {
          templateUrl : 'app/header/header.html',
          controller  : 'headerCtrl'
        },
        'rightpanel': {
          templateUrl: 'app/right/right.html',
          controller: 'rPanelCtrl'
        },
        'detailpanel': {
          templateUrl : 'app/right/file.detail/file.detail.html',
          controller  : 'fileDetailCtrl'
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
          templateUrl : 'app/right/file.detail/file.detail.html',
          controller  : 'fileDetailCtrl'
        }
      }
    })
    .state('archives', {
      url         : '/archives/{entityType}/{entityId}'
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
    .state('mobile', {
      url         : '/mobile',
      templateUrl : 'app/mobile/mobile.catcher.html',
      controller  : 'mobileCatcherController'
    })
    .state('503', {
      url         : '/gongsajung',
      templateUrl : 'app/tpl/503/503.html',
      controller  : 'underConstructionCtrl'
    })
    .state('404', {
      url         : '/404',
      title       : '404',
      templateUrl : 'app/error/404.html',
      controller  : 'errorController'
    })
    .state('notfound', {
      url         : '/lostinjandi',
      title       : '404',
      templateUrl : 'app/error/404.html',
      controller  : 'errorController'
    });

});
