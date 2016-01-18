/**
 * @fileoverview join topic controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TopicJoinCtrl', TopicJoinCtrl);

  /* @ngInject */
  function TopicJoinCtrl($scope, $timeout, $state, entityheaderAPIservice, analyticsService,
                         jndPubSub, memberService, modalHelper, EntityMapManager) {
    _init();

    /**
     * 처음 모달이 열렸을 때 실행되어야 할 부분.
     */
    function _init() {
      $scope.memberId = memberService.getMemberId();
      $scope.channelTitleQuery = '';

      $scope.cancel = modalHelper.closeModal;
      $scope.newChannel = newChannel;
      $scope.getMatches = getMatches;
      $scope.getItemHeight = getItemHeight;

      $scope.onSelect = onSelect;
      $scope.onTabDeselect = onTabDeselect;
      $scope.onListClick = onListClick;
    }

    /**
     * 토픽을 만드는 모달을 열고 현재 열려있는 조인 모달은 닫는다.
     */
    function newChannel() {
      $scope.cancel();
      modalHelper.openTopicCreateModal();
    }

    /**
     * list에서 filter된 list를 전달한다.
     * @param {array} list
     * @param {string} filterText
     * @returns {*}
     */
    function getMatches(list, filterText) {
      var matches;

      filterText = filterText.toLowerCase();
      matches = _.chain(list)
        .filter(function(item) {
          return item.name.toLowerCase().indexOf(filterText) > -1;
        })
        .sortBy(function(item) {
          return item.name.toLowerCase();
        })
        .value();

      if ($scope.unJoinedChannelList === list) {
        $scope.joinableLength = matches.length;
      } else {
        $scope.joinedLength = matches.length;
      }

      return matches;
    }

    /**
     * topic select event callback
     * @param {object} item
     */
    function onSelect(item) {
      var entity = item;
      var entityId;

      if (entity) {
        entityId = entity.id;
        if (EntityMapManager.contains('joined', entityId)) {
          // join한 topic

          _topicJoin(entityId);
        } else {
          // join하지 않은 topic이므로 join 가능한지 requst 후 topic에 join 함

          if (!$scope.isLoading) {
            jndPubSub.showLoading();

            entityheaderAPIservice.joinChannel(entityId)
              .success(function() {
                _topicJoin(entityId);
              })
              .finally(function() {
                jndPubSub.hideLoading();
              });
          }
        }
      }
    }

    /**
     * tab select event callback
     */
    function onTabDeselect(type) {
      jndPubSub.pub('setActiveIndex:' + type, 0);
      jndPubSub.pub('updateList:' + type);
    }

    /**
     * 특정 topic에 join한다.
     * @param {number} entityId
     */
    function _topicJoin(entityId) {
      // analytics
      analyticsService.mixpanelTrack( "topic Join" );

      //jndPubSub.updateLeftPanel();

      // TODO: REFACTOR -> ROUTE SERVICE
      $state.go('archives', {entityType: 'channels', entityId: entityId});

      $scope.cancel();
    }

    /**
     * list click event handler
     */
    function onListClick() {
      $timeout(function() {
        $('#invite-member-filter').focus();
      });
    }

    /**
     * item height 전달한다.
     */
    function getItemHeight(item) {
      return (_.isString(item.description) && item.description != '') ? 130 : 77;
    }
  }
})();
