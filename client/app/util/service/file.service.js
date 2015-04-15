(function() {
  'use strict';

  angular
      .module('jandiApp')
      .factory('fileService', fileService);

  /* @ngInject */
  function fileService($filter, fileAPIservice) {
    var rImage;

    rImage = /image/;

    return {
      init: function($files, options) {
        this.options = {
          hasAllFileAPI: !!(window.File && window.FileReader && window.FileList && window.Blob),  // page loading시 한번만 check 해야됨. 특정 네임스페이스에 값 관리 필요함.
          hasFileReader: !!window.FileReader, // page loading시 한번만 check 해야됨. 특정 네임스페이스에 값 관리 필요함.
          isMultiple: true,
          msgIsLarge: $filter('translate')('@file-size-too-large-error')
        };

        angular.extend(this.options, options);

        this.setFiles(this.files = $files);

        return this;
      },
      setFiles: function($files) {
        var that = this,
            options = that.options,
            files,
            file,
            fileReader,
            i, len;

        that.files = files = $files;  // 원본 $file object를 수정하므로 copy object 생성 필요함.
        for (i = 0, len = that.options.isMultiple ? files.length : 1; i < len; ++i) {
          file = files[i];

          // file size check
          if (fileAPIservice.isFileTooLarge(file)) {
              alert(options.msgIsLarge + '\r\n' + file.name);
              continue;
          }

          // image file check
          file.isImage = (options.hasFileReader && rImage.test(file.type));

          // if (options.hasFileReader && rImage.test(file.type)) {
          //   file.isImage = true;

          //   fileReader = new window.FileReader();
          //   fileReader.readAsDataURL(file);

          //   (function(fileReader, file) {
          //       fileReader.onload = function(e) {
          //           file.dataUrl = e.target.result;
          //       };
          //   }(fileReader, file));
          // } else {
          //   file.isImage = false;
          // }
        }

        return that;
      },
      getFiles: function(index) {
        var that = this;
        return (angular.isNumber(index) && (index%1 === 0)) ? that.files[index] : that.files;
      },
      size: function() {
        return this.files.length;
      },
      iterator: function() {    // 상위 개념 object와 prototype 연결 필요함
        var files,
            index,
            length;

        files = this.files;
        length = files.length;
        index = 0;
        return {
          currentIndex: function() {
            return index;
          },
          next: function() {
            return index < length ? files[index++] : undefined;
          }
        };
      }
    };
  }
}());