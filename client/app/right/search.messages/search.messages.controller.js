/**
 * @fileoverview search messages controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelMessageTabCtrl', rPanelMessageTabCtrl);

  /* @ngInject */
  function rPanelMessageTabCtrl($scope, $rootScope, $timeout, $filter, $state, Router, fileAPIservice,
                                messageAPIservice, AnalyticsHelper, TopicFolderModel, jndPubSub,
                                currentSessionHelper) {
    var DEFAULT_PAGE = 1;
    var DEFAULT_PER_PAGE = 20;

    //TODO: 활성화 된 상태 관리에 대한 리펙토링 필요
    var _isActivated = false;
    var _timerSearch;

    _init();

    // First function to be called.
    function _init() {
      $scope.isSearching = false;
      $scope.isEndOfList = false;
      $scope.apiError = false;
      $scope.messageLocationId = '';
      $scope.messageWriterId = '';
      $scope.messageList;

      $scope.searchStatus = {
        keyword: '',
        length: ''
      };

      // Methods
      $scope.searchMessages = searchMessages;
      $scope.updateMessageLocationFilter = updateMessageLocationFilter;
      $scope.updateMessageWriterFilter = updateMessageWriterFilter;

      if (Router.getActiveRightTabName($state.current) === 'messages') {
        _isActivated = true;
      }

      _initMessageSearchQuery();
      _initChatRoomOption();
      _initChatWriterOption();
      _setLanguageVariable();
      _setMessageLocation(currentSessionHelper.getCurrentEntity());

      updateMessageLocationFilter();

      _on();
    }

    function _on() {
      $scope.$on('onInitLeftListDone', _onInitLeftListDone);
      $scope.$on('onrPanelFileTitleQueryChanged', _onrPanelFileTitleQueryChanged);
      $scope.$on('rightPanelStatusChange', _onRightPanelStatusChange);
      $scope.$on('changedLanguage', _changedLanguage);
      $scope.$on('topic-folder:update', _initChatRoomOption);
      $scope.$on('onCurrentEntityChanged', _onCurrentEntityChanged);
      $scope.$watch('messageLocationId', updateMessageLocationFilter);
      $scope.$watch('messageWriterId', updateMessageWriterFilter);
      $scope.$on('rPanelResetQuery', _onResetQuery);
    }

    /**
     * query 리셋
     * @private
     */
    function _onResetQuery() {
      if (_isActivated) {
        _refreshSearchQuery();
        $scope.searchQuery.entityId = $scope.messageLocationId  = '';
        $scope.searchQuery.writerId = $scope.messageWriterId = '';
        searchMessages();
      }
    }

    /**
     * 레프트 채널이 업데이트 된 후, 'shared in' list 가 바뀌어야 할때
     */
    function _onInitLeftListDone() {
      _initChatRoomOption();
    }

    /**
     * When value of search input box(at the top of right panel) changed.
     */
    function _onrPanelFileTitleQueryChanged(event, keyword) {
      if (_isActivated) {
        _setSearchQueryQ(keyword);

        if (!keyword) {
          _resetMessageSearchResult();
        } else {
          _refreshSearchQuery();
          searchMessages();
        }
      }
    }

    /**
     * open right panel event handler
     */
    function _onRightPanelStatusChange($event, data) {
      if (data.type === 'messages') {
        _isActivated = true;

        if (data.toUrl !== data.fromUrl) {
          _refreshSearchQuery();
          _resetSearchStatusKeyword();
        }
      } else {
        _isActivated = false;
      }
    }

    /**
     * language 변경 event handling
     */
    function _changedLanguage() {
      _setLanguageVariable();
    }

    /**
     * Watching joinEntities in parent scope so that currentEntity can be automatically updated.
     * advanced search option 중 'Shared in'/ 을 변경하는 부분.
     */
    function _onCurrentEntityChanged(event, currentEntity) {
      if (_isActivated) {
        // search keyword reset
        _setMessageLocation(currentEntity);
        _resetSearchStatusKeyword();
        updateMessageLocationFilter();
      }
    }

    /**
     * When entity location filter is changed.
     */
    function updateMessageLocationFilter() {
      _refreshSearchQuery();
      $scope.searchQuery.entityId = $scope.messageLocationId || '';
      searchMessages();
    }

    /**
     * When writer filter is changed.
     */
    function updateMessageWriterFilter() {
      _refreshSearchQuery();
      $scope.searchQuery.writerId = $scope.messageWriterId || '';
      searchMessages();
    }

    /**
     * message 를 검색한다
     */
    function searchMessages() {
      if (_isActivated) {
        $timeout.cancel(_timerSearch);
        _timerSearch = $timeout(_searchMessages, 100);
      }
    }

    /**
     * 메세지를 찾는다.
     */
    function _searchMessages() {

      if (_isLoading() || !$scope.searchQuery.q || $scope.isEndOfList ) return;

      $scope.apiError = false;

      _updateSearchStatusKeyword();
      _showLoading();
      messageAPIservice.searchMessages($scope.searchQuery)
        .success(function(response) {
          if (_isActivated) {
            //console.log(response)
            _updateMessageList(response);
            _updateSearchStatusTotalCount(response.cursor.totalCount);
            _updateSearchQueryCursor(response.cursor);

            //analytics
            try {
              AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_KEYWORD_SEARCH, {
                'RESPONSE_SUCCESS': true,
                'SEARCH_KEYWORD': encodeURIComponent($scope.searchQuery.q)
              });
            } catch (e) {
            }
          }
        })
        .error(function(err) {
          if (_isActivated) {
            console.log(err);

            try {
              //analytics
              AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_KEYWORD_SEARCH, {
                'RESPONSE_SUCCESS': true,
                'ERROR_CODE': err.code
              });
            } catch (e) {
            }

            _onMessageSearchErr(err);
          }
        })
        .finally(function(){
          _hideLoading();
        });
    }

    /**
     * api에 들어강 정보를 현재 화면에 있는 정보로 업데이트한다.
     * 검색어.
     * @private
     */
    function _updateSearchStatusKeyword() {
      $scope.searchStatus.keyword = $scope.searchQuery.q;
    }

    /**
     * 검색된 결과물의 숫자를 업데이트한다.
     * @param {number} count - 현재 리스폰스로 들어온 리스트의 길이
     * @private
     */
    function _updateSearchStatusTotalCount(count) {
      $scope.searchStatus.length = count;
    }

    /**
     * 오른쪽 상단에 있는 search input box 에 focus 를 맞춘다.
     * @type {setSearchInputFocus}
     */
    $scope.setSearchInputFocus = setSearchInputFocus;
    function setSearchInputFocus() {
      $rootScope.$broadcast('rPanelSearchFocus');
    }

    /**
     * api에 태울 정보들을 reset 혹은 새로 생성한다.
     * @private
     */
    function _initMessageSearchQuery() {
      $scope.searchQuery = {
        q: '',
        page: DEFAULT_PAGE,
        perPage: DEFAULT_PER_PAGE,
        writerId: '',
        entityId: ''
      };
    }

    /**
     * Reset only 'page' and 'perPage' value.
     * @private
     */
    function _refreshSearchQuery() {
      $scope.messageList = [];

      $scope.searchQuery.page = DEFAULT_PAGE;
      $scope.searchQuery.perPage = DEFAULT_PER_PAGE;

      $scope.isEndOfList = false;
    }

    /**
     * Update 'page' in searchQuery.
     * @param cursor
     * @private
     */
    function _updateSearchQueryCursor(cursor) {
      $scope.searchQuery.page = cursor.page + 1;

      if(_isLastPage(cursor) && $scope.messageList.length > 0) {
        $scope.isEndOfList = true;
      } else {
        $scope.isEndOfList = false;
      }
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

    /**
     * Set 'q' in searchQuery.
     * @param keyword
     * @private
     */
    function _setSearchQueryQ(keyword) {
      $scope.searchQuery.q = keyword;
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
     * Update or initialize message list.
     * @param response
     * @private
     */
    function _updateMessageList(response) {
      if (_isFirstPage(response.cursor))
        $scope.messageList = response.records;
      else
        $scope.messageList = $scope.messageList.concat(response.records);
    }

    /**
     * 'sent in' 리스트를 새로 만든다.
     * @private
     */
    function _initChatRoomOption() {
      var newOptions = fileAPIservice.getShareOptionsWithoutMe(
        $scope.joinedEntities,
        currentSessionHelper.getCurrentTeamUserList()
      );
      var newMessageLocation = _getMessageLocation(newOptions);
      $scope.chatRoomOptions = TopicFolderModel.getNgOptions(newOptions);

      if (newMessageLocation) {
        _setMessageLocation(newMessageLocation);
      } else {
        _resetChatRoom();
      }
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
      var messageLocationId = $scope.messageLocationId;

      var length = newOptions.length;
      var i;

      if (messageLocationId) {
        for (i = 0; i < length; i++) {
          if (messageLocationId === newOptions[i].id) {
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
      _setMessageLocation(null);
      updateMessageLocationFilter();
    }

    /**
     * 'Sent by' list 를 생성한다.
     * @private
     */
    function _initChatWriterOption() {
      $scope.chatWriterOptions = fileAPIservice.getShareOptions(currentSessionHelper.getCurrentTeamUserList());
    }

    /**
     * 'Sent by' value 를 'all'로 바꾼다.
     * @private
     */
    function _resetChatWriter() {
      $scope.messageWriterId = '';
    }

    /**
     * 메세지 검색 결과물을 reset 한다.
     * @private
     */
    function _resetMessageSearchResult() {
      $scope.messageList = [];
      $scope.isEndOfList = false;
    }

    /**
     * 검색이 진행중인지 리턴한다.
     * @returns {boolean|*}
     * @private
     */
    function _isLoading() {
      return $scope.isSearching;
    }

    /**
     * 로딩스크린을 보여준다.
      * @private
     */
    function _showLoading() {
      $scope.isSearching = true;
    }

    /**
     * 로딩바를 숨긴다.
     * @private
     */
    function _hideLoading() {
      $scope.isSearching = false;
    }

    /**
     * 메세지 검색이 오류가 났을 때.
     * @param err
     * @private
     */
    function _onMessageSearchErr(err) {
      $scope.apiError = true;
    }

    /**
     * controller내 사용되는 translate variable 설정
     */
    function _setLanguageVariable() {
      $scope.allRooms = $filter('translate')('@option-all-rooms');
      $scope.allMembers = $filter('translate')('@option-all-members');
    }

    /**
     * message 작성된 entity 설정
     * @param {object} entity
     * @private
     */
    function _setMessageLocation(entity) {
      $scope.messageLocationId = entity ? entity.id : '';
      $scope.searchQuery.entityId = entity ? entity.id : '';
    }

    /**
     * search status의 search하는 keyword 초기화
     * @private
     */
    function _resetSearchStatusKeyword() {
      $scope.searchQuery.q = $scope.searchStatus.keyword = '';
      jndPubSub.pub('resetRPanelSearchStatusKeyword');
    }
  }
})();
