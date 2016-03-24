/**
 * @fileoverview image carousel controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('ImageCarouselCtrl', imageCarouselCtrl);

  /* @ngInject */
  function imageCarouselCtrl($scope, modalHelper, UserList, ImageCarousel, data) {

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.imageList = [];
      $scope.imageMap = {};

      $scope.pivot = {
        userName: data.userName,
        uploadDate: data.uploadDate,
        fileTitle: data.fileTitle,
        fileUrl: data.fileUrl,
        extraInfo: data.extraInfo,
        messageId: data.messageId,
        writerId: data.writerId
      };

      $scope.entityId = data.entityId;
      $scope.keyword = data.keyword;
      $scope.getImage = data.getImage;
      $scope.isSingle = data.isSingle;

      $scope.close = close;
      $scope.getList = getList;
      $scope.pushImage = pushImage;
    }

    /**
     * modal close
     */
    function close() {
      modalHelper.closeModal();
    }

    /**
     * server로 부터 image list를 get
     * @param {string} type - get할 방향을 old 또는 new, both 중 설정
     * @param {object} data
     * @param {function} fn
     * @private
     */
    function getList(type, data, fn) {
      var searchType = undefined;
      var count = 20;

      if (!$scope.isSingle) {
        if (type !== 'init') {
          // messageId 보다 오래된/새로운 목록 대상
          searchType = type === 'prev' ? 'old' : 'new';
          count = Math.ceil(count / 2);
        }

        $scope.getImage({
          messageId: data.messageId,
          writerId: data.writerId,
          entityId: $scope.entityId,
          q: $scope.keyword,
          type: searchType,
          count: count
        })
        .success(function(response) {
          response.records != null && (response = response.records);
          if (response) {
            _pushImages(type, response, data.messageId);
          }

          fn && fn();
        })
        .error(function() {
          fn && fn();
        });
      }
    }

    /**
     * server로 부터 전달받은 image list를 image carousel에서 관리하는 image list에 추가
     * @param {string} type - get할 방향을 old 또는 new, both
     * @param {array} records - server로 부터 전달받은 image list
     * @param {string} messageId - 현재 출력중인 image item의 index
     * @private
     */
    function _pushImages(type, records, messageId) {
      var record;
      var imageItem;
      var i;
      var cal;
      var writer;

      if (records) {
        // prev, next, init에 따라 records 시작점 달라짐
        if (type === 'prev') {
          i = records.length - 1;
          cal = -1;
        } else {
          i = 0;
          cal = 1;
        }

        for (; record = records[i]; i += cal) {
          if (writer = UserList.get(record.writerId)) {
            if (type === 'init' && record.id === messageId) {
              $scope.imageList.splice($scope.imageList.indexOf(messageId), 1);
              imageItem = $scope.imageMap[messageId];
              $scope.imageMap[messageId] = undefined;
            } else {
              imageItem = {
                userName: writer.name,
                uploadDate: record.createTime,
                fileTitle: record.content.title,
                fileUrl: record.content.fileUrl,
                extraInfo: record.content.extraInfo,
                messageId: record.id,
                writerId: record.writerId
              };
            }
          }

          pushImage(type, imageItem);
        }
      }
    }

    /**
     * image list에 추가 image item 추가
     * @param {string} messageId - 현재 출력중인 image item의 index
     * @param {string} type - get할 방향을 old 또는 new, both
     * @param {object} imageItem
     * @private
     */
    function pushImage(type, imageItem) {
      if ($scope.imageMap[imageItem.messageId] == null && _.isNumber(imageItem.messageId)) {

        // carousel에 이미지 추가 하면서 navigation시 바로 thumbnail 이미지가 출력되도록 thumbnail을 preload 한다.
        ImageCarousel.preloadThumbnail(imageItem);

        // type에 따라 image list에 추가되는 방향이 다름
        type === 'prev' ? $scope.imageList.unshift(imageItem.messageId) : $scope.imageList.push(imageItem.messageId);
        $scope.imageMap[imageItem.messageId] = imageItem;
      }
    }
  }
})();
