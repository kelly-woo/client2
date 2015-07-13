'use strict';

var app = angular.module('jandiApp');

app.service('fileAPIservice', function($http, $rootScope, $window, $upload, $filter,
                                       memberService, entityAPIservice, storageAPIservice, modalHelper) {
  var fileSizeLimit = 300; // 300MB
  var integrateMap = {
    'google': true,
    'dropbox': true
  };
  var fileRequest;

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
  this.removeSharedEntities = removeSharedEntities;
  this.getSharedEntities = getSharedEntities;
  this.updateShared = updateShared;

  this.broadcastFileShare = broadcastFileShare;
  this.isFileTooLarge = isFileTooLarge;
  this.clearCurUpload = clearCurUpload;
  this.deleteFile = deleteFile;
  this.generateFileTypeFilter = generateFileTypeFilter;
  this.isIntegrateFile = isIntegrateFile;
  this.dataURItoBlob = dataURItoBlob;
  this.openFileShareModal = openFileShareModal;

  this.broadcastChangeShared = broadcastChangeShared;
  this.broadcastCommentFocus = broadcastCommentFocus;

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
      url = $rootScope.server_address + flash_url + 'file';
    }

    fileInfo.teamId  = memberService.getTeamId();
    if(!supportHTML)
      fileInfo.access_token = storageAPIservice.getAccessToken();

    if (fileInfo.uploadType === 'clipboard') {
      files.blob.name = fileInfo.title;
      file = files.blob;
    } else {
      file = files
    }

    return $upload.upload({
      method: 'POST',
      url: url,
      data: fileInfo,
      file: file,
      fileFormDataName: 'userFile'
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

  function getFileDetail(fileId) {
    return $http({
      method  : 'GET',
      url     : $rootScope.server_address + 'messages/' + fileId,
      params  : {
        teamId: memberService.getTeamId()
      }
    });
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
   * @returns {*}
   */
  function postComment(fileId, content, sticker) {
    if (sticker) {
      return _postSticker(fileId, content, sticker);
    } else {
      return _postComment(fileId, content);
    }
  }

  /**
   * comment 를 post 한다.
   * @param {string} fileId 파일 id
   * @param {string} content post 할 문자열
   * @returns {*}
   * @private
   */
  function _postComment(fileId, content) {
    return $http({
      method  : 'POST',
      url     : $rootScope.server_address + 'messages/' + fileId + '/comment',
      data    : {
        comment : content,
        teamId  : memberService.getTeamId()
      }
    });
  }

  /**
   * sticker 를 post 한다.
   * @param {string} fileId 파일 id
   * @param {string} content post 할 문자열
   * @param {object} sticker 스티커 객체
   * @returns {*}
   * @private
   */
  function _postSticker(fileId, content, sticker) {
    var data = {
      stickerId: sticker.id,
      groupId: sticker.groupId,
      teamId: memberService.getTeamId(),
      share: fileId
    };

    if (content) {
      data.content = content;
    }

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

    _.each(memberList, function(member, index) {
      if (member.status != 'disabled')
        enabledMemberList.push(member);
    });

    return joinedChannelList.concat(enabledMemberList);
  }

  //  Removes entity that exists in 'file.shareEntities' from 'list'.
  //  Returns new array.

  function removeSharedEntities(file, list) {
    var returnValue = [];
    angular.forEach(list, function(option, index) {
      if(file.shareEntities.indexOf(option.id) == -1)
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
      return entityAPIservice.getEntityFromListById($rootScope.totalEntities, sharedEntityId);
    };

    _.each(unique, function(sharedEntityId) {
      var sharedEntity = getSharedEntity(sharedEntityId);
      if (angular.isUndefined(sharedEntity)) {
        // If I don't have it in my 'totalEntities', it means entity is 'archived'.
        // Just return from here;
      }
      else {
        if( sharedEntity.type == 'privategroups' && entityAPIservice.isMember(sharedEntity, $rootScope.member) ||
          sharedEntity.type == 'channels' ||
          sharedEntity.type == 'users' )  {

          sharedEntityArray.push(sharedEntity)
        }
      }
    });
    return sharedEntityArray;
  }

  function updateShared(message) {
    return getSharedEntities(message, function(sharedEntityId) {
      return entityAPIservice.getEntityFromListById($rootScope.totalEntities, sharedEntityId) ||
        entityAPIservice.getEntityFromListByEntityId($rootScope.memberList, sharedEntityId);
    });
  }

  function openFileShareModal($scope, file) {
    modalHelper.openFileShareModal($scope, file);
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
    $rootScope.curUpload = {};
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
    var array = [
      {viewValue: $filter('translate')('@common-file-type-all'), value: 'all'},
      {viewValue: $filter('translate')('@common-file-type-google-docs'), value: 'googleDocs'},
      {viewValue: $filter('translate')('@common-file-type-documents'), value: 'document'},
      {viewValue: $filter('translate')('@common-file-type-presentations'), value: 'presentation'},
      {viewValue: $filter('translate')('@common-file-type-spreadsheets'), value: 'spreadsheet'},
      {viewValue: $filter('translate')('@common-file-type-pdf'), value: 'pdf'},
      {viewValue: $filter('translate')('@common-file-type-images'), value: 'image'},
      {viewValue: $filter('translate')('@common-file-type-video'), value: 'video'},
      {viewValue: $filter('translate')('@common-file-type-audio'), value: 'audio'}
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
    return new Blob([ab],{type: 'image/png'});
  }

  // Broadcast shareEntities change event to centerpanel, rightpanel, detailpanel
  function broadcastChangeShared(data) {
    $rootScope.$broadcast('onChangeShared', data);
  }

  // right panel 안에 file detail의 comment input element에 focus가 가도록 broadcast
  function broadcastCommentFocus() {
    $rootScope.$broadcast('setCommentFocus');
  }

  /**
   * fileReuqest get하기 전에 한번 저장용 변수 제공함
   */
  Object.defineProperty(this, 'tempFileRequest', {
    get: function() {
      var temp = fileRequest;
      fileRequest = undefined;
      return temp;
    },
    set: function(value) {
      fileRequest = value;
    }
  });
});
