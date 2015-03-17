(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('rPanelMessageTabCtrl', rPanelMessageTabCtrl);

  /* @ngInject */
  function rPanelMessageTabCtrl($scope, $rootScope, fileAPIservice, messageSearchHelper) {

    var DEFAULT_PAGE = 1;
    var DEFAULT_PER_PAGE = 20;

    $scope.isSearching = false;
    $scope.messageList;

    $scope.$on('onrPanelFileTitleQueryChanged', function(event, keyword) {
      if (!_isMessageTabActive()) return;

      if (!keyword) {
        _resetMessageSearchResult();
        return;
      }
      _refreshSearchQuery();
      _setSearchQueryQ(keyword);
      searchMessages();

    });

    (function() {
      _initMessageSearchQuery();
      _initChatRoomOption();
      _initChatWriterOption();

      searchMessages();
    })();

    function searchMessages() {
      if (_isLoading()) return;

      _showLoading();

      messageSearchHelper.searchMessages($scope.searchQuery)
        .success(function(response) {
          _updateSearchQueryCursor(response.cursor);
          _updateMessageList(response);
        })
        .error(function(err) {
          console.log(err);
        })
        .finally(function(){
          _hideLoading();
        });
    }
    $scope.setSearchInputFocus = setSearchInputFocus;
    function setSearchInputFocus() {
      $rootScope.$broadcast('rPanelSearchFocus');
    }

    function _initMessageSearchQuery() {
      $scope.searchQuery = {
        q: 'uber',
        page: DEFAULT_PAGE,
        perPage: DEFAULT_PER_PAGE,
        writerId: '',
        entityId: ''
      };
    }

    function _refreshSearchQuery() {
      $scope.searchQuery = {
        page: DEFAULT_PAGE,
        perPage: DEFAULT_PER_PAGE
      };

    }
    /**
     * Update 'page' in searchQuery.
     * @param cursor
     * @private
     */
    function _updateSearchQueryCursor(cursor) {
      $scope.searchQuery.page = cursor.page + 1;
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
    function _initChatWriterOption() {
      $scope.chatWriterOptions = fileAPIservice.getShareOptions([$scope.member], $scope.memberList);
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

    function test() {
      var temp = {
        "cursor": {
          "page": 1,
          "perPage": 10,
          "pageCount": 11,
          "totalCount": 107,
          "recordCount": 10
        },
        "records": [
          {
            "entity": {
              "type": "user",
              "id": 14575,
              "name": "Jason 수영 Kim"
            },
            "current": {
              "type": "text",
              "linkId": 114671,
              "memberId": 282,
              "messageId": 98201,
              "time": "2015-02-17T10:02:03.359Z",
              "text": "안녕하세요~^^\n백엔드 개발하고 있는 John입니다."
            },
            "next": {
              "type": "text",
              "linkId": 114672,
              "memberId": 282,
              "messageId": 98202,
              "time": "2015-02-17T10:02:55.203Z",
              "text": "친구분 계정(Nikola@justa.io) 관련해서 전달을 받아서 확인을 해봤는데요."
            }
          },
          {
            "entity": {
              "type": "channel",
              "id": 314,
              "name": "Development - 개발"
            },
            "current": {
              "type": "text",
              "linkId": 110904,
              "memberId": 285,
              "messageId": 94694,
              "time": "2015-02-16T02:36:51.563Z",
              "text": "@John @Jihoon @Steve @Gyu\n개발서버에 /leftSideMenu API 변경된 사항 배포했습니다.\n변경사항은 response data에서 entities중 type=user인 값들에 status 필드가 추가되었습니다.\n고로 enabled, disabled 멤버 모두 넘어가게 됩니다. 차단된 유저에 접근시 각 클라이언트 수정사항에 맞게 반영 부탁드립니다."
            },
            "prev": {
              "type": "text",
              "linkId": 110895,
              "memberId": 282,
              "messageId": 94686,
              "time": "2015-02-16T02:34:25.201Z",
              "text": "저는 조만간 REST API 설계를 위해 고민했던 내용으로 썰을 풀어볼까 합니다.\nHTTP status code나 property naming, error 코드 이런 요소로요."
            },
            "next": {
              "type": "text",
              "linkId": 113290,
              "memberId": 285,
              "messageId": 96927,
              "time": "2015-02-16T15:20:33.381Z",
              "text": "데이터가 조금 꼬여서 데브 서버 DB 라이브로 덮겠습니다~"
            }
          },
          {
            "entity": {
              "type": "channel",
              "id": 8722,
              "name": "토스랩 코리아"
            },
            "current": {
              "type": "text",
              "linkId": 108650,
              "memberId": 6098,
              "messageId": 92580,
              "time": "2015-02-13T12:28:28.225Z",
              "text": "네 그룹웨어 마케팅일거에요.\n그거에 개발비만 40억 넘게 들어갔는데 매출이 이제 10억 넘었거든요."
            },
            "prev": {
              "type": "text",
              "linkId": 108561,
              "memberId": 282,
              "messageId": 92494,
              "time": "2015-02-13T11:45:11.139Z",
              "text": "그럼 톡보다는 오피스 마케팅인가 보군요?"
            },
            "next": {
              "type": "text",
              "linkId": 109319,
              "memberId": 282,
              "messageId": 93198,
              "time": "2015-02-14T03:59:54.298Z",
              "text": "슬랙이 자동 초대 API를 차단한 게 요며칠 소셜 타임라인에 자주 보였네요.\npaid user만 지원할 예정이라는데...\n\n슬랙은 커뮤니티 채팅 용도로 사용하는 무료 사용자가 많아지는 걸 원하지 않나 보네요.\n\n저희에게 기회가 될 수 있겠네요."
            }
          },
          {
            "entity": {
              "type": "channel",
              "id": 320,
              "name": "Fun"
            },
            "current": {
              "type": "comment",
              "linkId": 106639,
              "memberId": 284,
              "messageId": 90740,
              "time": "2015-02-12T16:40:08.902Z",
              "text": "개발지용 개그, 적의 적은 내 친구.",
              "file": {
                "writerId": 284,
                "title": "a0010769_54dc677b9ab39.jpg",
                "name": "a0010769_54dc677b9ab39.jpg"
              }
            },
            "prev": {
              "type": "file",
              "linkId": 106638,
              "memberId": 284,
              "messageId": 90739,
              "time": "2015-02-12T16:40:08.889Z",
              "status": "shared",
              "file": {
                "writerId": 284,
                "title": "a0010769_54dc677b9ab39.jpg",
                "name": "a0010769_54dc677b9ab39.jpg"
              }
            },
            "next": {
              "type": "comment",
              "linkId": 106712,
              "memberId": 324,
              "messageId": 90807,
              "time": "2015-02-13T00:10:16.407Z",
              "text": "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ",
              "file": {
                "writerId": 284,
                "title": "a0010769_54dc677b9ab39.jpg",
                "name": "a0010769_54dc677b9ab39.jpg"
              }
            }
          },
          {
            "entity": {
              "type": "privateGroup",
              "id": 13842,
              "name": "개발팀 채용 공고"
            },
            "current": {
              "type": "text",
              "linkId": 104529,
              "memberId": 284,
              "messageId": 88802,
              "time": "2015-02-11T15:35:41.747Z",
              "text": "슬라이드쉐어로 올라온 개발자 채용공고가 만 하루도 안되어 2,500 뷰를 돌파했습니다."
            },
            "prev": {
              "type": "text",
              "linkId": 104509,
              "memberId": 13408,
              "messageId": 88786,
              "time": "2015-02-11T15:07:54.264Z",
              "text": "!!!"
            },
            "next": {
              "type": "text",
              "linkId": 104532,
              "memberId": 6098,
              "messageId": 88804,
              "time": "2015-02-11T15:43:45.592Z",
              "text": "오~"
            }
          },
          {
            "entity": {
              "type": "channel",
              "id": 8722,
              "name": "토스랩 코리아"
            },
            "current": {
              "type": "text",
              "linkId": 104436,
              "memberId": 13489,
              "messageId": 88723,
              "time": "2015-02-11T13:45:35.350Z",
              "text": "http://www.demoday.co.kr/company/%ED%86%A0%EC%8A%A4%EB%9E%A9#updates-recruit-view-976-[토스랩]-업무용-메신저-'잔디'-개발자-채용-공고 <- 데모데이 채용공고"
            },
            "prev": {
              "type": "text",
              "linkId": 104435,
              "memberId": 13489,
              "messageId": 88722,
              "time": "2015-02-11T13:45:18.446Z",
              "text": "http://rocketpun.ch/recruit/2741/ <- 로켓펀치 채용공고"
            },
            "next": {
              "type": "text",
              "linkId": 104439,
              "memberId": 13489,
              "messageId": 88726,
              "time": "2015-02-11T13:46:35.390Z",
              "text": "그.. 데모데이 채용공고에 보시면 '우리 회사 이런 점이 달라요' 코너가 있는데, 기존에 있는 저희 장점을 조금 더 살을 붙여보았습니다."
            }
          },
          {
            "entity": {
              "type": "channel",
              "id": 8722,
              "name": "토스랩 코리아"
            },
            "current": {
              "type": "text",
              "linkId": 104433,
              "memberId": 13489,
              "messageId": 88720,
              "time": "2015-02-11T13:44:32.750Z",
              "text": "로켓 펀치, 데모데이에 있는 저희 토스랩 페이지에 개발자 채용 공고 모두 업로드 완료되었습니다."
            },
            "prev": {
              "type": "text",
              "linkId": 104429,
              "memberId": 6098,
              "messageId": 88716,
              "time": "2015-02-11T13:39:48.202Z",
              "text": "헉...\nMK 화이팅~\n남으신 분들도 화이팅~!"
            },
            "next": {
              "type": "text",
              "linkId": 104434,
              "memberId": 6098,
              "messageId": 88721,
              "time": "2015-02-11T13:45:05.513Z",
              "text": "오옷~ 수고하셨습니다~"
            }
          },
          {
            "entity": {
              "type": "privateGroup",
              "id": 13842,
              "name": "개발팀 채용 공고"
            },
            "current": {
              "type": "text",
              "linkId": 103718,
              "memberId": 13408,
              "messageId": 88066,
              "time": "2015-02-11T08:01:52.939Z",
              "text": "슬라이드쉐어 보고 백엔드 개발자분 한 분이 벌써 지원해주셨네요~ 모두 채용활동에 적극적으로 협동해주셔서 감사합니다!"
            },
            "prev": {
              "type": "comment",
              "linkId": 103494,
              "memberId": 13489,
              "messageId": 87866,
              "time": "2015-02-11T06:55:30.699Z",
              "text": "아니에요.. 제 영어 이름의 출처도 그 해리포터가 맞기 때문에.. 감사합니다...",
              "file": {
                "writerId": 6098,
                "title": "Screenshot_2015-02-11-15-19-06.png",
                "name": "Screenshot_2015-02-11-15-19-06.png"
              }
            },
            "next": {
              "type": "text",
              "linkId": 103719,
              "memberId": 282,
              "messageId": 88067,
              "time": "2015-02-11T08:02:30.007Z",
              "text": "와우~^^"
            }
          },
          {
            "entity": {
              "type": "channel",
              "id": 8722,
              "name": "토스랩 코리아"
            },
            "current": {
              "type": "comment",
              "linkId": 103581,
              "memberId": 9653,
              "messageId": 87940,
              "time": "2015-02-11T07:23:07.890Z",
              "text": "2015년 잔디 개발자 채용 공고 공유해 드립니다.",
              "file": {
                "writerId": 9653,
                "title": "잔디 개발자 채용 공고.pdf",
                "name": "잔디 개발자 채용 공고s.pdf"
              }
            },
            "prev": {
              "type": "file",
              "linkId": 103580,
              "memberId": 9653,
              "messageId": 87939,
              "time": "2015-02-11T07:23:07.885Z",
              "status": "shared",
              "file": {
                "writerId": 9653,
                "title": "잔디 개발자 채용 공고.pdf",
                "name": "잔디 개발자 채용 공고s.pdf"
              }
            },
            "next": {
              "type": "comment",
              "linkId": 103621,
              "memberId": 663,
              "messageId": 87977,
              "time": "2015-02-11T07:34:41.238Z",
              "text": "각 자 이 버전을 널리 공유해주시면 좋을 것 같아요. 학교나 소속 단체, 또는 페이스북 그룹에서 전달 좀 부탁드리겠습니다. 저도 학교 동아리를 통해서 전달하도록 하겠습니다.",
              "file": {
                "writerId": 9653,
                "title": "잔디 개발자 채용 공고.pdf",
                "name": "잔디 개발자 채용 공고s.pdf"
              }
            }
          }
        ]
      };

      _updateMessageList(temp);


    }
  }


})();