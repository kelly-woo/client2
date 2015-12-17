(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGithubCtrl', JndConnectGithubCtrl);

  /* @ngInject */
  function JndConnectGithubCtrl($scope, $timeout, JndConnectDummy) {
    $scope.requestData = {
      mode: 'authed',
      roomId: null,
      botName: 'Github',
      botThumbnailFile: null,
      lang: 'ko',
      authenticationId: null,
      repo: '',
      events: [],
      branch: [],
      token: ''
    };
    $scope.githubEvents = {
      'push': false,
      'commit_comment': false,
      'pull_request': false,
      'pull_request_review_comment': false,
      'issues': false,
      'issue_comment': false,
      'create': false
    };
    $scope.selectedRoom = null;
    $scope.selectedRepo = 0;
    $scope.isInitialized = false;
    $scope.repositories = [];

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _attachEvents();
      _initialRequest();
      $timeout(function() {
        $scope.isInitialized = true;
      }, 1000);
    }

    function _initialRequest() {
      $timeout(_onInitialRequestSuccess, 1000);
    }

    function _onInitialRequestSuccess() {
      var githubData = JndConnectDummy.get('github');

      $scope.repositories =_getSelectboxRepos(githubData.repo.repos);
      $scope.requestData.authenticationId = githubData.repo.authenticationId;
      $scope.isInitialized = true;
    }

    function _getSelectboxRepos(repos) {
      var groupList = [];
      var list;
      _.forEach(repos, function(group) {
        list = [];
        _.forEach(group.lists, function(repo) {
          list.push({
            text: repo.name,
            value: repo.id
          })
        });
        groupList.push({
          name: group.owner,
          list: list
        });
      });
      return groupList;
    }

    function _attachEvents() {
      $scope.$on('unionFooter:save', _onSave);
    }

    function _onSave() {
      console.log('###github save');
      _setRequestData();
      console.log('$scope.requestData', $scope.requestData);
    }

    function _setRequestData() {
      var events = [];
      _.each($scope.githubEvents, function(value, key) {
        if (value) {
          events.push(key);
          if (key === 'create') {
            events.push('delete');
          }
        }
      });
      $scope.requestData.events = events;
    }
  }
})();
