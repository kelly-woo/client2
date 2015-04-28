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



  /*
   * map 함수 특정 namespace에 포함되어 util로 사용 가능해야함..
   */
  function createMap(tempMap) {
    var map,
        value,
        e,
        i, len;

    map = {};
    for (e in tempMap) {
      value = tempMap[e];
      if (angular.isArray(value)) {
        for (i = 0, len = value.length; i < len; ++i) {
          map[value[i]] = e;
        }
      } else {
        map[value] = e;
      }
    }

    return map;
  }

  var integrationType = {
    'Google Doc': 'application/vnd.google-apps.document',
    'Google Spreadsheet': 'application/vnd.google-apps.spreadsheet',
    'Google Presentation': 'application/vnd.google-apps.presentation'
  };
  // filter에서 integration service인지 판단하는 map
  var integrationMap = {
    google: 'google-drive',
    dropbox: 'dropbox'
  };

  /**
   * file을 표현하는 text를 get
   */
  app.filter('filetype', function($filter) {
    var fileTypeMap = {
          JPG: 'image/jpeg',
          PNG: 'image/png',
          GIF: 'image/gif',
          PDF: 'application/pdf',
          MP4: 'video/mp4',
          MOV: ['video/quicktime', 'application/octet-stream'],
          MKV: 'video/x-matroska',
          MP3: 'audio/mp3',
          MPEG: 'audio/mpeg',
          ZIP: 'application/zip',
          HWP: 'application/x-hwp',
          TXT: ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          EXCEL: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
          PPT: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
        },
        fileTypeTranMap = {
          TXT: '@common-file-type-documents',
          EXCEL: '@common-file-type-spreadsheets',
          PPT: '@common-file-type-presentations',
          'Google Doc': '@common-file-type-google-documents',
          'Google Spreadsheet': '@common-file-type-google-spreadsheets',
          'Google Presentation': '@common-file-type-google-presentations'
        };
    angular.extend(fileTypeMap, integrationType);
    fileTypeMap = createMap(fileTypeMap);

    return function(type) {
      var str,
          tranStr,
          ret;

      if (str = fileTypeMap[type]) {
        ret = (tranStr = fileTypeTranMap[str]) ? $filter('translate')(tranStr) : str;
      } else {
        ret = $filter('translate')('@common-file-type-others');
      }

      return ret;
    };
  });

  /**
   * file을 표현하는 image의 name을 get
   * fileIcon filter에서 반환된 값이 image icon을 가리키는
   * class name을 만듬
   */
  app.filter('fileIcon', function() {
    var fileIconImageMap = {
          'img': ['image/jpeg', 'image/png', 'image/gif', 'image/vnd.adobe.photoshop'],
          'pdf': ['application/pdf'],
          'video': ['video/mp4', 'video/quicktime', 'video/x-matroska'],
          'audio': ['audio/mp3', 'audio/mpeg'],
          'zip': ['application/zip'],
          'hwp': ['application/x-hwp'],
          'txt': ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          'excel': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
          'ppt': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
          'document': 'application/vnd.google-apps.document',
          'spreadsheet': 'application/vnd.google-apps.spreadsheet',
          'presentation': 'application/vnd.google-apps.presentation'
        };
    fileIconImageMap = createMap(fileIconImageMap);

    return function(content) {
      var integration;
      return (fileIconImageMap[content.type] || 'etc') + ((integration = integrationMap[content.serverUrl]) ? '-' + integration : '');
    };
  });

  /**
   * file title을 filtering 함
   * integration file의 경우 확장자를 표시하지 않음
   */
  app.filter('fileTitle', function() {
    var nonExtMap = createMap(integrationType);

    return function(content) {
      var title = content.title || content.name;

      return integrationMap[content.serverUrl] && !nonExtMap[content.type] ? title.substring(0, title.lastIndexOf('.')) : title;
    };
  });

  /**
   * preview image를 지원하는지 여부
   */
  app.filter('hasPreview', function() {
    var rImage = /image/i;
    return function(content) {
      return !!content && !!content.extraInfo && rImage.test(content.filterType) && !integrationMap[content.serverUrl];
    };
  });

  app.filter('isFileWriter', function() {
    return function(input, member) {
      var fileWriterId = input.writerId;
      var memberId = member.id;

      return fileWriterId == memberId;
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
}());