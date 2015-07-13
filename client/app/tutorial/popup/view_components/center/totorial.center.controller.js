/**
 * @fileoverview 튜토리얼 가이드 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialCenterCtrl', function ($scope, $rootScope, $state, $filter, TutorialData) {

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      var account;
      TutorialData.get('accountPromise').then(function() {
        account = TutorialData.getAccount();
        $scope.name = account.name;
        $scope.profileUrl = $filter('getFileUrl')(account.u_photoThumbnailUrl.smallThumbnailUrl);

        $scope.messages = [
          {
            contentType: 'date',
            date: _getDate()
          },
          {
            contentType: 'file',
            profileUrl: $scope.profileUrl,
            name: $scope.name,
            content: {
              title: 'JANDI UPDATE',
              type: 'image/vnd.adobe.photoshop',
              ext: 'psd',
              size: 2048
            },
            shared: [
              {name: '어쩌구'}
            ],
            time: (new Date()).getTime(),
            unreadCount: 1
          },
          {
            contentType: 'sticker',
            profileUrl: $scope.profileUrl,
            name: $scope.name,
            content: 'https://jandi-box.com/files-sticker/100/11',
            time: (new Date()).getTime(),
            unreadCount: 1
          },
          {
            contentType: 'text',
            profileUrl: $scope.profileUrl,
            name: $scope.name,
            content: 'test0',
            time: (new Date()).getTime()
          },
          {
            contentType: 'text',
            profileUrl: $scope.profileUrl,
            name: $scope.name,
            content: 'test1',
            time: (new Date()).getTime(),
            unreadCount: 1
          }
        ];
      });
    }

    function _getText() {

    }

    function _getDate(time) {
      time = time || (new Date()).getTime();
      return $filter('ordinalDate')(time, "EEEE, MMMM doo, yyyy");
    }
    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
    }
  });
})();
