(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectCtrl', JndConnectCtrl);

  /* @ngInject */
  function JndConnectCtrl($scope, $timeout, $filter, JndConnect, EntityMapManager) {

    var UNION_DATA = {
      '1': {
        name: 'googleCalendar',
        icon: '',
        title: $filter('translate')('@jnd-connect-5'),
        desc: $filter('translate')('@jnd-connect-6'),
        hasAuth: true,
        popover: $filter('translate')('@jnd-connect-24')
      },
      //'2': {
      //  name: 'googleDrive',
      //  icon: '',
      //  title: 'Google Drive',
      //  desc: 'Google Drive 에 등록된 파일을 잔디로 공유할 수 있습니다.',
      //  hasAuth: false,
      //  popover: ''
      //},
      '3': {
        name: 'github',
        icon: '',
        title: $filter('translate')('@jnd-connect-15'),
        desc: $filter('translate')('@jnd-connect-16'),
        hasAuth: false,
        popover: $filter('translate')('@jnd-connect-23')
      },
      //'4': {
      //  name: 'dropbox',
      //  icon: '',
      //  title: 'Dropbox',
      //  desc: 'Dropbox에 공유된 파일을 손쉽게 잔디로 공유할 수 있습니다.',
      //  hasAuth: false,
      //  popover: ''
      //},
      '5': {
        name: 'jira',
        icon: '',
        title: $filter('translate')('@jnd-connect-17'),
        desc: $filter('translate')('@jnd-connect-18'),
        hasAuth: false,
        popover: $filter('translate')('@jnd-connect-25')
      },
      '6': {
        name: 'trello',
        icon: '',
        title: $filter('translate')('@jnd-connect-19'),
        desc: $filter('translate')('@jnd-connect-20'),
        hasAuth: false,
        popover: $filter('translate')('@jnd-connect-26')
      },
      '7': {
        name: 'webhook',
        icon: '',
        title: $filter('translate')('@jnd-connect-21'),
        desc: $filter('translate')('@jnd-connect-22'),
        hasAuth: false,
        popover: $filter('translate')('@jnd-connect-27')
      }
    };

    //$scope.list = UNION_LIST;
    $scope.currentUnion = null;
    $scope.isClose = false;
    $scope.historyBack = historyBack;
    $scope.close = close;
    $scope.unions = [];


    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _attachEvents();
      getList();
    }

    /**
     * event handler 를 바인딩 한다.
     * @private
     */
    function _attachEvents() {
      $scope.$on('union:addPlug', _onAddPlug);
      $scope.$on('union:backToMain', _onBackToMain);
    }

    function _onAddPlug(angularEvent, unionName) {
      var targetUnion = _.find($scope.unions, function(union) {
        return union.name === unionName;
      });
      if (targetUnion) {
        $scope.currentUnion = targetUnion;
      } else {
        $scope.currentUnion = null;
      }
    }

    /**
     *
     * @private
     */
    function _onBackToMain() {
      $scope.currentUnion = null;
    }

    /**
     * 잔디 커넥트 닫기 버튼 클릭시 핸들러
     */
    function close() {
      $scope.isClose = true;
      $timeout(function() {
        JndConnect.hide();
      }, 300);
    }

    /**
     * 돌아가기 버튼 클릭시 핸들러
     * TODO: depth 가 있는 경우 로직 추가해야 함
     */
    function historyBack() {
      $scope.isClose = true;
      $timeout(function() {
        JndConnect.hide();
      }, 300);
      //JndConnect.hide();
    }

    /**
     * union list 데이터를 가공한다.
     */
    function getList() {
      var list = [];
      //test
      _.each(UNION_DATA, function(union) {
        list.push(_createDummyUnion(union));
      });
      $scope.unions = list;
    }
    /*
    -=-=-=-=-=-= 이하 테스트 더미데이터 생성을 위한 코드 -=-=-=-=-=-=-
     */

    /**
     * for test
     * @param type
     * @returns {*}
     * @private
     */
    function _getEntity(type) {
      type = type || 'total';
      var randNum = Math.floor((Math.random() * 10) + 1);
      var count = 0;
      var targetEntity;
      var map = EntityMapManager.getMap(type);
      _.each(map, function(entity) {
        if (count === randNum) {
          targetEntity = entity;
          return false;
        }
        count++;
      });
      return targetEntity;
    }

    function _createDummyUnion(union) {

      var item = _.extend({}, union);
      var randCount = Math.floor((Math.random() * 20));
      var i = 0;
      item.plugs = [];

      for (;i < randCount; i++) {
        item.plugs.push(_getPlug());
      }
      return item;
    }

    function _getPlug() {
      var roomType;
      var randType = Math.floor((Math.random() * 3));
      switch (randType) {
        case 0:
          roomType = 'joined';
          break;
        case 1:
          roomType = 'private';
          break;
        case 2:
          roomType = 'memberEntityId';
          break;
        default:
          roomType = 'joined';
          break;
      }

      return {
        user: _getEntity('member'),
        room: _getEntity(roomType),
        isOn: !!Math.floor((Math.random() * 2))
      }
    }

  }
})();
