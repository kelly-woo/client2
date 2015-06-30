(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelMessageTabCtrl', rPanelMessageTabCtrl);

  /* @ngInject */
  function rPanelMessageTabCtrl($scope, $rootScope, fileAPIservice, messageSearchHelper, accountService, $filter, AnalyticsHelper) {

    var DEFAULT_PAGE = 1;
    var DEFAULT_PER_PAGE = 20;

    var isLastPage = false;
    //TODO: 활성화 된 상태 관리에 대한 리펙토링 필요
    var _isActivated = false;

    _init();


    // First function to be called.
    function _init() {
      $scope.isSearching = false;
      $scope.apiError = false;

      $scope.messageList;

      $scope.searchStatus = {
        keyword: '',
        length: ''
      };

      $scope.messageLocation = '';

      // Methods
      $scope.searchMessages = searchMessages;
      $scope.updateMessageLocationFilter = updateMessageLocationFilter;
      $scope.updateMessageWriterFilter = updateMessageWriterFilter;

      _initMessageSearchQuery();
      _initChatRoomOption();
      _initChatWriterOption();

      searchMessages();
      //test()
    }

    /**
     * 레프트 채널이 업데이트 된 후, 'shared in' list 가 바뀌어야 할때
     */
    $scope.$on('onInitLeftListDone', function() {
      _initChatRoomOption();
    });


    // File List clicked on member profile modal view.
    $scope.$on('resetRPanelSearchStatusKeyword', function() {
      _initMessageSearchQuery();
      _resetChatWriter();
      _resetChatRoom();
      _resetMessageSearchResult();
    });

    // When value of search input box(at the top of right panel) changed.
    $scope.$on('onrPanelFileTitleQueryChanged', function(event, keyword) {
      _setSearchQueryQ(keyword);

      if (!keyword) {
        _resetMessageSearchResult();
        return;
      }

      if (!_isMessageTabActive()) return;

      _refreshSearchQuery();
      searchMessages();

    });

    // When message tab is selected.
    $scope.$on('onrPanelMessageTabSelected', function() {
      _isActivated = true;
      _refreshSearchQuery();
      searchMessages();
    });
    $scope.$on('onrPanelFileTabSelected', function() {
      _isActivated = false;
    });

    // When entity location filter is changed.
    function updateMessageLocationFilter() {
      _refreshSearchQuery();
      $scope.searchQuery.entityId = !!$scope.messageLocation ? $scope.messageLocation.id : '';
      searchMessages();
    }

    // When writer filter is changed.
    function updateMessageWriterFilter() {
      _refreshSearchQuery();
      $scope.searchQuery.writerId = $scope.messageWriter || '';
      searchMessages();
    }


    /**
     * 메세지를 찾는다.
     */
    function searchMessages() {
      var property = {};
      var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;

      if (_isLoading() || !$scope.searchQuery.q || isLastPage ) return;

      $scope.apiError = false;

      _updateSearchStatusKeyword();
      _showLoading();

      //console.log($scope.searchQuery)

      messageSearchHelper.searchMessages($scope.searchQuery)
        .success(function(response) {
          if (_isActivated) {
            //console.log(response)
            _updateSearchQueryCursor(response.cursor);
            _updateMessageList(response);
            _updateSearchStatusTotalCount(response.cursor.totalCount);

            //analytics
            try {
              property[PROPERTY_CONSTANT.SEARCH_KEYWORD] = $scope.searchQuery.q;
              property[PROPERTY_CONSTANT.RESPONSE_SUCCESS] = true;
              AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_KEYWORD_SEARCH, property);
            } catch (e) {
            }
          }
        })
        .error(function(err) {
          if (_isActivated) {
            console.log(err);

            try {
              //analytics
              property[PROPERTY_CONSTANT.ERROR_CODE] = err.code;
              property[PROPERTY_CONSTANT.RESPONSE_SUCCESS] = true;
              AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_KEYWORD_SEARCH, property);
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

      isLastPage = false;
    }

    /**
     * Update 'page' in searchQuery.
     * @param cursor
     * @private
     */
    function _updateSearchQueryCursor(cursor) {
      $scope.searchQuery.page = cursor.page + 1;

      if(_isLastPage(cursor)) {
        isLastPage = true;
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
      var newOptions = fileAPIservice.getShareOptions($scope.joinedEntities, $scope.memberList);
      var newMessageLocation = _getMessageLocation(newOptions);

      $scope.chatRoomOptions = newOptions;

      if (newMessageLocation) {
        $scope.messageLocation = newMessageLocation;
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
      var messageLocation = $scope.messageLocation;

      var length = newOptions.length;
      var i;

      if (messageLocation) {
        for (i = 0; i < length; i++) {
          if (messageLocation.id === newOptions[i].id) {
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
      $scope.messageLocation = '';
      updateMessageLocationFilter();
    }

    /**
     * 'Sent by' list 를 생성한다.
     * @private
     */
    function _initChatWriterOption() {
      $scope.chatWriterOptions = fileAPIservice.getShareOptions([$scope.member], $scope.memberList);
    }

    /**
     * 'Sent by' value 를 'all'로 바꾼다.
     * @private
     */
    function _resetChatWriter() {
      $scope.messageWriter = '';
    }

    /**
     * 메세지 검색 결과물을 reset 한다.
     * @private
     */
    function _resetMessageSearchResult() {
      $scope.messageList = [];
    }

    /**
     * 메세지 검색창이 활성화됐는지 리턴한다.
     * @returns {$scope.isMessageTabActive}
     * @private
     */
    function _isMessageTabActive() {
      return $scope.isMessageTabActive;
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

    function test() {
      $scope.searchQuery = {
        q: 'JJ에이치',
        page: DEFAULT_PAGE,
        perPage: DEFAULT_PER_PAGE,
        writerId: '',
        entityId: ''
      };

      searchMessages();
    }
  }


})();