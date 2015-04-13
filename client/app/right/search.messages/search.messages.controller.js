(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelMessageTabCtrl', rPanelMessageTabCtrl);

  /* @ngInject */
  function rPanelMessageTabCtrl($scope, $rootScope, fileAPIservice, messageSearchHelper, accountService, $filter) {

    var DEFAULT_PAGE = 1;
    var DEFAULT_PER_PAGE = 20;

    var isLastPage = false;


    // First function to be called.
    (function() {
      $scope.isSearching = false;
      $scope.apiError = false;

      $scope.messageList;

      $scope.searchStatus = {
        keyword: '',
        length: ''
      };

      // Methods
      $scope.searchMessages = searchMessages;
      $scope.updateMessageLocationFilter = updateMessageLocationFilter;
      $scope.updateMessageWriterFilter = updateMessageWriterFilter;

      _initMessageSearchQuery();
      _initChatRoomOption();
      _initChatWriterOption();

      searchMessages();

      //test();
    })();
    $scope.$on('onInitLeftListDone', function() {
      _initChatRoomOption();
    });


    // File List clicked on member profile modal view.
    $scope.$on('resetRPanelSearchStatusKeyword', function() {
      _resetChatWriter();
      _resetChatRoom();
      _initMessageSearchQuery();
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
      _refreshSearchQuery();
      searchMessages();
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

    function searchMessages() {

      if (_isLoading() || !$scope.searchQuery.q || isLastPage ) return;

      $scope.apiError = false;

      _updateSearchStatusKeyword();
      _showLoading();

      messageSearchHelper.searchMessages($scope.searchQuery)
        .success(function(response) {
          //console.log(response)
          _updateSearchQueryCursor(response.cursor);
          _updateMessageList(response);
          _updateSearchStatusTotalCount(response.cursor.totalCount);
        })
        .error(function(err) {
          console.log(err);
          _onMessageSearchErr(err);
        })
        .finally(function(){
          _hideLoading();
        });
    }

    function _updateSearchStatusKeyword() {
      $scope.searchStatus.keyword = $scope.searchQuery.q;
    }
    function _updateSearchStatusTotalCount(count) {
      $scope.searchStatus.length = count;
    }

    $scope.setSearchInputFocus = setSearchInputFocus;
    function setSearchInputFocus() {
      $rootScope.$broadcast('rPanelSearchFocus');
    }

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
    function _initChatRoomOption() {
      $scope.chatRoomOptions = fileAPIservice.getShareOptions($scope.joinedEntities, $scope.memberList);
    }
    function _resetChatRoom() {
      $scope.messageLocation = '';
    }
    function _initChatWriterOption() {
      $scope.chatWriterOptions = fileAPIservice.getShareOptions([$scope.member], $scope.memberList);
    }
    function _resetChatWriter() {
      $scope.messageWriter = '';
    }
    function _resetMessageSearchResult() {
      $scope.messageList = [];
    }
    function _isMessageTabActive() {
      return $scope.isMessageTabActive;
    }

    function _isLoading() {
      return $scope.isSearching;
    }

    function _showLoading() {
      $scope.isSearching = true;
    }
    function _hideLoading() {
      $scope.isSearching = false;
    }

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