(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectCtrl', JndConnectCtrl);

  /* @ngInject */
  function JndConnectCtrl($scope, JndConnect) {
    var UNION_LIST = [
      {
        name: 'google-calendar',
        icon: '',
        title: 'Google Calendar',
        desc: 'Google Calendar에 등록된 일정에 대한 알림을 잔디에서 확인할 수 있습니다.',
        popover: ''
      },
      {
        name: 'google-drive',
        icon: '',
        title: 'Google Drive',
        desc: 'Google Drive 에 등록된 파일을 잔디로 공유할 수 있습니다.',
        popover: ''
      },
      {
        name: 'github',
        icon: '',
        title: 'Github',
        desc: 'Github의 repository를 등록하여 변경사항을 잔디에서 확인할 수 있습니다.',
        popover: ''
      },
      {
        name: 'dropbox',
        icon: '',
        title: 'Dropbox',
        desc: 'Dropbox에 공유된 파일을 손쉽게 잔디로 공유할 수 있습니다.',
        popover: ''
      },
      {
        name: 'jira',
        icon: '',
        title: 'Jira',
        desc: 'Jira에 등록된 이슈들에 대한 알림을 잔디에서 확인할 수 있습니다',
        popover: ''
      }
    ];

    $scope.historyBack = historyBack;
    $scope.close = close;
    $scope.list = UNION_LIST;
    _init();

    function _init() {

    }

    function close() {
      JndConnect.hide();
    }

    function historyBack() {
      JndConnect.hide();
    }
  }
})();
