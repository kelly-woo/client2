(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectTrelloCtrl', JndConnectTrelloCtrl);

  /* @ngInject */
  function JndConnectTrelloCtrl($scope, $q, JndUtil, JndConnect, JndConnectUnionApi, JndConnectTrelloApi) {

    $scope.isInitialized = false;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.isUpdate = !!$scope.current.connectId;
      _attachEvents();
      _initialRequest();
    }


    function _attachEvents() {

    }

    /**
     * trello 데이터를 가져오기 위한 첫번째 request
     * @private
     */
    function _initialRequest() {
      var deferred = $q.defer();
      var promises = [];

      promises.push(JndConnectTrelloApi.getBoards());

      //update 모드가 아닐 경우 바로 view 를 노출한다.
      if (!$scope.isUpdate) {
        $scope.isInitialized = true;
      } else {
        promises.push(JndConnectUnionApi.read('trello', $scope.current.connectId));
      }

      $q.all(promises)
        .then(_onSuccessInitialRequest, _onErrorInitialRequest);
    }

    /**
     * initial  request 성공 시 이벤트 핸들러
     * @param {array} results
     * @private
     */
    function _onSuccessInitialRequest(results) {
      console.log(results);
      //_onSuccessGetRepo(results[0].data);
      //if ($scope.isUpdate) {
      //  _onSuccessGetSetting(results[1].data);
      //}
    }

    /**
     * initial request 실패 시 이벤트 핸들러
     * @param results
     * @private
     */
    function _onErrorInitialRequest(results) {
      JndUtil.alertUnknownError(results);
    }
  }
})();
