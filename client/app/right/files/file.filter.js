(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.filter('fileByTitle', function() {
    return function(input, title) {
      if (title === undefined) {
        return input;
      }
      title = title.toLowerCase();

      var return_array = [];
      angular.forEach(input, function(file, index) {
        var fileTitle = file.content.title.toLowerCase();

        if (fileTitle.indexOf(title) > -1 )
          this.push(file)
      }, return_array);

      return return_array;
    }
  });

  app.filter('fileByWriterId', function() {
    return function(input, id) {
      if (id === undefined || id === 'everyone') {
        return input;
      }

      var return_array = [];
      angular.forEach(input, function(file, index) {
        var fileWriterId = file.writerId;

        if (fileWriterId == id ) {
          this.push(file)
        }
      }, return_array);

      return return_array;
    }
  });

  app.filter('fileByType', function() {
    return function (input, type) {

      if (angular.isUndefined(type) || type == 'All') {
        return input;
      }

      type = type.toLowerCase();

      var return_array = [];
      angular.forEach(input, function (file, index) {
        var fileType = file.content.type;

        if (fileType.indexOf(type) > -1) {
          this.push(file)
        }
      }, return_array);

      return return_array;
    }
  });

  // filter에서 integration service인지 판단하는 map
  var integrationMap = {
    google: 'google-drive',
    dropbox: 'dropbox'
  };

  /**
   * file을 표현하는 text를 get
   */
  app.filter('fileType', function($filter) {
    var fileTypeTranMap = {
      document: '@common-file-type-documents',
      spreadsheet: '@common-file-type-spreadsheets',
      presentation: '@common-file-type-presentations',
      gdocument: '@common-file-type-google-documents',
      gspreadsheet: '@common-file-type-google-spreadsheets',
      gpresentation: '@common-file-type-google-presentations'
    };

    return function(file) {
      var fileType;

      if (file) {
        if (fileType = fileTypeTranMap[file.icon]) {
          fileType = $filter('translate')(fileType);
        } else {
          fileType = file.ext;
        }
      }

      return fileType || '';
    };
  });

  /**
   * file을 표현하는 image의 name을 get
   * fileIcon filter에서 반환된 값이 image icon을 가리키는
   * class name을 만듬
   */
  app.filter('fileIcon', function() {
    var fileIconImageMap = {
      audio: 'audio',
      image: 'img',
      video: 'video',
      pdf: 'pdf',
      hwp: 'hwp',
      zip: 'zip',
      document: 'txt',
      spreadsheet: 'excel',
      presentation: 'ppt',
      gdocument: 'document',
      gspreadsheet: 'spreadsheet',
      gpresentation: 'presentation'
    };

    return function(content) {
      var fileIcon;
      var integration;

      if (content) {
        fileIcon = fileIconImageMap[content.icon];
        if (integration = integrationMap[content.serverUrl]) {
          fileIcon = fileIcon + '-' + integration;
        }
      }

      return fileIcon || 'etc';
    };
  });

  /**
   * width, height를 maxWidth, maxHeight에 맞추어 조정한 값을 전달함.
   */
  app.filter('reiszeRectangle', function() {
    return function(maxWidth, maxHeight, width, height) {
      var ratio = [];

      if (maxWidth < width || maxHeight < height) {
        // maxWidth, maxHeight 보다 imageWidth, imageHeight가 크다면 비율 조정 필요함.
        ratio = Math.min(rmaxWidth / width, maxHeight / height);
      } else {
        ratio = 1;
      }

      return {
        width: width * ratio,
        height: height * ratio
      };
    };
  });

  /**
   * file title을 filtering
   * integration file의 경우 확장자를 표시하지 않음
   */
  app.filter('fileTitle', function() {
    var nonExtMap = {
      'application/vnd.google-apps.document': 'gdocument',
      'application/vnd.google-apps.spreadsheet': 'gspreadsheet',
      'application/vnd.google-apps.presentation': 'gpresentation',
      'application/vnd.google-apps.form': 'gform',
      'application/vnd.google-apps.drawing': 'gdrawing'
    };

    return function(content) {
      var title

      if (content) {
        title = content.title || content.name;
        if (integrationMap[content.serverUrl] && !nonExtMap[content.type]) {
          title = title.substring(0, title.lastIndexOf('.'));
        }
      }

      return title || 'unshared file';
    };
  });

  /**
   * preview url을 전달한다.
   */
  app.filter('getPreview', function($filter) {
    var sizeMap = {
      small: {
        value: 80,
        property: 'smallThumbnailUrl'
      },
      medium: {
        value: 360,
        property: 'mediumThumbnailUrl'
      },
      large: {
        value: 640,
        property: 'largeThumbnailUrl'
      }
    };

    return function(content, size) {
      var url;
      var thumbnailType;
      var extraInfo;

      if (content) {
        thumbnailType = sizeMap[size];
        extraInfo = content.extraInfo;

        if (extraInfo && extraInfo[thumbnailType.property]) {
          // thumbnail url
          url = extraInfo[thumbnailType.property];
        } else if (extraInfo && extraInfo.thumbnailUrl) {
          // thumbnail url
          url = extraInfo.thumbnailUrl + '?size=' + thumbnailType.value;
        } else {
          // 원본 url
          // server에서 file size, dimention 제한 또는 특수한 상황으로 인해
          // extraInfo에 thumbnail url을 보장하지 못했을 경우
          url = content.fileUrl;
        }
      } else {
        url = '';
      }

      return $filter('getFileUrl')(url);
    };
  });

  /**
   * preview를 가지고 있는지 여부
   */
  app.filter('hasPreview', function() {
    var rImage = /image/i;

    /**
     * thumbnail url 존재 여부
     * @param {object} extraInfo
     * @returns {boolean}
     * @private
     */
    function _hasThumbnailUrl(extraInfo) {
      return !!(extraInfo &&
      extraInfo.smallThumbnailUrl &&
      extraInfo.mediumThumbnailUrl &&
      extraInfo.largeThumbnailUrl &&
      extraInfo.thumbnailUrl);
    }

    return function(content) {
      var hasPreview = false;
      var hasOriginalUrl;
      var hasThumbnailUrl;

      if (content) {
        hasOriginalUrl = !!content.fileUrl;
        hasThumbnailUrl = _hasThumbnailUrl(content.extraInfo);

        // image를 request할 url이 존재하고 file type이 image이고 integration file이 아닌 경우 preview를 가진다.
        hasPreview = (hasOriginalUrl || hasThumbnailUrl) && rImage.test(content.filterType) && !integrationMap[content.serverUrl];
      }

      return hasPreview;
    };
  });

  /**
   * preview를 가져야 하는지 여부
   */
  app.filter('mustPreview', function($filter) {
    var rImage = /image/i;

    return function(content) {
      return !!(content && $filter('validPreviewSize')(content) && rImage.test(content.filterType)
      && !integrationMap[content.serverUrl] && content.extraInfo && $filter('validPreviewDemention')(content.extraInfo));
    };
  });

  /**
   * preview 생성 가능한 size인지 여부
   */
  app.filter('validPreviewSize', function() {
    var MAX_IMAGE_SIZE = 10000000; // 10MB
    return function(content) {
      return content && content.size < MAX_IMAGE_SIZE
    }
  });

  /**
   * preview 생성 가능한 dimention인지 여부
   */
  app.filter('validPreviewDemention', function() {
    var MAX_IMAGE_DIMENTION = 8192;
    return function(dimention) {
      return dimention.width < MAX_IMAGE_DIMENTION && dimention.height < MAX_IMAGE_DIMENTION;
    };
  });

  /**
   * filter type의 preview
   */
  app.filter('getFilterTypePreview', function(fileAPIservice) {
    var filterTypePreviewMap = fileAPIservice.getFilterTypePreviewMap();

    // 이미지 타입의 프리뷰가 보여져야하지만 etc로 분류되서 no_preview_available이 보여지는 extention의 모음.
    var noPreviewButImageType = {psd: true, ai: true};
    var noPreviewAvailableImage = 'assets/images/no_preview_available.png';

    return function(content) {
      var filterTypePreview;

      if (content.filterType === 'etc') {
        // filterType이 etc중 예외처리
        if (noPreviewButImageType[content.ext]) {
          filterTypePreview = noPreviewAvailableImage;
        }
      }

      if (filterTypePreview == null) {
        filterTypePreview = filterTypePreviewMap[content.serverUrl] || filterTypePreviewMap[content.icon] || noPreviewAvailableImage;
      }

      return filterTypePreview;
    };
  });

  /**
   * integration content 인지 여부
   */
  app.filter('isIntegrationContent', function() {
    var integrationMap = {
      'google': true,
      'dropbox': true
    };
    return function(content) {
      return !!integrationMap[content.serverUrl];
    };
  });

  app.filter('isFileWriter', function(memberService) {
    return function(input) {
      var fileWriterId = input.writerId;
      var member = memberService.getMember();

      return fileWriterId == member.id;
    }
  });

  app.filter('getAvailableFiles', function() {
    return function (input) {
      var return_array = [];
      angular.forEach(input, function (file, index) {
        var fileStatus = file.status;

        if (fileStatus != 'archived'){
          this.push(file)
        }
      }, return_array);

      return return_array;
    }
  });

  app.filter('getyyyyMMddformat', function($filter) {
    return function(input) {
      var date = $filter('date')(input,'yyyy/MM/dd h:mm a');
      return date;
    }
  });

  app.filter('gethmmaFormat', function($filter) {
    return function(input) {
      var date = $filter('date')(input, 'h:mm a');
      return date;
    }
  });

  /**
   * file download에 필요한 data를 전달함
   */
  app.filter('downloadFile', function($filter) {
    return function(isIntegrateFile, title, url) {
      var downloadUrl;
      var originalUrl;

      url = $filter('getFileUrl')(url);

      // '/download/' 빠지면 정상 동작안함
      downloadUrl = url + '/download/';

      originalUrl = url;

      // integrate file이 아닌경우 원본보기시 file upload시 사용되었던 name을 유지함
      if (!isIntegrateFile) {
        originalUrl += '/' + encodeURIComponent(title);
      }

      return {
        downloadUrl: downloadUrl,
        originalUrl: originalUrl
      };
    };
  });
}());
