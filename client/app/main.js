'use strict';

var app = angular.module('jandiApp');

app.config(function ($stateProvider, $analyticsProvider) {
    $stateProvider
        .state('signin', {
            url: '/',
            title: 'SignIn',
            templateUrl: 'app/signin/signin.html',
            controller: 'authController'
        })
        .state('messages', {
            abstract    : true,
            url         : '/messages',
            views       : {
                '': {
                    templateUrl : 'app/left/left.html',
                    controller  : 'leftpanelController',
                    resolve     : {
                        leftPanel   : function (leftpanelAPIservice) {
                            return leftpanelAPIservice.getLists();
                        },
                        user        : function (leftPanel) {
                            return leftPanel.data.user;
                        },
                        defaultChannel: function(leftpanelAPIservice, leftPanel) {
                            return leftpanelAPIservice.getDefaultChannel(leftPanel.data);
                        }
                    }
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
                'headerpanel' : {
                    templateUrl : 'app/header/header.html',
                    controller  : 'headerController'
                },
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
        });
});
