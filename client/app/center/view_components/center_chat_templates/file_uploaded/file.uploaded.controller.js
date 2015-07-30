(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('FileUploadedCtrl', FileUploadedCtrl);

  /* @ngInject */
  function FileUploadedCtrl($scope, $filter, fileAPIservice, centerService,
                            modalHelper, ImagesHelper, $compile, FileUploaded,
                            $state, entityheaderAPIservice, entityAPIservice, config) {

    // 현재 컨틀롤러가 가지고 있는 최상위 돔 엘레멘트
    var jqRootElement;
    var _jqPreviewContainer;

    var _message;
    var _messageId;

    // 현재 컨트롤러가 관리하고 있는 file content
    var _content;

    // small thumbnail 을 가지고 있는 dom element
    var _jqSmallThumbnail;
    // large thumbnail 을 가지고 있는 dom element
    var _jqLargeThumbnail;

    // large thumbnail 왼쪽위에 있는 버튼 dom element
    var _jqFullScreenToggleButton;

    // preview를 들고 있는 dom element
    var _jqThumbnailParent;

    // 서버 주소
    var _serverUploaded = config.server_uploaded;

    $scope.onSmallThumbnailClick = onSmallThumbnailClick;
    $scope.onLargeThumbnailClick = onLargeThumbnailClick;
    $scope.onFullScreenImageButtonClick = onFullScreenImageButtonClick;
    $scope.onClickSharedEntity = onClickSharedEntity;

    init();

    /**
     * 초기화 펑션이다.
     * 현재 디렉티브가 물고있는 엘레멘트를 jqRootElement 에 저장한다.
     */
    function init() {
      jqRootElement = $(document.getElementById($scope.msg.id));
      _message = $scope.msg.message;
      _messageId = _message.id;

      _content = _isCommentType(_message) ? $scope.msg.feedback.content : _message.content;

      if ($filter('hasPreview')(_content)) {
        // content 가 preview 를 지원 할 경우 -> 이미지.
        $scope.imageUrlToBeLoaded = _serverUploaded  + FileUploaded.getSmallThumbnailUrl(_content);
      }

      // integration file 이면 download를 표기하지 않음
      $scope.isIntegrateFile = fileAPIservice.isIntegrateFile(_content.serverUrl);

      _updateSharedList();
      _attachEventListener();
    }

    /**
     * eventListener 를 attach 한다.
     * @private
     */
    function _attachEventListener() {
      $scope.$on('onChangeShared',_updateSharedList);
      $scope.$on('onMemberEntityMapCreated', _updateSharedList);
      $scope.$on('updateCenterForRelatedFile', _onUpdateCenterForRelatedFile);
    }

    /**
     * small thumbnail 이 클릭되었을때 불려진다.
     */
    function onSmallThumbnailClick() {
      _jqSmallThumbnail = $(document.getElementById($scope.msg.id + '-image-preview-small'));

      if (!_jqThumbnailParent) {
        _jqThumbnailParent = _jqSmallThumbnail.parent();
      }

      if (!_jqLargeThumbnail) {
        _jqLargeThumbnail = _getLargeThumbnailImageLoaderElement();
      }


      _jqThumbnailParent.prepend(_jqLargeThumbnail);

      _compileNewDomElement(_jqLargeThumbnail, $scope);

      _addFullScreenImageViewButton(_jqThumbnailParent);

      _jqSmallThumbnail.remove();

      _jqPreviewContainer = _jqThumbnailParent.closest('.preview-container');
      _togglePullLeft();
    }

    /**
     * full screen image 를 볼 수 있는 모달창을 여는 버튼을 jqElement 에 추가한다.
     * @param {jqElement} jqElement - 버튼을 추가할 parent element
     * @private
     */
    function _addFullScreenImageViewButton(jqElement) {
      if (!_jqFullScreenToggleButton) {
        _jqFullScreenToggleButton = angular.element('<div class="large-thumbnail-full-screen" ng-click="onFullScreenImageButtonClick();"><i class="fa fa-arrows-alt"></i></i></div>');
      }

      _compileNewDomElement(_jqFullScreenToggleButton, $scope);

      jqElement.append(_jqFullScreenToggleButton);
    }

    /**
     * large thumbnail 을 가지고 있는 dom element 를 생성해서 return 한다.
     * @returns {jqElement} jqImageLoaderContainer - large thumbnail을 가지고 있는 컨테이너 엘레멘트
     * @private
     */
    function _getLargeThumbnailImageLoaderElement() {
      var jqImageLoaderContainer;
      var imageLoaderMarkUp = ImagesHelper.getImageLoaderElement(_serverUploaded  + FileUploaded.getLargeThumbnailUrl(_content));

      imageLoaderMarkUp.addClass('large-thumbnail');
      imageLoaderMarkUp.attr({
        //'image-fit-to-width': true,
        'image-max-width': 700,
        'ng-click': 'onLargeThumbnailClick();',
        'id': $scope.msg.id + '-image-preview-large'
      });

      jqImageLoaderContainer = angular.element(imageLoaderMarkUp);
      return jqImageLoaderContainer;
    }

    /**
     * 현재 컨트롤러가 가지고 있는 element 의 자식중 'preview-container' 클래스를 가진 eleement 를 찾아서
     * 'pull-left' 를 toggle 시킨다.
     * @private
     */
    function _togglePullLeft() {
      _jqPreviewContainer.toggleClass('pull-left')
    }

    /**
     * large thumbnail 엘레멘트가 클릭되어졌을 때 불려진다.
     */
    function onLargeThumbnailClick() {
      _compileNewDomElement(_jqSmallThumbnail, $scope);

      _jqThumbnailParent.append(_jqSmallThumbnail);
      _jqLargeThumbnail.remove();
      _jqFullScreenToggleButton.remove();
      _togglePullLeft();
    }

    /**
     * large thumbnail 을 보고 있을 때 full screen으로 볼 수 있는 모달창을 연다.
     */
    function onFullScreenImageButtonClick() {
      modalHelper.openImageCarouselModal({
        // server api
        getImage: fileAPIservice.getImageListOnRoom,

        // image file api data
        messageId: _message.id,
        entityId: $scope.currentEntity.entityId || $scope.currentEntity.id,
        // image carousel view data
        userName: _message.writer.name,
        uploadDate: $scope.msg.time,
        fileTitle: _content.title,
        fileUrl: _content.fileUrl,
        // single file
        isSingle: $scope.msg.status === 'unshared'
      });
    }

    /**
     * 엘레멘트와 스코프를 다시 바인딩 시켜준다.
     * @param {jqElement} jqElement - 바인딩 시킬 엘레멘트
     * @param {scope} scope - 바인딩 시킬 스코프
     * @private
     */
    function _compileNewDomElement(jqElement, scope) {
      $compile(jqElement)(scope);
    }

    /**
     * content type 이 코멘트인지 확인한다.
     * @param {string} contentType
     * @returns {boolean}
     * @private
     */
    function _isCommentType(contentType) {
      return centerService.isCommentType(contentType);
    }

    /**
     * sharedList 를 업데이트 한다.
     * @private
     */
    function _updateSharedList() {
      $scope.msg.message.shared = fileAPIservice.updateShared(_message);
    }

    /**
     * shared entity 클릭시 이벤트 핸들러
     * @param {string} entityId
     */
    function onClickSharedEntity(entityId, entityType) {
      // TODO: File detail controller 에도 중복 로직이 있음.
      if (entityType === 'users') {
        $state.go('archives', {entityType: entityType, entityId: entityId});

      } else {
        var targetEntity = entityAPIservice.getEntityFromListById($scope.joinedEntities, entityId);

        if (entityAPIservice.isJoinedTopic(targetEntity)) {
          // joined topic.
          $state.go('archives', { entityType: targetEntity.type, entityId: targetEntity.id });
        } else {
          // Join topic first and go!
          entityheaderAPIservice.joinChannel(entityId)
            .success(function(response) {
              //analyticsService.mixpanelTrack( "topic Join" );
              $state.go('archives', {entityType: 'channels',  entityId: entityId });
            })
            .error(function(err) {
              alert(err.msg);
            });
        }
      }
    }

    /**
     * share unshare 상태를 업데이트 한다.
     * @param {object} event
     * @param {object} file
     * @private
     */
    function _onUpdateCenterForRelatedFile(event, file) {
      var fileId = file.id;
      if (fileId === _messageId) {
        fileAPIservice.getFileDetail(fileId)
          .success(function (response) {
            _.forEach(response.messageDetails, function(item) {
              if (item.contentType === 'file') {
                $scope.msg.message.shareEntities = item.shareEntities;
                _updateSharedList();
              }
            });
          });
      }
    }

  }
}());
