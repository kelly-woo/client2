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
   * @filter      : file type(extension) formatting
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

  /**
   * file을 표현하는 text를 get
   */
  app.filter('fileType', function($filter) {
    var fileTypeMap = {
      txt: ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      excel: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      ppt: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
    };
    var fileTypeTranMap = {
      txt: '@common-file-type-documents',
      excel: '@common-file-type-spreadsheets',
      ppt: '@common-file-type-presentations',
      'document': '@common-file-type-google-documents',
      'spreadsheet': '@common-file-type-google-spreadsheets',
      'presentation': '@common-file-type-google-presentations'
    };
    fileTypeMap = createMap(fileTypeMap);

    return function(file) {
      var fileTypeTran;
      return (fileTypeTran = fileTypeTranMap[fileTypeMap[file.mimeType] || file.ext]) ? $filter('translate')(fileTypeTran) : file.ext;
    };
  });

  /**
   *
   */
  app.filter('getFileIconImage', function() {
    var fileIconImageMap = {
          'img': ['image/jpeg', 'image/png', 'image/gif', 'image/vnd.adobe.photoshop'],
          'pdf': ['application/pdf'],
          'video': ['video/mp4', 'video/quicktime', 'video/x-matroska'],
          'audio': ['audio/mp3', 'audio/mpeg'],
          'zip': ['application/zip'],
          'hwp': ['application/x-hwp'],
          'TXT': ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          'EXCEL': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
          'PPT': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
        };
    fileIconImageMap = createMap(fileIconImageMap);

    return function(type) {
      return fileIconImageMap[type] || 'ETC';
    };
    // return function(type) {
    //   if (typeof type === 'undefined') return 'undefined';

    //   var filetype = "";

    //   switch(type) {
    //     // Image
    //     case 'image/jpeg' : filetype = "img"; break;
    //     case 'image/png'  : filetype = "img"; break;
    //     case 'image/gif'  : filetype = "img"; break;

    //     // PDF
    //     case 'application/pdf'  : filetype = "pdf"; break;

    //     // Video
    //     case 'video/mp4'                :
    //     case 'video/quicktime'          :
    //     //case 'application/octet-stream' :
    //     case 'video/x-matroska' : // mkv
    //       filetype = "video";
    //       break;

    //     // Audio
    //     case 'audio/mp3'  : filetype = "audio"; break;
    //     case 'audio/mpeg' : filetype = "audio"; break;

    //     // Zip
    //     case 'application/zip'  : filetype = "zip"; break;

    //     // Hanguel
    //     case 'application/x-hwp': filetype = "hwp"; break;

    //     // Text
    //     case 'text/plain'           :
    //     case 'application/msword'   :    // doc
    //     case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :    // docx
    //       filetype = "TXT";
    //       break;

    //     // Excel
    //     case 'application/vnd.ms-excel' :          // xls
    //     case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :          // xlsx
    //       filetype = "EXCEL";
    //       break;

    //     // Etc
    //     case 'application/vnd.ms-powerpoint' :      // ppt
    //     case 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :  // pptx
    //       filetype = 'PPT';
    //       break;

    //     default:
    //       filetype = "ETC";
    //       break;
    //   }
    //   return filetype;
    // };
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