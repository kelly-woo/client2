'use strict';

var app = angular.module('jandiApp');

app.service('fileAPIservice', function($rootScope, $filter, $http, $q, $timeout, $upload, $window, BotList,
                                       configuration, entityAPIservice, EntityHandler, memberService, Preloader,
                                       RoomTopicList, storageAPIservice) {
  var _that = this;
  var FILE_SIZE_LIMIT = 300; // 300MB
  var _filterTypePreviewMap = {
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
  var _timerClearCurUpload;

  _init();

  /**
   * init
   * @private
   */
  function _init() {
    _that.upload = upload;
    _that.deleteFile = deleteFile;

    _that.getFileList = getFileList;
    _that.getImageListOnRoom = getImageListOnRoom;

    _that.addShareEntity = addShareEntity;
    _that.unShareEntity = unShareEntity;

    _that.getShareOptions = getShareOptions;
    _that.getShareOptionsWithoutMe = getShareOptionsWithoutMe;

    _that.getSharedEntities = getSharedEntities;
    _that.updateShared = updateShared;

    _that.isFileTooLarge = isFileTooLarge;

    _that.clearCurUpload = clearCurUpload;
    _that.cancelClearCurUpload = cancelClearCurUpload;
    _that.clearUploader = clearUploader;

    _that.generateFileTypeFilter = generateFileTypeFilter;
    _that.broadcastCommentFocus = broadcastCommentFocus;
    _that.getFilterTypePreviewMap = getFilterTypePreviewMap;

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

  /**
   * get file list
   * @param {object} searchStatus
   * @returns {*}
   */
  function getFileList(searchStatus) {
    var data = _.extend({}, searchStatus);

    data.teamId = memberService.getTeamId();
    if (data.sharedEntityId == null) {
      data.sharedEntityId = -1;
    }

    return $http({
      method: 'POST',
      url: $rootScope.server_address + 'search',
      data: data
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
    var jandiBot = BotList.getJandiBot();
    _.each(memberList, function(member, index) {
      if (memberService.isActiveMember(member)) {
        enabledMemberList.push(member);
      }
    });

    joinedChannelList = _orderByName(joinedChannelList);
    enabledMemberList = _orderByName(enabledMemberList);
    if (jandiBot) {
      enabledMemberList.unshift(BotList.getJandiBot());
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

  // Populating a list of entities to be displayed as 'shared channel/privateGroup'.
  function getSharedEntities(file, getSharedEntity) {

    var sharedEntityArray = [];
    var unique = _.uniq(file.shareEntities);

    // shareEntities의 값 중 DM의 경우 room id와 user id를 전달하는 경우가 나누어 지므로
    // getEntityFromListById를 수행하고 값이 존재하지 않으면 getEntityFromListByEntityId를 수행함.
    //
    // TODO: shareEntities 값 항상 room id로 전달하도록 수정하기로 back-end와 합의봄
    getSharedEntity = getSharedEntity ? getSharedEntity : function(sharedEntityId) {
      return EntityHandler.get(sharedEntityId);
    };

    _.each(unique, function(sharedEntityId) {
      var sharedEntity = getSharedEntity(sharedEntityId);
      if (angular.isUndefined(sharedEntity)) {
        // If I don't have it in my 'totalEntities', it means entity is 'archived'.
        // Just return from here;
      } else {
        if( sharedEntity.type == 'privategroups' && RoomTopicList.hasUser(sharedEntityId, $rootScope.member.id) ||
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
      return EntityHandler.get(sharedEntityId);
    });
  }

  // Return true if file size is over 100MB.
  function isFileTooLarge(file) {
    var sizeInMb = file.size/(Math.pow(1024,2));
    if (sizeInMb > FILE_SIZE_LIMIT) {
      return true;
    } else {
      return false;
    }
  }

  function clearCurUpload() {
    // hide progress bar
    _timerClearCurUpload = $timeout(function () {
      $rootScope.curUpload && ($rootScope.curUpload.isComplete = true);
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
   * filter type preview map을 전달한다.
   * @returns {*}
   */
  function getFilterTypePreviewMap() {
    return _filterTypePreviewMap;
  }
});
