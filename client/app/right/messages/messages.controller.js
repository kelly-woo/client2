/**
 * @fileoverview search messages controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('RightMessagesCtrl', RightMessagesCtrl);

  /* @ngInject */
  function RightMessagesCtrl($scope, $rootScope, $filter, $state, $timeout, AnalyticsHelper, currentSessionHelper,
                             fileAPIservice, jndPubSub, messageAPIservice, RightPanel, RoomTopicList,
                             TopicFolderModel) {
    var DEFAULT_PAGE = 1;
    var DEFAULT_PER_PAGE = 20;

    var _localCurrentEntity;

    //TODO: 활성화 된 상태 관리에 대한 리펙토링 필요
    var _isActivated = false;
    var _timerSearch;

    _init();

    // First function to be called.
    function _init() {
      $scope.isSearching = false;
      $scope.isEndOfList = false;
      $scope.apiError = false;

      $scope.messageList = [];

      $scope.searchStatus = {
        q: '',
        entityId: '',     // messageLocationId
        writerId: '',
        page: DEFAULT_PAGE,
        perPage: DEFAULT_PER_PAGE,

        isApiError: false,
        isSearching: false,
        isScrollLoading: false,
        isEndOfList: false,
        isInitDone: false,
        isKeywordFocus: false,

        length: '',
        type: _getSearchStatusType()
      };

      // Methods
      $scope.loadMore = loadMore;

      $scope.onKeywordChange = onKeywordChange;
      $scope.onResetQuery = onResetQuery;

      $scope.isEmpty = isEmpty;
      $scope.isKeywordEmpty = isKeywordEmpty;
      $scope.setKeywordFocus = setKeywordFocus;

      if (RightPanel.getStateName($state.current) === 'messages') {
        _isActivated = true;
      }

      _localCurrentEntity = currentSessionHelper.getCurrentEntity()

      _initChatRoomOption();
      _setChatRoom(_localCurrentEntity);

      _initChatWriterOption();
      _setDefaultWriter();

      _attachScopeEvents();
    }

    function _attachScopeEvents() {
      $scope.$on('EntityHandler:parseLeftSideMenuDataDone', _initChatRoomOption);

      $scope.$on('rightPanelStatusChange', _onRightPanelStatusChange);
      $scope.$on('topic-folder:update', _initChatRoomOption);
      $scope.$on('onCurrentEntityChanged', _onCurrentEntityChanged);
      $scope.$on('rPanelResetQuery', _onResetQuery);


      // 컨넥션이 끊어졌다 연결되었을 때, refreshFileList 를 호출한다.
      $scope.$on('connected', _onConnected);
      $scope.$on('disconnected', _onDisconnected);

      $scope.$watch('searchStatus.entityId', _onSearchEntityChange);
      $scope.$watch('searchStatus.writerId', _onSearchWriterChange);
    }

    /**
     * '작성된 곳' 옵션 초기화
     * @private
     */
    function _initChatRoomOption() {
      var newOptions = fileAPIservice.getShareOptionsWithoutMe(
        RoomTopicList.toJSON(true),
        currentSessionHelper.getCurrentTeamUserList()
      );
      var newMessageLocation = _getMessageLocation(newOptions);
      $scope.chatRoomOptions = TopicFolderModel.getNgOptions(newOptions);

      if (newMessageLocation) {
        _setChatRoom(newMessageLocation);
      } else {
        _resetChatRoom();
      }
    }

    /**
     * '작성자' 옵션 초기화
     * @private
     */
    function _initChatWriterOption() {
      $scope.chatWriterOptions = fileAPIservice.getShareOptions(currentSessionHelper.getCurrentTeamUserList());
    }

    function _onSearchEntityChange(newValue, oldValue) {
      if (newValue !== oldValue) {
        _refreshMessageList();
      }
    }

    function _onSearchWriterChange(newValue, oldValue) {
      if (newValue !== oldValue) {
        _refreshMessageList();
      }
    }

    /**
     * open right panel event handler
     */
    function _onRightPanelStatusChange($event, data) {
      _isActivated = data.type === 'messages';

      if (_isActivated && !$scope.searchStatus.isInitDone) {
        // 아직 초기화가 진행되어 있지 않다면 전체 갱신한다.

        _refreshMessageList();
      }
    }

    /**
     * Watching joinEntities in parent scope so that currentEntity can be automatically updated.
     * advanced search option 중 'Shared in'/ 을 변경하는 부분.
     */
    function _onCurrentEntityChanged(event, currentEntity) {
      if (_isActivated && _hasLocalCurrentEntityChanged(currentEntity) && !_hasSearchResult()) {
        _localCurrentEntity = currentEntity;

        // search keyword reset
        _setChatRoom(_localCurrentEntity);

        _resetSearchStatusKeyword();
      }
    }

    /**
     * room이 변경되었는지 여부
     * @param {object} newCurrentEntity
     * @returns {boolean}
     * @private
     */
    function _hasLocalCurrentEntityChanged(newCurrentEntity) {
      return !_localCurrentEntity || _localCurrentEntity.id !== newCurrentEntity.id;
    }

    /**
     * 검색에 대한 결과를 가지고 있는지 여부
     * @returns {boolean}
     * @private
     */
    function _hasSearchResult() {
      return !!$scope.searchStatus.q &&
        $scope.messageList.length > 0;
    }

    /**
     * 검색 키워드 변경 이벤트 핸들러
     * @param {string} keyword
     */
    function onKeywordChange(keyword) {
      if (_isValidSearchKeyword()) {
        $scope.searchStatus.keyword = keyword;
        _refreshMessageList();
      }
    }

    /**
     * 타당한 검색 키워드 인지 여부
     * @returns {boolean}
     * @private
     */
    function _isValidSearchKeyword() {
      var keyword = $scope.searchStatus.q;
      return keyword !== '' && keyword.length > 1;
    }

    /**
     * 검색 조건(공유된 곳, 업로드 멤버, 파일 타입) 초기화
     * @private
     */
    function onResetQuery() {
      _setChatRoom();
      _setDefaultWriter();
    }

    /**
     * '업로드 멤버' 기본값 설정
     * @private
     */
    function _setDefaultWriter() {
      $scope.searchStatus.writerId = 'all';
    }

    /**
     * query 리셋
     * @private
     */
    function _onResetQuery() {
      if (_isActivated) {
        _refreshMessageList();
      }
    }

    function _refreshMessageList() {
      if (_isValidRefresh()) {
        _showLoading();

        $scope.messageList = [];

        $scope.searchStatus.page = DEFAULT_PAGE;
        $scope.searchStatus.perPage = DEFAULT_PER_PAGE;
        $scope.searchStatus.isApiError = false;
        $scope.searchStatus.isEndOfList = false;

        $timeout.cancel(_timerSearch);
        _timerSearch = $timeout(function() {

          // 100ms 만큼 지난후 response가 도착하여 잘못된 list를 출력할 수 있으므로 식별자로 _timerSearch를 전달한다.
          _getMessageList(_timerSearch);
        }, 100);
      }
    }

    function _isValidRefresh() {
      return _isActivated && $scope.isConnected && _isValidSearchKeyword();
    }

    function loadMore() {
      if (_isValidLoadMore()) {
        $scope.searchStatus.isScrollLoading = true;

        _getMessageList();
      }
    }

    function _isValidLoadMore() {
      return !$scope.searchStatus.isEndOfList &&
          !$scope.searchStatus.isScrollLoading &&
          !($scope.messageList.length === 0 && $scope.searchStatus.q !== '') &&
          $scope.isConnected;
    }

    function _getMessageList(timerSearch) {
      $scope.searchStatus.keyword = $scope.searchStatus.q;

      messageAPIservice.searchMessages($scope.searchStatus)
        .success(function(response) {
          if (_isValidResponse(timerSearch)) {
            _analyticsSearchSuccess();
            _onSuccessMessageList(response);
          }
        })
        .error(function(err) {
          if (_isValidResponse(timerSearch)) {
            _analyticsSearchError(err);
            _onErrorMessageList();
          }
        })
        .finally(function() {
          if (_isValidResponse(timerSearch)) {
            _hideLoading();
          }
        });
    }

    /**
     * response가 타당한지 여부
     * @param {number} timerSearch
     * @returns {boolean}
     * @private
     */
    function _isValidResponse(timerSearch) {
      return timerSearch == null || _timerSearch === timerSearch;
    }

    function _onSuccessMessageList(response) {
      var cursor = response.cursor;

      if (_isFirstPage(cursor)) {
        $scope.messageList = response.records;
      } else {
        $scope.messageList = $scope.messageList.concat(response.records);
      }

      _setSearchStatus(cursor);
    }

    function _setSearchStatus(cursor) {
      $scope.searchStatus.isSearching = false;
      $scope.searchStatus.isScrollLoading = false;
      $scope.searchStatus.isEndOfList = _isLastPage(cursor) && $scope.messageList.length > 0;
      $scope.searchStatus.isInitDone = true;

      $scope.searchStatus.type = _getSearchStatusType();
      $scope.searchStatus.length = cursor.totalCount;
      $scope.searchStatus.page = cursor.page + 1;
    }

    /**
     * Check if current page is first page by checking 'page' in cursor
     * @param cursor
     * @returns {boolean}
     * @private
     */
    function _isFirstPage(cursor) {
      return cursor.page == 1;
    }

    /**
     * 현재 검색하고 있는 페이지가 결과물의 마지막인지 확인한다.
     * @param {object} cursor - 서버로부터 내려온 결과물
     * @returns {boolean} isLastPage - true, if it is a last page
     * @private
     */
    function _isLastPage(cursor) {
      return cursor.page >= cursor.pageCount;
    }

    function _onErrorMessageList() {
      $scope.searchStatus.isApiError = true;
    }

    /**
     * 오른쪽 상단에 있는 search input box 에 focus 를 맞춘다.
     * @type {setSearchInputFocus}
     */
    function setKeywordFocus() {
      $scope.searchStatus.isKeywordFocus = true;
    }

    /**
     * 새로 만들어진 list 에서 이전에 선택되어있던 value 를 찾는다.
     * 이렇게 하는 이유는 angular 에서 list 를 만들때 hash 를 사용한다.
     * 그래서 같은 토픽방이라도 이전 리스트에 있던 a 토픽과 새로운 리스트의 a 토픽은 서로 다른 hash 값을 가져서 단순 비교하면 새로운 리스트에서 찾지 못한다.
     * 그래서 리스트를 돌며 토픽의 id 값으로 비교해서 찾아야한다.
     * @param {array} newOptions - 새로운 'sent in' option
     * @returns {object} topic - 새로운 리스트에 있는 이전 토픽방
     * @private
     */
    function _getMessageLocation(newOptions) {
      var entityId = $scope.searchStatus.entityId;

      var length = newOptions.length;
      var i;

      if (entityId) {
        for (i = 0; i < length; i++) {
          if (entityId === newOptions[i].id) {
            return newOptions[i];
          }
        }
      }
    }

    /**
     * 'sent in'  value 를 'all'로 바꾼다.
     * @private
     */
    function _resetChatRoom() {
      _setChatRoom();
    }

    /**
     * 로딩스크린을 보여준다.
      * @private
     */
    function _showLoading() {
      $scope.searchStatus.isSearching = true;
      $scope.searchStatus.type = _getSearchStatusType();
    }

    /**
     * 로딩바를 숨긴다.
     * @private
     */
    function _hideLoading() {
      $scope.searchStatus.sSearching = false;
      $scope.searchStatus.type = _getSearchStatusType();
    }

    /**
     * message 작성된 entity 설정
     * @param {object} [entity]
     * @private
     */
    function _setChatRoom(entity) {
      $scope.searchStatus.entityId = entity ? entity.id : '';
    }

    /**
     * search status의 search하는 keyword 초기화
     * @private
     */
    function _resetSearchStatusKeyword() {
      $scope.searchStatus.q = '';
    }

    function _getSearchStatusType() {
      var type;

      if ($scope.searchStatus.isSearching) {
        type = 'progress';
      } else if (!$scope.searchStatus.isSearching &&
                !isKeywordEmpty() &&
                $scope.messageList.length > 0) {
        type = 'result';
      }

      return type || '';
    }

    /**
     * 파일 리스트가 비어있는지 여부
     * @returns {boolean}
     */
    function isEmpty() {
      return $scope.messageList.length == 0 &&
        $scope.searchStatus.isInitDone &&
        !$scope.searchStatus.isSearching;
    }

    /**
     * 키워드가 비어있는지 여부
     * @returns {boolean}
     */
    function isKeywordEmpty() {
      return !$scope.searchStatus.q && $scope.messageList.length === 0;
    }


    /**
     * 네트워크 활성 이벤트 핸들러
     * @private
     */
    function _onConnected() {
      $scope.isConnected = true;

      if(_isActivated) {
        _refreshMessageList();
      } else {
        $scope.searchStatus.isInitDone = false;
      }
    }

    /**
     * 네크워크 비활성 이벤트 핸들러
     * @private
     */
    function _onDisconnected() {
      $scope.isConnected = false;
    }

    /////////////////////////////////////////// analytics ////////////////////////////////////////////////

    function _analyticsSearchSuccess() {
      //analytics
      try {
        AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_KEYWORD_SEARCH, {
          'RESPONSE_SUCCESS': true,
          'SEARCH_KEYWORD': encodeURIComponent($scope.searchQuery.q)
        });
      } catch (e) {
      }
    }

    function _analyticsSearchError(err) {
      try {
        //analytics
        AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_KEYWORD_SEARCH, {
          'RESPONSE_SUCCESS': true,
          'ERROR_CODE': err.code
        });
      } catch (e) {
      }
    }
  }
})();
