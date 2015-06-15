(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('fileUploadedCtrl', fileUploadedCtrl);

  /* @ngInject */
  function fileUploadedCtrl($scope, $filter, fileAPIservice, centerService,
                            modalHelper, ImagesHelper, $compile, FileUploaded) {

    var jqRootElement;
    var content;



    var jqSmallThumbnail;
    var jqLargeThumbnail;

    $scope.onSmallThumbnailClick = onSmallThumbnailClick;
    $scope.onLargeThumbnailClick = onLargeThumbnailClick;

    init();

    function init() {
      jqRootElement = $(document.getElementById($scope.msg.id));

      content = _isCommentType($scope.msg.message) ? $scope.msg.feedback.content : $scope.msg.message.content;

      if ($filter('hasPreview')(content)) {
        // content 가 preview 를 지원 할 경우 -> 이미지.
        $scope.imageUrlToBeLoaded = $scope.server_uploaded  + FileUploaded.getSmallThumbnailUrl(content);
      }

      // integration file 이면 download를 표기하지 않음
      $scope.isIntegrateFile = fileAPIservice.isIntegrateFile(content.serverUrl);
    }


    /**
     * small thumbnail 이 클릭되었을때 불려진다.
     */
    function onSmallThumbnailClick() {
      jqSmallThumbnail = $(document.getElementById($scope.msg.id + '-image-preview-small'));

      jqLargeThumbnail = _getLargeThumbnailImageLoaderElement();

      _togglePullLeft();

      _compileNewDomElement(jqLargeThumbnail, $scope);

      jqSmallThumbnail.parent().prepend(jqLargeThumbnail);
      jqSmallThumbnail.remove();
    }

    /**
     * large thumbnail 을 가지고 있는 dom element 를 생성해서 return 한다.
     * @returns {jqElement} jqImageLoaderContainer - large thumbnail을 가지고 있는 컨테이너 엘레멘트
     * @private
     */
    function _getLargeThumbnailImageLoaderElement() {
      var imageLoaderMarkUp = ImagesHelper.getImageLoaderElement($scope.server_uploaded  + FileUploaded.getLargeThumbnailUrl(content));

      imageLoaderMarkUp.addClass('large-thumbnail');
      imageLoaderMarkUp.attr({
        //'image-fit-to-width': true,
        'image-max-width': 700,
        'ng-click': 'onLargeThumbnailClick();'
      });

      var jqImageLoaderContainer = angular.element(imageLoaderMarkUp);
      jqImageLoaderContainer.attr('id', $scope.msg.id + '-image-preview-large');

      return jqImageLoaderContainer;

      var message = $scope.msg;

      console.log(message)
      var newThumbnail;   // large thumbnail address
      var fullUrl;        // it could be file, too.
      if (_isCommentType(message.message.contentType)) {
        newThumbnail = $scope.server_uploaded + (message.feedback.content.extraInfo ? message.feedback.content.extraInfo.largeThumbnailUrl : '');
        fullUrl = $scope.server_uploaded + message.feedback.content.fileUrl;
      }
      else {
        newThumbnail = $scope.server_uploaded + (message.message.content.extraInfo ? message.message.content.extraInfo.largeThumbnailUrl : '');
        fullUrl = $scope.server_uploaded + message.message.content.fileUrl;
      }

      console.log(newThumbnail)
      return newThumbnail;

    }

    /**
     * 현재 컨트롤러가 가지고 있는 element 의 자식중 'preview-container' 클래스를 가진 eleement 를 찾아서
     * 'pull-left' 를 toggle 시킨다.
     * @private
     */
    function _togglePullLeft() {
      var jqPreviewContainer = angular.element(jqRootElement.find('.preview-container'));
      jqPreviewContainer.toggleClass('pull-left');
    }

    /**
     * large thumbnail 엘레멘트가 클릭되어졌을 때 불려진다.
     */
    function onLargeThumbnailClick() {
      _compileNewDomElement(jqSmallThumbnail, $scope);

      jqLargeThumbnail.parent().append(jqSmallThumbnail);
      jqLargeThumbnail.remove();

      _togglePullLeft();
    }

    /**
     * 엘레멘트와 스코프를 다시 바인딩 시켜준다.
     * @param {jqElement} jqElement - 바인딩 시킬 엘레멘트
     * @param {scope} scope - 바인딩 시킬 스코프
     * @private
     */
    function _compileNewDomElement(jqElement, scope) {
      // TODO: 솔직히 이거를 펑션으로 따로 빼야하나 의문이 들긴해요.
      $compile(jqElement)(scope);
    }


    function _replaceThumbnail(jqElement) {
      var message = $scope.msg;
      console.log(jqElement.attr())
      var url = jqElement.attr('image-loader');
      console.log(url);



      if (_isCommentType(message.message.contentType)) {
        newThumbnail = $scope.server_uploaded + (message.feedback.content.extraInfo ? message.feedback.content.extraInfo.largeThumbnailUrl : '');
        fullUrl = $scope.server_uploaded + message.feedback.content.fileUrl;
      }
      else {
        newThumbnail = $scope.server_uploaded + (message.message.content.extraInfo ? message.message.content.extraInfo.largeThumbnailUrl : '');
        fullUrl = $scope.server_uploaded + message.message.content.fileUrl;
      }

      jqElement.attr('image-loader', newThumbnail);
    }
    function onSmallThumbnailClick1($event, message) {

      //  checking type first.
      //  file upload but not image -> return
      if (message.message.contentType === 'file') {
        if (message.message.content.filterType.indexOf('image') < 0) {
          return;
        }
      }

      // comment but not to image file -> return
      if (_isCommentType(message.message.contentType)){
        return;
      }

      // Image is long but not wide. There may be a white space on each side of an image.
      // When user clicks on white(blank) space of image, it will do nothing and return.
      if (angular.isDefined(angular.element($event.target).children('#large-thumbnail-' + message.id).attr('id'))) {
        return;
      }

      // checking where event came from.
      var targetDom;                                      //  Will be small image thumbnail dom element.
      var tempTarget = angular.element($event.target);    //  dom element that just sent an event.

      var tempTargetClass = tempTarget.attr('class');

      if (tempTargetClass.indexOf('image-loader-image') > -1) {
        targetDom = tempTarget.parent();
      } else if (tempTargetClass.indexOf('msg-file-body__img') > -1) {
        //  Small thumbnail of file type clicked.
        targetDom = tempTarget;
      } else if (tempTargetClass.indexOf('msg-file-body-float') > -1 ) {
        //  Small image thumbnail clicked but its parent(.msg-file-body-float) is sending event.
        //  Its parent is sending an event because of opac overlay layer on top of small thumbnail.
        targetDom = tempTarget.children('.msg-file-body__img');
      } else if (tempTargetClass.indexOf('image_wrapper') > -1) {
        targetDom = tempTarget.children('.msg-file-body__img');
      } else if (tempTargetClass.indexOf('fa-comment') > -1) {
        //  Comment image clicked on small image thumbnail.
        targetDom = tempTarget.siblings('.image_wrapper').children('.msg-file-body__img');
      } else {
        return;
      }

      var newThumbnail;   // large thumbnail address
      var fullUrl;        // it could be file, too.

      if (_isCommentType(message.message.contentType)) {
        newThumbnail = $scope.server_uploaded + (message.feedback.content.extraInfo ? message.feedback.content.extraInfo.largeThumbnailUrl : '');
        fullUrl = $scope.server_uploaded + message.feedback.content.fileUrl;
      }
      else {
        newThumbnail = $scope.server_uploaded + (message.message.content.extraInfo ? message.message.content.extraInfo.largeThumbnailUrl : '');
        fullUrl = $scope.server_uploaded + message.message.content.fileUrl;
      }

      //  new DOM element for full screen image toggler.
      // TODO: CONTROLLER IS NOT SUPPOSED TO MANIPULATE DOM ELEMENTS. FIND BETTER WAY TO ADD DOM ELEMENT!!!!!
      var fullScreenToggler = angular.element('<div class="large-thumbnail-full-screen"><i class="fa fa-arrows-alt"></i></i></div>');

      //  bind click event handler to full screen toggler.
      fullScreenToggler.bind('click', function() {
        modalHelper.openFullScreenImageModal($scope, fullUrl);
      });

      // get transform information from original image.
      // if image was rotated according to its orientation from exif data, there must be transform value.
      var transform = getTransformValue(targetDom[0] ? targetDom[0].style: undefined);
      //  new DOM element for large thumbnail image.
      var mirrorDom = ImagesHelper.getImageLoaderElement(newThumbnail);
      //angular.element('<img id="large-thumbnail-' + message.id + '" class="large-thumbnail cursor_pointer image-background" src="'+newThumbnail+'"/>');

      // copy and paste of old 'transform' css property from small to large thumbnail.
      mirrorDom[0].setAttribute('style', transform);

      //  bind click event handler to large thumbnail image.
      mirrorDom.bind('click', function() {
        // opening full screen image modal.
        onLargeThumbnailClick(fullScreenToggler, mirrorDom, targetDom);
      });

      //  hide small thumbnail image.
      targetDom.css('display', 'none');

      //  append new dom elements to parent of small thumbnail(original dom).
      var parent = targetDom.parent().parent();

      //   - change id="large-thumbnail" to id="large-thumbnail-' + message.id + '"
      if (angular.isDefined(parent.children('#large-thumbnail-' + message.id).attr('id'))) {
        //  preventing adding multiple large thumbnail dom element to parent.
        //  if parent already has a child whose id is 'large-thumbnail' which is 'mirrorDom', don't append it and just return.
        return;
      }

      $compile(mirrorDom);
      parent.append(mirrorDom);
      parent.append(fullScreenToggler);

      //  change parent's css properties.
      parent.addClass('large-thumbnail-parent').removeClass('pull-left');
      parent.parent().addClass('large-thumbnail-grand-parent');
    }


    // get all style attributes of targetDom
    // and pick correct 'transform' attribute.
    // and return exact same property.
    function getTransformValue(targetDomStyle) {

      if(!targetDomStyle) { return ''; }

      var transform;

      if (targetDomStyle.getPropertyValue('-webkit-transform')) {
        // webkit
        transform = '-webkit-transform:' + targetDomStyle.getPropertyValue('-webkit-transform');
      }
      else if (targetDomStyle.getPropertyValue('-moz-transform')) {
        // firefox
        transform = '-moz-transform:' + targetDomStyle.getPropertyValue('-moz-transform');
      }
      else if (targetDomStyle.getPropertyValue('-o-transform')) {
        // safari
        transform = '-o-transform:' + targetDomStyle.getPropertyValue('-o-transform');
      }
      else {
        // ie
        transform = '-ms-transform:' + targetDomStyle.getPropertyValue('-ms-transform');
      }

      return transform;
    }


    //  when large thumbnail image is clicked, delete large thumbnail and show original(small thumbnail image).
    function onLargeThumbnailClick1(fullScreenToggler, mirrorDom, originalDom) {
      originalDom.css('display', 'block');
      mirrorDom.parent().removeClass('large-thumbnail-parent').addClass('pull-left');
      mirrorDom.parent().parent().removeClass('large-thumbnail-grand-parent');
      mirrorDom.remove();
      fullScreenToggler.remove();
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
  }
}());
