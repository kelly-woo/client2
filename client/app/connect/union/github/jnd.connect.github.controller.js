/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGithubCtrl', JndConnectGithubCtrl);

  /* @ngInject */
  function JndConnectGithubCtrl($scope, Dialog, JndConnectGithubApi, JndConnect, JndUtil,
                                JndConnectUnion) {
    var _originalRepos;
    var _createdRoomId = null;
    var _hookRepoId = null;

    $scope.isInitialized = false;
    $scope.isLoading = false;
    $scope.isRepoLoaded = false;

    $scope.requestData = {
      mode: 'authed',
      authenticationId: null
    };
    $scope.repositories = [
      {
        text: '@불러오는중',
        value: ''
      }
    ];

    $scope.formData = {
      header: {},
      roomId: null,
      hookRepoId: null,
      branches: '',
      hookEvent: {
        'push': false,
        'commit_comment': false,
        'pull_request': false,
        'pull_request_review_comment': false,
        'issues': false,
        'issue_comment': false,
        'create': false
      },
      footer: {}
    };

    $scope.openTopicCreateModal = JndConnect.openTopicCreateModal;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.isUpdate = !!$scope.current.connectId;
      JndConnectUnion.initData($scope.current, {
        header: $scope.formData.header,
        footer: $scope.formData.footer
      });
      _attachEvents();
      _initialRequest();
    }

    /**
     * github 데이터를 가져오기 위한 첫번째 request
     * @private
     */
    function _initialRequest() {
      JndConnectGithubApi.getRepos()
        .success(_onSuccessGetRepo)
        .error(JndUtil.alertUnknownError);

      //update 모드가 아닐 경우 바로 view 를 노출한다.
      if (!$scope.isUpdate) {
        $scope.isInitialized = true;
      } else {
        JndConnectUnion.read({
          current: $scope.current,
          header: $scope.formData.header,
          footer: $scope.formData.footer
        }).success(_onSuccessGetSetting);
      }
    }

    /**
     * setting 조회 성공 시 콜백
     * @param {object} response
     * @private
     */
    function _onSuccessGetSetting(response) {
      var formData = $scope.formData;

      formData.roomId = response.roomId;
      formData.hookRepoId = _hookRepoId = response.hookRepoId;

      //branches
      formData.branches = response.hookBranch.join(',');

      //hookEvent
      _.forEach(response.hookEvent, function(eventName) {
        if (!_.isUndefined(formData.hookEvent[eventName])) {
          formData.hookEvent[eventName] = true;
        }
      });
      $scope.isInitialized = true;
    }

    /**
     * 레포지토리 정보 조회 성공 시 이벤트 핸들러
     * @private
     */
    function _onSuccessGetRepo(response) {
      _originalRepos = response.repos;
      $scope.requestData.authenticationId = response.authenticationId;
      $scope.repositories =_getSelectboxRepos(response.repos);
      $scope.isRepoLoaded = true;
      $scope.isInitialized = true;
      $scope.formData.hookRepoId = _hookRepoId;
      JndConnectUnion.setHeaderAccountData($scope.formData.header, response);
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
      groupList.push({
        text: '@선택하세요',
        value: ''
      });
      _.forEach(repos, function(group) {
        list = [];
        _.forEach(group.lists, function(repo) {
          isDisabled = JndUtil.pick(repo, 'permissions', 'admin') === false;
          list.push({
            text: repo.name,
            value: repo.id,
            isDisabled: isDisabled
          });
        });
        groupList.push({
          groupName: group.owner,
          groupList: list
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
      $scope.isLoading = true;
      var invalidField = _getInvalidField();
      if (!invalidField) {
        JndConnectUnion.save({
          current: $scope.current,
          data: $scope.requestData
        }).finally(_onSaveEnd);
      } else {
        _onSaveEnd();
        Dialog.error({
          'title': '@required 필드 오류'
        });
      }
    }

    /**
     * 저장 완료 이후 반드시 수행되는 콜백
     * @private
     */
    function _onSaveEnd() {
      $scope.isLoading = false;
    }

    /**
     * request 데이터를 가공한다.
     * @private
     */
    function _setRequestData() {
      var hookEvent = [];
      var formData = $scope.formData;
      var requestData = $scope.requestData;
      var footer = formData.footer;
      _.each(formData.hookEvent, function(value, key) {
        if (value) {
          hookEvent.push(key);
          if (key === 'create') {
            hookEvent.push('delete');
          }
        }
      });
      _.extend(requestData, footer, {
        roomId: formData.roomId,
        hookRepoId: formData.hookRepoId,
        hookRepoName: JndUtil.pick(_getRepoData(formData.hookRepoId), 'full_name'),
        hookEvent: hookEvent.join(','),
        hookBranch: _getBranches()
      });
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

    /**
     *
     * @returns {*}
     * @private
     */
    function _getInvalidField() {
      var invalidField = null;
      var requiredList = [
        'roomId',
        'hookRepoId',
        'hookEvent',
        'botName',
        'lang'
      ];

      _.forEach(requiredList, function(fieldName) {
        if (!$scope.requestData[fieldName]) {
          invalidField = fieldName;
          return false;
        }
      });

      return invalidField;
    }
  }
})();
