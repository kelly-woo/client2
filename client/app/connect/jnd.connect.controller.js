(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectCtrl', JndConnectCtrl);

  /* @ngInject */
  function JndConnectCtrl($scope, $timeout, $filter, JndConnect, EntityMapManager, JndConnectDummy) {

    var UNION_DATA = {
      '1': {
        name: 'googleCalendar',
        icon: '',
        title: $filter('translate')('@jnd-connect-5'),
        desc: $filter('translate')('@jnd-connect-6'),
        hasAuth: false,
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
        hasAuth: true,
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
        name: 'incoming',
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

    var DUMMY = JndConnectDummy.get();

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
      $scope.$on('connectCard:addPlug', _onAddPlug);
      $scope.$on('unionNav:backToMain', _onBackToMain);
    }

    /**
     * 플러그 추가시 핸들러
     * @param angularEvent
     * @param unionName
     * @private
     */
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
     * 연동된 data list 를 request 하여 가져온다.
     */
    function getList() {
      //TODO: request 로직
      $timeout(_onGetListSuccess, 1000);
    }

    /**
     * list 조회 success 핸들러
     * @private
     */
    function _onGetListSuccess() {
      var list = [];
      var response = DUMMY.common.connectList;
      _.each(UNION_DATA, function(union) {
        list.push(_getUnion(union, response[union.name]));
      });
      $scope.unions = list;
    }

    /**
     * server data 로 부터 UI 에 맞는 plug 데이터를 가공하여 반환한다.
     * @param data
     * @returns {{user: *, room: *, isOn: boolean, raw: *}}
     * @private
     */
    function _getPlug(data) {
      return {
        user: EntityMapManager.get('member', data.memberId),
        room: EntityMapManager.get('total', data.roomId),
        isOn: data.status === 'enabled',
        raw: data
      }
    }

    /**
     * UI 에 적합한 Union 데이터를 가공하여 반환한다.
     * @param {Object} constUnion - 최상단에 정의된 UNION 데이터
     * @param {Array} list
     * @returns {Object}
     * @private
     */
    function _getUnion(constUnion, list) {
      var item = _.extend({}, constUnion);
      item.plugs = [];
      _.forEach(list, function(data) {
        item.plugs.push(_getPlug(data));
      });
      return item;
    }
  }
})();
