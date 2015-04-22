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
          PPT: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
          'Google Doc': '',
          'Google Spreadsheet': 'application/vnd.google-apps.spreadsheet',
          'Google Presentation': ''
        },
        fileTypeTranMap = {
          TXT: '@common-file-type-documents',
          EXCEL: '@common-file-type-spreadsheets',
          PPT: '@common-file-type-presentations'
        };
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
    // return function(type) {
    //   if (typeof type === 'undefined') return 'undefined';

    //   var filetype = "";

    //   switch(type) {
    //     case 'image/jpeg'       :   filetype = "JPG"; break;

    //     case 'image/png'        :   filetype = "PNG"; break;

    //     case 'image/gif'        :   filetype = "GIF"; break;

    //     case 'application/pdf'  :   filetype = "PDF"; break;

    //     case 'video/mp4'        :   filetype = "MP4"; break;

    //     case 'video/quicktime'          :   filetype = "MOV"; break;
    //     case 'application/octet-stream' :   filetype = "MOV"; break;

    //     case 'video/x-matroska' : filetype = "MKV"; break; // mkv

    //     case 'audio/mp3'        :   filetype = "MP3"; break;

    //     case 'audio/mpeg'       :   filetype = "MPEG"; break;

    //     case 'application/zip'  :   filetype = "ZIP"; break;

    //     case 'application/x-hwp': filetype = "HWP"; break;

    //     case 'text/plain'           :
    //     case 'application/msword'   :    // doc
    //     case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :    // docx
    //       filetype = $filter('translate')('@common-file-type-documents'); break;

    //     case 'application/vnd.ms-excel' :          // xls
    //     case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :          // xlsx
    //       filetype = $filter('translate')('@common-file-type-spreadsheets'); break;

    //     case 'application/vnd.ms-powerpoint' :      // ppt
    //     case 'application/vnd.openxmlformats-officedocument.presentationml.presentation' :  // pptx
    //       filetype = $filter('translate')('@common-file-type-presentations'); break;

    //     default                 :
    //       // ETC
    //       filetype = $filter('translate')('@common-file-type-others'); break;
    //   }
    //   return filetype;
    // };
  });

  /**
   *
   */
  app.filter('getFileIconImage', function() {
    var fileIconImageMap = {
          'img': ['image/jpeg', 'image/png', 'image/gif'],
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