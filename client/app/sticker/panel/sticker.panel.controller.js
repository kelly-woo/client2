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
        activeIndex: 0
      },
      {
        isRecent: false,
        isSelected: true,
        activeIndex: 0,
        id: 100
      }
    ];
    var _cache = {};

    var MAX_COLUMN = parseInt($attrs.maxColumns, 10);
    var _activeGroupIndex;

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
    function _select(group, active) {
      var deferred = $q.defer();

      group = group || $scope.groups[1];

      group.isSelected = true;
      $scope.isRecent = group.isRecent;

      _createStickers(group, deferred);

      deferred.promise.then(function (list) {
        $scope.list = list;

        _updateSelect(group);
        if (list.length > 0) {
          active ?  _setNextItem(list.length - 1) :  _setNextItem(0);
        }

        $scope.onCreateSticker();
      });
    }

    /**
     * update select
     * @private
     */
    function _updateSelect(selectGroup) {
      _.forEach($scope.groups, function(group, index) {
        group !== selectGroup ? (group.isSelected = false) : (_activeGroupIndex = index);
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
    function _createStickers(group, deferred) {
      if (group.isRecent) {
        _getRecent(deferred);
      } else {
        _getList(group.id, deferred);
      }
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

    function navActiveSticker(x, y) {
      var activeGroup = _groups[_activeGroupIndex];
      var list = $scope.list;

      var acx = activeGroup.activeIndex % MAX_COLUMN;
      var acy = Math.floor(activeGroup.activeIndex / MAX_COLUMN);

      var cpx = acx + x;
      var cpy = acy + y;

      if (_isNextGroup(cpx, cpy, x, y)) {
        _setActiveItem(false);
        _setNextGroup((x > 0 || y > 0) ? 1 : -1);
      } else {
        $scope.$apply(function() {
          _setActiveItem(false);
          _setNextItem(list[cpy * MAX_COLUMN + cpx] == null && y > 0 ? list.length - 1 : cpy * MAX_COLUMN + cpx);
        });
      }

    }

    function _isNextGroup(cpx, cpy, x, y) {
      var list = $scope.list;
      return ((list[cpy * MAX_COLUMN] == null && (y > 0 || y < 0)) || (list[cpy * MAX_COLUMN + cpx] == null && (x > 0 || x < 0))) && _groups.length > 1;
    }

    function _setNextGroup(index) {
      _select(_getNextGroup(index), index < 0);
    }

    function _setNextItem(index) {
      _setActiveItem(index, true);
      _groups[_activeGroupIndex].activeIndex = index;
      setTimeout(function() {
        $scope.autoScroll(index);
      });
    }

    function _setActiveItem(index, value) {
      var list = $scope.list;

      if (_.isBoolean(index)) {
        _.each(list, function(item) {
          item.active = index;
        });
      } else {
        list[index] && (list[index].active = value);
      }
    }

    function _getNextGroup(next) {
      return _groups[_activeGroupIndex + next] == null ? next > 0 ? _groups[0] : _groups[_groups.length - 1] : _groups[_activeGroupIndex + next];
    }
  }
})();
