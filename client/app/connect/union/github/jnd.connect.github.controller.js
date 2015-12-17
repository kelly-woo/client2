/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGithubCtrl', JndConnectGithubCtrl);

  /* @ngInject */
  function JndConnectGithubCtrl($scope, $timeout, JndConnectDummy) {
    var _originalRepos;

    $scope.requestData = {
      mode: 'authed',
      roomId: null,
      botName: 'Github',
      botThumbnailFile: 'https://files.jandi.io/files-profile/94918bd3ab4222a1e5d57d427706164b?size=80',
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

    $scope.isInitialized = false;
    $scope.repositories = [];

    $scope.formData = {
      roomId: null,
      repoId: null,
      branches: '',
      header: {},
      footer: {
        botThumbnailFile: $scope.requestData.botThumbnailFile
      }
    };


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

    /**
     * github 데이터를 가져오기 위한 첫번째 request
     * @private
     */
    function _initialRequest() {
      $timeout(_onInitialRequestSuccess, 1000);
    }

    /**
     * 초기 request 성공 시 이벤트 핸들러
     * @private
     */
    function _onInitialRequestSuccess() {
      var githubData = JndConnectDummy.get('github');
      _originalRepos = githubData.repo.repos;

      $scope.repositories =_getSelectboxRepos(githubData.repo.repos);
      $scope.requestData.authenticationId = githubData.repo.authenticationId;
      $scope.isInitialized = true;
    }

    /**
     * selectbox 에 전달하기 위한 repository 데이터
     * @param {Array} repos
     * @returns {Array}
     * @private
     */
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

    /**
     * 이벤트 핸들러를 바인딩한다.
     * @private
     */
    function _attachEvents() {
      $scope.$on('unionFooter:save', _onSave);
    }

    /**
     * 설정 저장하기 버튼 클릭 시 이벤트 핸들러
     * @private
     */
    function _onSave() {
      _setRequestData();
      console.log('$scope.requestData', $scope.requestData);
      console.log('$scope.formData', $scope.formData);
    }

    /**
     * request 데이터를 가공한다.
     * @private
     */
    function _setRequestData() {
      var events = [];
      var formData = $scope.formData;
      var footer = formData.footer;
      _.each($scope.githubEvents, function(value, key) {
        if (value) {
          events.push(key);
          if (key === 'create') {
            events.push('delete');
          }
        }
      });
      _.extend($scope.requestData, {
        roomId: formData.roomId,
        repo: _getRepoData(formData.repoId).full_name,
        branch: _getBranches(),
        botName: footer.botName,
        botThumbnailFile: footer.botThumbnailFile
    });
      $scope.requestData.events = events;
    }

    /**
     * 서버 포멧에 맞춘 branch 배열을 반환한다.
     * @returns {Array}
     * @private
     */
    function _getBranches() {
      var branches = $scope.formData.branches.split(',');
      branches = _.map(branches, function(branch) {
        return _.trim(branch);
      });
      return branches;
    }

    /**
     * repository ID 를 이용하여 실제 저장소 데이터를 반환한다.
     * @param {number} repoId
     * @returns {*}
     * @private
     */
    function _getRepoData(repoId) {
      var repoData;
      _.forEach(_originalRepos, function(group) {
        if (repoData) {
          return false;
        }
        _.forEach(group.lists, function(repo) {
          if (repo.id === repoId) {
            repoData = repo;
            return false;
          }
        });
      });
      return repoData;
    }
  }
})();
