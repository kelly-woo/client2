/**
 * @fileoverview Sticker 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('StickerPanelCtrl', StickerPanelCtrl);

  function StickerPanelCtrl($scope, $attrs, jndPubSub, Sticker, Preloader) {
    // 서버에서 group 리스트 API 완성전에 대비하여 임시로 만든 데이터
    var _groups = [
      {
        isRecent: true,
        isSelected: false
      },
      {
        isRecent: false,
        isSelected: true
      }
    ];
    var _cache = {};

    $scope.onClickGroup = onClickGroup;
    $scope.onClickItem = onClickItem;
    $scope.onToggled = onToggled;

    init();

    /**
     * 초기화 메서드
     */
    function init() {
      $scope.isShift = false;
      $scope.groups = _groups;
      $scope.name = $attrs.name;
      $scope.isRecent = false;
      $scope.status = {
        isOpen: false
      };
      _initListeners();
      _select();
    }

    /**
     * 리스너 바인딩
     * @private
     */
    function _initListeners() {
      $scope.$on('isStickerPosShift:' + $scope.name, _onStickerShift);
    }

    /**
     * sticker 아이콘 위치 shift 이벤트 핸들러
     * @param {event} angularEvent 이벤트
     * @param {boolean} isShift shift 할지 여부
     * @private
     */
    function _onStickerShift(angularEvent, isShift) {
      $scope.isShift = isShift;
    }

    /**
     * show hide 토글 핸들러
     * @param {boolean} isOpen 현재 show 되었는지 여부
     */
    function onToggled(isOpen) {
      $scope.status.isOpen = isOpen;
      if (isOpen) {
        _select();
      }
    }

    /**
     * group 아이콘 클릭시 핸들러
     * @param {event} clickEvent 클릭 이벤트
     * @param {object} group 그룹 데이터
     */
    function onClickGroup(clickEvent, group) {
      clickEvent.stopPropagation();
      _select(group);
    }

    /**
     * 해당 스티커 그룹을 선택한다.
     * @param {object} group 선택할 그룹
     * @private
     */
    function _select(group) {
      group = group || $scope.groups[1];
      _deselectAll();
      group.isSelected = true;
      $scope.isRecent = !!group.isRecent;
      $scope.list = [];

      if (group.isRecent) {
        _getRecent();
      } else {
        _getList();
      }
    }

    /**
     * 모든 group 을 deselect 한다.
     * @private
     */
    function _deselectAll() {
      _.forEach($scope.groups, function(group) {
        group.isSelected = false;
      });
    }

    /**
     * 스티커 클릭시
     * @param {object} item 스티커 아이템
     */
    function onClickItem(item) {
      jndPubSub.pub('selectSticker:' + $scope.name, item);
    }

    /**
     * groupId 에 해당하는 스티커를 로드한다.
     * @param {number} [groupId=100]
     * @private
     */
    function _getList(groupId) {
      groupId = _.isUndefined(groupId) ? 100 : groupId;
      if (_cache[groupId]) {
        $scope.list = _cache[groupId];
      } else {
        Sticker.getList(groupId)
          .success(function(response) {
            _cache[groupId] = response;
            Preloader.img(_.pluck(response, 'url'));
            $scope.list = response;
          })
          .error(function() {
            $scope.list = [];
          });
      }

    }

    /**
     * 최근 사용 리스트를 반환한다.
     * @private
     */
    function _getRecent() {
      Sticker.getRecentList()
        .success(function(response) {
          if (_.isArray(response)) {
            Preloader.img(_.pluck(response, 'url'));
            $scope.list = response.reverse();
          } else {
            $scope.list = [];
          }
        })
        .error(function() {
          $scope.list = [];
        });
    }
  }
})();
