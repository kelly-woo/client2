'use strict';

var app = angular.module('jandiApp');

app.service('fileAPIservice', function($http, $rootScope, $window, $upload, $filter, $timeout, $q, configuration,
                                       memberService, entityAPIservice, storageAPIservice, Preloader) {
  var fileSizeLimit = 300; // 300MB
  var integrateMap = {
    'google': true,
    'dropbox': true
  };

  var filterTypePreviewMap = {
    audio: '../assets/images/preview_audio.png',
    video:'../assets/images/preview_video.png',
    pdf: '../assets/images/preview_pdf.png',
    hwp: '../assets/images/preview_hwp.png',
    zip: '../assets/images/preview_zip.png',
    document: '../assets/images/preview_document.png',
    spreadsheet: '../assets/images/preview_spreadsheet.png',
    presentation: '../assets/images/preview_presentation.png',

    google: '../assets/images/preview_google_docs.png',
    dropbox: '../assets/images/preview_dropbox.png',

    etc: '../assets/images/preview_other.png'
  };

  var fileDetail;
  var _timerClearCurUpload;

  _init();

  this.upload = upload;
  this.abort = abort;
  this.getFileList = getFileList;
  this.getFileDetail = getFileDetail;
  this.getImageListOnRoom = getImageListOnRoom;

  this.postComment = postComment;
  this.deleteComment = deleteComment;
  this.deleteSticker = deleteSticker;
  this.addShareEntity = addShareEntity;
  this.unShareEntity = unShareEntity;

  this.getShareOptions = getShareOptions;
  this.getShareOptionsWithoutMe = getShareOptionsWithoutMe;

  this.removeSharedEntities = removeSharedEntities;
  this.getSharedEntities = getSharedEntities;
  this.updateShared = updateShared;

  this.broadcastFileShare = broadcastFileShare;
  this.isFileTooLarge = isFileTooLarge;

  this.clearCurUpload = clearCurUpload;
  this.cancelClearCurUpload = cancelClearCurUpload;
  this.clearUploader = clearUploader;

  this.deleteFile = deleteFile;
  this.generateFileTypeFilter = generateFileTypeFilter;
  this.isIntegrateFile = isIntegrateFile;
  this.dataURItoBlob = dataURItoBlob;

  this.broadcastCommentFocus = broadcastCommentFocus;

  this.getFilterTypePreviewMap = getFilterTypePreviewMap;

  this.getImageDataByFile = getImageDataByFile;

  function _init() {
    Preloader.img(getFilterTypePreviewMap());
  }

  function upload(files, fileInfo, supportHTML, uploadType) {
    var url;
    var flash_url;
    var file;

    if (angular.isObject(files)) {
      fileInfo = files.fileInfo;
      supportHTML = files.supportHTML;
      uploadType = files.uploadType;
      files = files.files;
    }

    flash_url = supportHTML ? '' : 'v2/';

    // upload type이 integration이라면 'v2/file/integrate'로 request함
    // 아니라면 flash_url + 'file'로 request함

    if (uploadType === 'integration') {
      files = undefined;
      url = $rootScope.server_address + 'v2/file/integrate';
    } else {
      url = configuration.file_upload_address + 'inner-api/' + flash_url + 'file';
    }

    fileInfo.teamId  = memberService.getTeamId();
    if(!supportHTML)
      fileInfo.access_token = storageAPIservice.getAccessToken();

    if (fileInfo.uploadType === 'clipboard') {
      files.blob.name = fileInfo.title;
      file = files.blob;
    } else {
      file = files;
    }

    return $upload.upload({
      method: 'POST',
      url: url,
      data: fileInfo,
      file: file,
      fileFormDataName: 'userFile',
      version: 2
    });
  }


  function abort(file) {
    file.abort();
  }

  function getFileList(fileRequest) {
    fileRequest.teamId = memberService.getTeamId();
    return $http({
      method: 'POST',
      url: $rootScope.server_address + 'search',
      data: fileRequest
    });
  }

  /**
   * requset file detail
   * @param {number|string} fileId
   * @returns {*}
   */
  function getFileDetail(fileId) {
    var abortDeferred = $q.defer();
    var request = $http({
      method  : 'GET',
      url     : $rootScope.server_address + 'messages/' + fileId,
      params  : {
        teamId: memberService.getTeamId()
      },
      timeout: abortDeferred.promise
    });

    request.abort = function() {
      abortDeferred.resolve();
    };
    request.finally(function() {
      request.abort = angular.noop;
    });

    return request;
  }

  /**
   * 특정 room(topic or DM)에 공유되었던 이미지 목록 가져오기
   * @param {object} params
   * @param {number} params.messageId - message id
   * @param {number} params.entityId - entity id
   * @param {string} [params.type] - message 보다 오래되거나 새로운 목록대상
   * @param {number} [params.count] - get할 image count
   */
  function getImageListOnRoom(params) {
    var entityId = params.entityId;
    delete params.entityId;

    return $http({
      method: 'GET',
      url: $rootScope.server_address + 'teams/' + memberService.getTeamId() + '/rooms/' + entityId + '/images',
      params: params
    })
  }

  /**
   * comment 를 post 한다.
   * @param {string} fileId 파일 id
   * @param {string} content post 할 문자열
   * @param {object} sticker 스티커 객체
   * @param {array} mentions
   * @returns {*}
   */
  function postComment(fileId, content, sticker, mentions) {
    if (sticker) {
      return _postSticker(fileId, content, sticker, mentions);
    } else {
      return _postComment(fileId, content, mentions);
    }
  }

  /**
   * comment 를 post 한다.
   * @param {string} fileId 파일 id
   * @param {string} content post 할 문자열
   * @param {array} mentions
   * @returns {*}
   * @private
   */
  function _postComment(fileId, content, mentions) {
    return $http({
      method  : 'POST',
      url     : $rootScope.server_address + 'messages/' + fileId + '/comment',
      data    : {
        comment : content,
        teamId  : memberService.getTeamId(),
        mentions: mentions
      },
      version: 3
    });
  }

  /**
   * sticker 를 post 한다.
   * @param {string} fileId 파일 id
   * @param {string} content post 할 문자열
   * @param {object} sticker 스티커 객체
   * @param {array} mentions
   * @returns {*}
   * @private
   */
  function _postSticker(fileId, content, sticker, mentions) {
    var data = {
      stickerId: sticker.id,
      groupId: sticker.groupId,
      teamId: memberService.getTeamId(),
      share: fileId,
      content: content,
      mentions: mentions
    };

    return $http({
      method  : 'POST',
      url     : $rootScope.server_address + 'stickers/comment',
      data    : data
    });
  }

  /**
   * 스티커를 제거한다.
   * @param {string} commentId
   * @returns {*}
   */
  function deleteSticker(commentId) {
    return $http({
      method  : 'DELETE',
      url     : $rootScope.server_address + 'stickers/comments/' + commentId,
      params  : {
        teamId  : memberService.getTeamId()
      }
    });
  }

  /**
   * comment 를 제거한다.
   * @param {string} fileId
   * @param {string} commentId
   * @returns {*}
   */
  function deleteComment(fileId, commentId) {
    return $http({
      method  : 'DELETE',
      url     : $rootScope.server_address + 'messages/' + fileId + '/comments/' + commentId,
      params  : {
        teamId  : memberService.getTeamId()
      }
    });
  }


  function addShareEntity(fileId, shareEntity) {
    return $http({
      method  : 'PUT',
      url     : $rootScope.server_address + 'messages/' + fileId + '/share',
      data    : {
        shareEntity : shareEntity,
        teamId  : memberService.getTeamId()
      }
    });
  }


  function unShareEntity(fileId, unShareEntity) {
    return $http({
      method: 'PUT',
      url: $rootScope.server_address + 'messages/' + fileId + '/unshare',
      data : {
        unshareEntity : unShareEntity,
        teamId  : memberService.getTeamId()
      }
    });
  }

  // Simply putting every channel, user, and private group into one array.
  // No exception.
  function getShareOptions(joinedChannelList, memberList) {
    var enabledMemberList = [];
    var jandiBot = entityAPIservice.getJandiBot();
    _.each(memberList, function(member, index) {
      if (memberService.isActiveMember(member)) {
        enabledMemberList.push(member);
      }
    });

    joinedChannelList = _orderByName(joinedChannelList);
    enabledMemberList = _orderByName(enabledMemberList);
    if (jandiBot) {
      enabledMemberList.unshift(entityAPIservice.getJandiBot());
    }
    return joinedChannelList.concat(enabledMemberList);
  }

  /**
   * 나를 제외한 share options 전달
   * @param {array} joinedChannelList
   * @param {array} memberList
   * @returns {Array.<T>|string|*|{options, dist}|{}|{test, test3}}
   */
  function getShareOptionsWithoutMe(joinedChannelList, memberList) {
    memberList = _.filter(memberList, function(member) {
      return member.id !== memberService.getMemberId();
    });

    return getShareOptions(joinedChannelList, memberList);
  }

  //  Removes entity that exists in 'file.shareEntities' from 'list'.
  //  Returns new array.

  function removeSharedEntities(file, list) {
    var returnValue = [];
    var entityId;
    angular.forEach(list, function(option, index) {
      entityId = option.type === 'users' ? option.entityId : option.id;
      if(file.shareEntities.indexOf(entityId) == -1 && option.id !== memberService.getMemberId())
        this.push(option);
    }, returnValue);

    return returnValue;
  }

  // Populating a list of entities to be displayed as 'shared channel/privateGroup'.

  function getSharedEntities(file, getSharedEntity) {

    var sharedEntityArray = [];
    var unique = _.uniq(file.shareEntities);

    // shareEntities의 값 중 DM의 경우 room id와 user id를 전달하는 경우가 나누어 지므로
    // getEntityFromListById를 수행하고 값이 존재하지 않으면 getEntityFromListByEntityId를 수행함.
    //
    // TODO: shareEntities 값 항상 room id로 전달하도록 수정하기로 back-end와 합의봄
    getSharedEntity = getSharedEntity ? getSharedEntity : function(sharedEntityId) {
      return entityAPIservice.getEntityById('all', sharedEntityId);
    };

    _.each(unique, function(sharedEntityId) {
      var sharedEntity = getSharedEntity(sharedEntityId);
      if (angular.isUndefined(sharedEntity)) {
        // If I don't have it in my 'totalEntities', it means entity is 'archived'.
        // Just return from here;
      } else {
        if( sharedEntity.type == 'privategroups' && entityAPIservice.isUser(sharedEntity, $rootScope.member) ||
          sharedEntity.type == 'channels' ||
          memberService.isMember(sharedEntity.id))  {

          sharedEntityArray.push(sharedEntity)
        }
      }
    });
    return sharedEntityArray;
  }

  function updateShared(message) {
    return getSharedEntities(message, function(sharedEntityId) {
      return entityAPIservice.getEntityById('all', sharedEntityId) ||
        entityAPIservice.getEntityByEntityId(sharedEntityId);
    });
  }

  function broadcastFileShare(file) {
    $rootScope.$broadcast('openFileShare', file);
  }

  // Return true if file size is over 100MB.
  function isFileTooLarge(file) {
    var sizeInMb = file.size/(Math.pow(1024,2));
    if (sizeInMb > fileSizeLimit) {
      return true;
    } else {
      return false;
    }
  }

  function clearCurUpload() {
    // hide progress bar
    _timerClearCurUpload = $timeout(function () {
      $('.file-upload-progress-container').css('opacity', 0);
      // opacity 0된 후 clear upload info
      $timeout(function () {
        $rootScope.curUpload = {};
      }, 500);
    }, 2000);
  }

  function cancelClearCurUpload() {
    $timeout.cancel(_timerClearCurUpload);
  }

  /**
   * clear uploader
   */
  function clearUploader() {
    delete $rootScope.fileUploader;
  }

  function deleteFile(fileId) {
    return $http({
      method: 'DELETE',
      url: $rootScope.server_address + 'files/' + fileId,
      params: {
        teamId: memberService.getTeamId()
      }
    });
  }

  function generateFileTypeFilter() {
    var translate = $filter('translate');

    var array = [
      {viewValue: translate('@common-file-type-all'), value: 'all'},
      {viewValue: translate('@common-file-type-google-docs'), value: 'googleDocs'},
      {viewValue: translate('@common-file-type-documents'), value: 'document'},
      {viewValue: translate('@common-file-type-presentations'), value: 'presentation'},
      {viewValue: translate('@common-file-type-spreadsheets'), value: 'spreadsheet'},
      {viewValue: translate('@common-file-type-pdf'), value: 'pdf'},
      {viewValue: translate('@common-file-type-images'), value: 'image'},
      {viewValue: translate('@common-file-type-video'), value: 'video'},
      {viewValue: translate('@common-file-type-audio'), value: 'audio'},
      {viewValue: translate('@common-file-type-archive'), value: 'archive'}
    ];
    return array;
  }

  function isIntegrateFile(serverUrl) {
    return !!integrateMap[serverUrl];
  }

  function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    return new Blob([ab],{type: 'image/jpeg'});
  }

  // right panel 안에 file detail의 comment input element에 focus가 가도록 broadcast
  function broadcastCommentFocus() {
    $rootScope.$broadcast('setCommentFocus');
  }

  /**
   * list를 name을 기준으로 정렬한다.
   * @param {array} list - 정렬하려는 리스트
   * @returns {*}
   * @private
   */
  function _orderByName(list) {
    return $filter('orderBy')(list, 'name');
  }

  /**
   * file detail 임시 저장용 property
   * file detail 접근 확인하기 위해 files에서 조회한 file object를 file.detail로 전달
   */
  Object.defineProperty(this, 'dualFileDetail', {
    get: function() {
      var temp = fileDetail;
      fileDetail = null;
      return temp;
    },
    set: function(value) {
      fileDetail = value;
    }
  });

  /**
   * filter type preview map을 전달한다.
   * @returns {*}
   */
  function getFilterTypePreviewMap() {
    return filterTypePreviewMap;
  }

  /**
   * get image data
   * @param {object} file
   * @returns {deferred.promise|{then, always}}
   */
  function getImageDataByFile(file) {
    var deferred = $q.defer();
    var orientation;

    if (file) {
      loadImage.parseMetaData(file, function(data) {
        if (data.exif) {
          orientation = data.exif.get('Orientation');
        }

        loadImage(file, function(img) {
          deferred.resolve(img);
        }, {
          canvas: true,
          orientation: orientation
        });
      });
    }

    return deferred.promise;
  }
});
