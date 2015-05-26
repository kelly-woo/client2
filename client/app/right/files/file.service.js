'use strict';

var app = angular.module('jandiApp');

app.factory('fileAPIservice', function($http, $rootScope, $window, $upload, $filter, memberService, entityAPIservice, storageAPIservice) {
  var fileAPI = {};

  fileAPI.upload = function(files, fileInfo, supportHTML, uploadType) {
    var url,
        flash_url;

    if (angular.isObject(files)) {
      fileInfo = files.fileInfo;
      supportHTML = files.supportHTML;
      uploadType = files.uploadType;
      files = files.files;
    }

    flash_url = supportHTML ? '' : 'v2/';

    // upload type이 integration이라면 'v2/file/integrate'로 request함
    // 아니라면 flash_url + 'file'로 request함
    url = $rootScope.server_address + (uploadType === 'integration'? 'v2/file/integrate' : flash_url + 'file');

    fileInfo.teamId  = memberService.getTeamId();
    if(!supportHTML)
      fileInfo.access_token = storageAPIservice.getAccessToken();

    return $upload.upload({
      method: 'POST',
      url: url,
      data: fileInfo,
      file: files,
      fileFormDataName: 'userFile'
    });
  };

  fileAPI.abort = function(file) {
    file.abort();
  };

  fileAPI.getFileList = function(fileRequest) {
    fileRequest.teamId = memberService.getTeamId();
    return $http({
      method: 'POST',
      url: $rootScope.server_address + 'search',
      data: fileRequest
    })
  };

  fileAPI.getFileDetail = function(fileId) {

    return $http({
      method  : 'GET',
      url     : $rootScope.server_address + 'messages/' + fileId,
      params  : {
        teamId: memberService.getTeamId()
      }
    })
  };

  fileAPI.postComment = function(fileId, content) {

    return $http({
      method  : 'POST',
      url     : $rootScope.server_address + 'messages/' + fileId + '/comment',
      data    : {
        comment : content,
        teamId  : memberService.getTeamId()
      }
    })
  };

  fileAPI.deleteComment = function(fileId, commentId) {
    return $http({
      method  : 'DELETE',
      url     : $rootScope.server_address + 'messages/' + fileId + '/comments/' + commentId,
      params  : {
        teamId  : memberService.getTeamId()
      }
    })
  };

  fileAPI.addShareEntity = function(fileId, shareEntity) {
    return $http({
      method  : 'PUT',
      url     : $rootScope.server_address + 'messages/' + fileId + '/share',
      data    : {
        shareEntity : shareEntity,
        teamId  : memberService.getTeamId()
      }
    })
  };

  fileAPI.unShareEntity = function(fileId, unShareEntity) {
    return $http({
      method: 'PUT',
      url: $rootScope.server_address + 'messages/' + fileId + '/unshare',
      data : {
        unshareEntity : unShareEntity,
        teamId  : memberService.getTeamId()
      }
    })
  };

  // Simply putting every channel, user, and private group into one array.
  // No exception.
  fileAPI.getShareOptions = function(joinedChannelList, memberList) {
    var enabledMemberList = [];

    _.each(memberList, function(member, index) {
      if (member.status != 'disabled')
        enabledMemberList.push(member);
    });

    return joinedChannelList.concat(enabledMemberList);
  };

  //  Removes entity that exists in 'file.shareEntities' from 'list'.
  //  Returns new array.
  fileAPI.removeSharedEntities = function(file, list) {
    var returnValue = [];
    angular.forEach(list, function(option, index) {
      if(file.shareEntities.indexOf(option.id) == -1)
        this.push(option);
    }, returnValue);

    return returnValue;
  };

  // Populating a list of entities to be displayed as 'shared channel/privateGroup'.
  fileAPI.getSharedEntities = function(file, getSharedEntity) {

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
  };

  // Broadcast shareEntities change event to centerpanel, rightpanel, detailpanel
  fileAPI.broadcastChangeShared = function(id) {
    //var ret = (id) ? {messageId: id} : null;
    //$rootScope.$broadcast('onChangeShared', ret);
  };

  fileAPI.broadcastCommentFocus = function() {
    //$rootScope.$broadcast('setCommentFocus');
  };

  fileAPI.broadcastFileShare = function(file) {
    $rootScope.$broadcast('openFileShare', file);
  };


  var fileSizeLimit = 100; // 100MB

  // Return true if file size is over 100MB.
  fileAPI.isFileTooLarge = function(file) {
    var sizeInMb = file.size/(Math.pow(1024,2));
    if (sizeInMb > fileSizeLimit)
      return true;
    return false;
  };

  fileAPI.clearCurUpload = function() {
    $rootScope.curUpload = {};

  };

  fileAPI.deleteFile = function(fileId) {
    return $http({
      method: 'DELETE',
      url: $rootScope.server_address + 'files/' + fileId,
      params: {
        teamId: memberService.getTeamId()
      }
    });
  };

  fileAPI.generateFileTypeFilter = function() {
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
  };

  var integrateMap = {
    'google': true,
    'dropbox': true
  };

  fileAPI.isIntegrateFile = function(serverUrl) {
    return !!integrateMap[serverUrl];
  };

  fileAPI.dataURItoBlob = function(dataURI) {
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
  };

  return fileAPI;
});
