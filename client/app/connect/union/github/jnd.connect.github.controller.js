/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGithubCtrl', JndConnectGithubCtrl);

  /* @ngInject */
  function JndConnectGithubCtrl($scope, $q, $timeout, JndConnectDummy, Dialog, JndConnectGithubApi, JndConnectUnionApi) {
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
      branch: []
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
    $scope.repositories = [
      {
        text: '@불러오는중',
        value: ''
      }
    ];

    $scope.formData = {
      roomId: null,
      repoId: null,
      branches: '',
      header: {},
      footer: {
        botThumbnailFile: $scope.requestData.botThumbnailFile,
        botName: 'Github'
      }
    };

    $scope.isRepoLoaded = false;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.isModify = !!$scope.current.connectId;
      _attachEvents();
      _initialRequest();
    }

    /**
     * github 데이터를 가져오기 위한 첫번째 request
     * @private
     */
    function _initialRequest() {
      //create
      var deferred = $q.defer();
      var promises = [];

      promises.push(JndConnectGithubApi.getRepos());

      if (!$scope.isModify) {
        $scope.isInitialized = true;
      } else {
        promises.push(JndConnectGithubApi.get($scope.current.connectId));
      }

      $q.all(promises)
        .then(_onInitialRequestSuccess, _onInitialRequestFailed);
    }

    function _onInitialRequestSuccess(results) {
      _onSuccessRepo(results[0].data);
      if ($scope.isModify) {
        _onSuccessGetSetting(results[1].data);
      }
    }

    function _onInitialRequestFailed() {
      console.log('failed');
    }

    function _onSuccessGetSetting(response) {
      console.log(response);
      $scope.requestData = {
        mode: 'authed',
        connectId: $scope.current.connectId,
        roomId: response.roomId,
        botName: '????? none',
        botThumbnailFile: '????? none',
        lang: response.lang,
        repo: '??? hookId',
        events: response.hookEvent,
        branch: response.hookBranch
      };
      //_.extend($scope.requestData, {
      //  roomId: response.roomId,
      //
      //});
      //$scope.requestData = {
      //  mode: 'authed',
      //  roomId: null,
      //  botName: 'Github',
      //  botThumbnailFile: 'https://files.jandi.io/files-profile/94918bd3ab4222a1e5d57d427706164b?size=80',
      //  lang: 'ko',
      //  authenticationId: null,
      //  repo: '',
      //  events: [],
      //  branch: []
      //};
    }

    /**
     * 초기 request 성공 시 이벤트 핸들러
     * @private
     */
    function _onSuccessRepo(response) {
      //var githubData = JndConnectDummy.get('github');
      _originalRepos = response.repos;

      $scope.requestData.authenticationId = response.authenticationId;
      $scope.repositories =_getSelectboxRepos(response.repos);
      $scope.formData.repoId = null;
      $scope.isRepoLoaded = true;
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
      var isDisabled;
      _.forEach(repos, function(group) {
        list = [];
        _.forEach(group.lists, function(repo) {
          isDisabled = repo.permissions && repo.permissions.admin === false;
          list.push({
            text: repo.name,
            value: repo.id,
            isDisabled: isDisabled
          });
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
      JndConnectUnionApi.create('github', $scope.requestData)
        .success(_onCreateSuccess);

      console.log('$scope.requestData', $scope.requestData);
      console.log('$scope.formData', $scope.formData);
    }

    function _onCreateSuccess() {
      Dialog.success({
        body:  '성공성공',
        allowHtml: true,
        extendedTimeOut: 0,
        timeOut: 0
      });
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
      $scope.requestData.events = events.join(',');
    }

    /**
     * 서버 포멧에 맞춘 branch 배열을 반환한다.
     * @returns {String}
     * @private
     */
    function _getBranches() {
      var text = _.trim($scope.formData.branches);
      var results = [];
      var branches = _.trim($scope.formData.branches).split(',');
      if (text) {
        _.forEach(branches, function(branch) {
          branch = _.trim(branch);
          if (branch) {
            results.push(branch);
          }
        });
      }
      return results.join(',');
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
