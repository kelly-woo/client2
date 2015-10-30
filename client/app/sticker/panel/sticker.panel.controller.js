/**
 * @fileoverview Sticker 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('StickerPanelCtrl', StickerPanelCtrl);

  function StickerPanelCtrl($scope, $attrs, $q, jndPubSub, Sticker, Preloader) {
    // 서버에서 group 리스트 API 완성전에 대비하여 임시로 만든 데이터
    var _groups = [
      {
        isRecent: true,
        isSelected: false,
        activePosition: [0, 0]
      },
      {
        isRecent: false,
        isSelected: true,
        activePosition: [0, 0],
        id: 100
      }
    ];
    var _cache = {};

    var MAX_COLUMN = parseInt($attrs.maxColumns, 10);
    var _activeGroup;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
      $scope.groups = _groups;
      $scope.name = $attrs.name;
      $scope.isRecent = false;
      $scope.status = {
        isOpen: false
      };

      $scope.onClickGroup = onClickGroup;
      $scope.onClickItem = onClickItem;
      $scope.onToggled = onToggled;

      $scope.navActiveSticker = navActiveSticker;

      _select();

      _on();
    }

    /**
     * on listeners
     * @private
     */
    function _on() {
      if ($scope.name === 'chat') {
        $scope.$on('center:toggleSticker', _onCenterToggleSticker);
      }
    }

    function _onCenterToggleSticker() {
      $scope.$apply(function() {
        $scope.status.isOpen = !$scope.status.isOpen;
      });
    }

    /**
     * show hide 토글 핸들러
     * @param {boolean} isOpen 현재 show 되었는지 여부
     */
    function onToggled(isOpen) {
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
      _activeGroup = group = group || $scope.groups[1];
      _deselect(group);

      group.isSelected = true;
      $scope.isRecent = group.isRecent;

      _createStickers(group);
    }

    /**
     * 선택되지 않은 group을 deselect 한다.
     * @private
     */
    function _deselect(selectGroup) {
      _.forEach($scope.groups, function(group) {
        group !== selectGroup && (group.isSelected = false);
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
     *
     * @private
     */
    function _createStickers(group) {
      var deferred = $q.defer();

      if (group.isRecent) {
        _getRecent(deferred);
      } else {
        _getList(group.id, deferred);
      }

      deferred.promise.then(function (list) {
        $scope.list = list;

        _createNavigationMap(list);

        if (list.length > 0) {
          list[0].active = true;
          //group.activePosition = [0, 0];
        }

        $scope.onCreateSticker();
      });
    }

    /**
     * groupId 에 해당하는 스티커를 로드한다.
     * @param {number} [groupId=100]
     * @private
     */
    function _getList(groupId, deferred) {
      groupId = _.isUndefined(groupId) ? _groups[1].id : groupId;
      if (_cache[groupId]) {
        deferred.resolve(_cache[groupId]);
      } else {
        Sticker.getList(groupId)
          .success(function(response) {
            _cache[groupId] = response;
            Preloader.img(_.pluck(response, 'url'));
            deferred.resolve(response);
          })
          .error(function() {
            deferred.resolve([]);
          });
      }
    }

    /**
     * 최근 사용 리스트를 반환한다.
     * @private
     */
    function _getRecent(deferred) {
      Sticker.getRecentList()
        .success(function(response) {
          if (_.isArray(response)) {
            Preloader.img(_.pluck(response, 'url'));
            deferred.resolve(response.reverse());
          } else {
            deferred.resolve([]);
          }
        })
        .error(function() {
          deferred.resolve([]);
        });
    }

    function _createNavigationMap(list) {
      var navigationMap = $scope.navigationMap = [];
      var tempRow = [];

      _.each(list, function (item) {
        tempRow.push(item);

        if (tempRow.length === MAX_COLUMN) {
          navigationMap.push(tempRow);
          tempRow = [];
        }
      });
      tempRow.length > 0 && navigationMap.push(tempRow);
    }

    function navActiveSticker(x, y) {
      var navigationMap = $scope.navigationMap;

      var acx = _activeGroup.activePosition[0];
      var acy = _activeGroup.activePosition[1];

      var cpx = acx + x;
      var cpy = acy + y;

      if (navigationMap[cpy] == null) {

      } else if (navigationMap[cpy][cpx] == null) {

      } else {
        $scope.$apply(function() {
          navigationMap[acy][acx].active = false;
          navigationMap[cpy][cpx].active = true;

          $scope.autoScroll((cpy * MAX_COLUMN) + cpx);

          _activeGroup.activePosition[0] = cpx;
          _activeGroup.activePosition[1] = cpy;
        });
      }
    }
  }
})();
