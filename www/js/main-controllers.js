angular.module('main.controllers', ['pascalprecht.translate', 'jett.ionic.filter.bar'])

.controller('MainCtrl', ['$scope', '$rootScope', '$localStorage', '$ionicTabsDelegate', 'ApiServe', 'settingsFns', '$interval', 'message', 
  function ($scope, $rootScope, $localStorage, $ionicTabsDelegate, ApiServe, settingsFns, $interval, message) {
  //On call, move one tab to the right
  $scope.goForward = function () {
        message.console("goForward called");
        var selected = $ionicTabsDelegate.selectedIndex();
        if (selected != -1) {
            $ionicTabsDelegate.select(selected + 1);
        }
    }

    //On call, move one tab to the left
    $scope.goBack = function () {
        message.console("goBack called");
        var selected = $ionicTabsDelegate.selectedIndex();
        if (selected != -1 && selected != 0) {
            $ionicTabsDelegate.select(selected - 1);
        }
    }

    //On call, go to start
    $scope.goToStart = function () {
        message.console("gotoStart called");
        var selected = $ionicTabsDelegate.selectedIndex();
        if (selected != -1 && selected != 0) {
            $ionicTabsDelegate.select(0);
        }
    }

    function getAPI(url, variables) {
      //Note: variables optional
      ApiServe.getAPIS(url, variables).then(function(response) {
      
      //   video
        switch(url) {
          case 'organization':
            for(var i=0; i < response.data.length; i++) {
              if($rootScope.settings.orgList[i] == undefined) {
                $rootScope.settings.orgList[i] = response.data[i];
                $rootScope.settings.orgList[i].checked = true;
              }
            }
            break;

          case 'teacher':
            $rootScope.settings.speakerList = response.data;
            break;

          case 'language':
            $rootScope.settings.languages = response.data;
            break;

          case 'teaching':
            $rootScope.settings.teachings = response.data;
            break;

          case 'country':
            $rootScope.settings.country = response.data;
            break;

          case 'video':
            //$rootScope.settings.videos = response.data;
            break;
        }
      });
    }



    $rootScope.settings = $localStorage.$default({
      dbtKey: 'd634c26f06be1dae73edfb08d7290f52',
      rootURL: 'http://cloud.faithcomesbyhearing.com/mp3audiobibles2/',
      aapNum: 0,
      country: "",
      lang: 'pt',
      testament: "IDNT",
      rLanguage: {},
      rLanguageid: 0,
      languages: [],
      runTimes: 0,
      teachings: [],
      videos: [],
      orgList: [],
      speakerList: [],
      licenses: [],
      web: true,
      subscriptions: [],
      timerTeacher: Date.now(),
      timerTeaching: Date.now(),
      timerCountry: Date.now(),
      timerOrg: Date.now(),
      timerResource: Date.now(),
      timerLanguage: Date.now(),
      networkError: 0,
      dBible: [],
      dTeaching: [],
      dResource: []
    }); 
    
    // $rootScope.$watch("settings.rLanguage", function() {
    //   message.console("main-controller 118 rLanguage: ", JSON.stringify($rootScope.settings.rLanguage));
    // });
    getAPI('teacher');
    getAPI('teaching', 'rlang=' + $rootScope.settings.rLanguageid);
    //getAPI('video', 'rlang=' + $rootScope.settings.rLanguageid + '&applang=' + $rootScope.settings.lang);

    //Clear any downloads in progress
    $rootScope.inProgress = 0;
    $rootScope.downloadsCompleted = 0;

    message.console("aapNum: ", $rootScope.settings.aapNum);
    function apiTime() {
      message.console("apiTime called");
      if(!$rootScope.settings.speakerList.length || (Date.now() > ($rootScope.settings.timerTeacher + 3600000/12))) {
          getAPI('teacher');
          $rootScope.settings.timerTeacher = Date.now();
          message.console("teachers will call again at: ", ($rootScope.settings.timerTeacher + 3600000/12));
        } else {
          message.console("teachers already loaded");
        };

      if(Date.now() > ($rootScope.settings.timerCountry + 3600000/12)) {
          getAPI('country');
          $rootScope.settings.timerCountry = Date.now();
          message.console("timerCountry will call again at: ", ($rootScope.settings.timerTeacher + 3600000/12));
        } else {
          message.console("countries recent - not reloading");
        };

      //Call for first time use from local drive
      if(!$rootScope.settings.languages.length) {
        var v = 'languages';
        ApiServe.getLocal(v).then(function(response) {
          $rootScope.settings.languages = response.data;

          $rootScope.settings.timerOrg = Date.now();
        });
      }

      //Call from API for API list
      message.console("Timer, date.now: ", $rootScope.settings.timerLanguage, Date.now());
      if(!$rootScope.settings.languages.length < 2 || (Date.now() > ($rootScope.settings.timerLanguage + 86400000/24))) {
        getAPI('language', 'v=2');
        $rootScope.settings.timerTeacher = Date.now();
          message.console("Languages will call again at: ", ($rootScope.settings.timerLanguage + 86400000/24));
      } else {
        message.console("languages already loaded");
      };

      // if(!$rootScope.settings.languages.length || (Date.now() > ($rootScope.settings.timerOrg + 86400000*7))) {
      //   var v = 'languages';
      //   ApiServe.getLocal(v).then(function(response) {
      //     $rootScope.settings.languages = response.data;
      //     $rootScope.settings.timerOrg = Date.now();
      //   });
      //     message.console("Languages will call again at: ", ($rootScope.settings.timerOrg + 86400000*7));
      //   } else {
      //     message.console("languages already loaded");
      //   };

      if(!$rootScope.settings.licenses.length) {
        var v = 'licenses';
        ApiServe.getLocal(v).then(function(lResponse) {
          $rootScope.settings.licenses = lResponse.data;
        });
          message.console("Licenses called");
        } else {
          message.console("Licenses already loaded");
        };

      if(!$rootScope.settings.orgList.length || (Date.now() > ($rootScope.settings.timerOrg + 86400000/12))) {
          getAPI('organization');
          $rootScope.settings.timerOrg = Date.now();
          message.console("organizations will call again at: ",($rootScope.settings.timerOrg + 86400000/12));
        } else {
          message.console("organizations already loaded, will call again at: ", $rootScope.settings.timerOrg + 86400000/12, Date.now());
        };

      if(!$rootScope.settings.teachings.length || (Date.now() > ($rootScope.settings.timerTeaching + 86400000/48))) {
          getAPI('teaching', 'rlang=' + $rootScope.settings.rLanguageid);
          $rootScope.settings.timerTeaching = Date.now();
          message.console("teachings will call again at: ", ($rootScope.settings.timerTeaching + 86400000/48));
        } else {
          message.console("teachings already loaded");
        };

    }
    apiTime(); //call on load

    $rootScope.$on("callAllAPIs", function() {
      getAPI('language', 'v=2');
      getAPI('teacher');
      getAPI('organization');
      getAPI('country');
      getAPI('teaching', 'rlang=' + $rootScope.settings.rLanguageid);
      getAPI('resource', 'rlang=' + $rootScope.settings.rLanguageid);
    });

    //Set rLanguage:

    $interval(function() {
      apiTime(); 
    }, 60000*60, 20);

}])

.controller('tabCtrl', ['$scope', '$rootScope', 'message', 
  function($scope, $rootScope, message) {
  //$scope.showVideo = $rootScope.settings.videos.length;
  tabHide = function(toWatch, tab) {
    $scope.$watch(toWatch, function(){
    if(toWatch.length > 0) {
      $("." + tab).show();
      message.console(tab + ".show called");
    } else {
      $("." + tab).hide();
      message.console(tab + ".hide called");
    };
    });
  }

  tabHide('$rootScope.settings.videos', 'video-tab');

  tabHide('$rootScope.settings.resourceList', 'resource-tab');


}])

.controller('filterCtrl', ['$ionicFilterBar', function($ionicFilterBar) {
  //Filter control NOT FUNCTIONING copied from website
  function ItemController($ionicFilterBar) {  
    var vm = this,
        items = [],
        filterBarInstance;

    for (var i = 1; i <= 1000; i++) {
        var itemDate = moment().add(i, 'days');

        var item = {
            description: 'Description for item ' + i,
            date: itemDate.toDate()
        };
        items.push(item);
    }

    vm.items = items;

    vm.showFilterBar = function () {
      filterBarInstance = $ionicFilterBar.show({
        items: vm.items,
        update: function (filteredItems) {
          vm.items = filteredItems;
        },
        filterProperties: 'description'
      });
    };

    return vm;
}
}])

.controller('headerCtrl', ['$rootScope', '$scope', 'message', function($rootScope, $scope, message) {
  if($rootScope.settings.web) {
    $rootScope.settings.connection = 1;
  }
  $scope.networkButton = $rootScope.settings.connection;
    // if ($rootScope.settings.connection = "none") {
    //   message.console("connection lost");
    //   $scope.networkButton = 1;
    //   //$(".network-button").addClass('ion-android-alert').removeClass('ion-android-wifi');
    // }   
    
    document.addEventListener("offline", onOffline, false);
    document.addEventListener("online", onOnline, false);


    function onOffline() {
        // Handle the offline event
        $scope.networkButton = 0;
        message.console("offline called");
        message.alert('CHECK_NETWORK');
        //$rootScope.$emit("offline", {});
    }
    function onOnline() {
        // Handle the online event
        $scope.networkButton = 1;
        message.console("online called");
        $rootScope.$emit("callAllAPIs", {});
    }
    $scope.networkAlert = function() {
      message.alert('CHECK_NETWORK');

    }


    message.console("$rootScope.settings.web: ", $rootScope.settings.web);
}])

.controller('DlCtrl', [ '$ionicPlatform', '$cordovaFile', 'message', function($ionicPlatform, $cordovaFile, message) {
  
  this.resourceDl = function(resource){
    message.console("resourceDl called", resource.resource_url);
    var directory = 'downloads';
    var filename = 'download.pdf';
    var url = resource.resource_url;

    $ionicPlatform.ready(function() {})
    .then(function() {
      message.console("createDir called");
      return $cordovaFile.createDir(directory, false);
    })
    .then(function() {
      message.console("createFile called");
      return $cordovaFile.createFile(directory + '/' + filename, false);
    })
    .then(function(newFile) {
      message.console("newFile: ", newFile.nativeURL);
      return $cordovaFile.downloadFile(url, newFile.nativeURL);
    })
    .then(function(result) {
      // Success!
      message.console("success:", result);
    }, function(err) {
      // Error
      message.console("error: ", err, null, 2);
    }, function (progress) {
      // constant progress updates
      message.console('Downloading: '+(progress.loaded/progress.total).toFixed()+'%');
    });
  }
}])
.controller('ListCtrl', ['$scope', 'message', function($scope, message) {
   message.console("ListCtrl Called");
   $scope.shouldShowDelete = false;
   $scope.shouldShowReorder = false;
   
   $scope.data = {
    showDelete: false
   }
   $scope.toggle = function(i) {
      //i = !i;
      message.console("toggle called", i);
      //return i;
    };
   $scope.moveItem = function(item, fromIndex, toIndex) {
      $scope.downloads.bible.splice(fromIndex, 1);
      $scope.downloads.bible.splice(toIndex, 0, item);
    };
  
    $scope.onItemDelete = function(item) {
      $scope.downloads.bible.splice($scope.downloads.bible.indexOf(item), 1);
    };
    $scope.items = [];
    for(var i=0; i<25; i++) {
      $scope.items[i] = "item " + i;
    }
    message.console("Items: ", $scope.items);
}])
.controller('DlAccordionCtrl', ['$rootScope', '$scope', '$window', 'message',  function($rootScope, $scope, $window, message) {
  //Controller for each individual accordion set
  
  $scope.onItemDelete = function(item, type) {
    message.console("Item Deleted", item);
    //Delete from drive
    var n = item.fileUrlLocalPath.lastIndexOf('/');
    var fileName = item.fileUrlLocalPath.slice(n+1 , item.fileUrlLocalPath.length);
    var path = item.fileUrlLocalPath.slice(0, -1*(item.fileUrlLocalPath.length - n));
    message.console("n, filename and path: ", n, fileName, path);

    window.resolveLocalFileSystemURL(path, function(dir) {
      dir.getFile(fileName, {create:false}, function(fileEntry) {
                  fileEntry.remove(function(){
                    message.console("File removed successfully");
                  // The file has been removed succesfully
              },function(error){
                  // Error deleting the file
                  message.error("Deleting file", error);
              },function(){
                message.console("File does not exist");
                 // The file doesn't exist
              });
        });
      });
    
    switch(type) {
          case "bible":
            $scope.downloads.bible.splice($scope.downloads.bible.indexOf(item), 1);
            break;
          case "teaching":
            $scope.downloads.teaching.splice($scope.downloads.teaching.indexOf(item), 1);
            break;
          case "resource":
            $scope.downloads.resource.splice($scope.downloads.resource.indexOf(item), 1);
            break;
    }      
    
  };


}])

.controller('DownloadCtrl', ['$window', '$rootScope', '$scope', '$filter', '$cordovaFileOpener2', 'downloadService', '$ionicLoading', '$localStorage', '$cordovaFile', '$sce', 'playlistService', '$http', 'message',
  function($window, $rootScope, $scope, $filter, $cordovaFileOpener2, downloadService, $ionicLoading, $localStorage, $cordovaFile, $sce, playlistService, $http, message){
  //$scope.organizationList = settings.orgList;
  message.gaView("Download");
  //message.console("Download List: ", downloadService.downloads);
  //Make list of teachings that are going to be downloaded.
  //This list comes from the downloadService factory
  var self = this;
  $scope.downloads = downloadService.downloads;
  $scope.queue = $rootScope.inProgress - 1;

  $scope.showDelete = false;
  
  $scope.$watch("showDelete", function() {
    message.console("showDelete: ", $scope.showDelete);
  });
  $scope.deleteButton = function() {
    message.console("delete button clicked");
    $(".jon-list").toggleClass("j-padding");
    $scope.showDelete = !$scope.showDelete;
  }

    // localStorage.setItem("BIBLE", JSON.stringify($scope.downloads.bible));
    // localStorage.setItem("TEACHING", JSON.stringify($scope.downloads.teaching));  
    // localStorage.setItem("RESOURCE", JSON.stringify($scope.downloads.resource));

    $scope.$on("DOWNLOAD_CHANGE", function() {
      message.console("Download Change caught");
      $scope.$apply();
    });


  function detectmob() { 
   if( navigator.userAgent.match(/Android/i)
   || navigator.userAgent.match(/webOS/i)
   || navigator.userAgent.match(/iPhone/i)
   || navigator.userAgent.match(/iPad/i)
   || navigator.userAgent.match(/iPod/i)
   || navigator.userAgent.match(/BlackBerry/i)
   || navigator.userAgent.match(/Windows Phone/i)
   ){
      return true;
    }
   else {
      return false;
    }
  }

$scope.resourceOpen = function(resourceurl, id) {
  message.console("resourceOpen called from DownloadCtrl", resourceurl, id);

  $http.get('http://api.fontedavida.org/resource/hit?id=' + id).success(function(data) {
    message.console("resource hit added, ID = ", id);
  }).error(function(error) {
    message.error("Unable to count hit", error);
  });

  $cordovaFileOpener2.open(resourceurl, 'application/*')
                  .then(function() {
                    // message.console('success');
                  }, function(err) {
                    // message.console('An error occurred: ', err);
                  });
}
$scope.abort = function() {
  message.console("Abort function called");
  $rootScope.$broadcast('ABORT_DOWNLOAD'); 
}
$scope.downloadThis = function(title, url, type, folder, extension) {
    message.console("downloadThis called: ", title, url, type, folder, extension);
    var fileTransfer = new FileTransfer();
    var uri = encodeURI(url);

    fileTransfer.download(
      url,
      01 + extension,
      function(entry) {
          message.console("download complete: " + entry.toURL());
      },
      function(error) { 
        message.error("Download", error);
      },
      false,
      {
          headers: {
              "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
          }
      }
    );
  }

  //$scope.downloads = downloadService.downloads;
  $scope.playNow = function(data){
    message.console("playNow data: ", data);
    if((data != null || data != undefined) && !angular.isUndefined(data.book_id)) {
      message.console("identified as Bible");
      var title, subtitle;
      var playList = {
        title: data.book_id,
        subtitle: data.title,
        image: "images/speakers/bible.png",
        sources: [
          { src: data.fileUrlLocalPath, type: "audio/mpeg" },
        ]
      };
    
      playlistService.setAudioPlayList([playList]);
      $rootScope.$broadcast('AUDIO_SOURCE_DATA'); 

    } else {
      message.console("identified as Teaching");
      var title, subtitle;

      var playList = {
        title: data.title,
        subtitle: data.organization,
        image: data.photo,
        sources: [
          { src: data.fileUrlLocalPath, type: "audio/mpeg" },
        ]
      };
    
      playlistService.setAudioPlayList([playList]);
      $rootScope.$broadcast('AUDIO_SOURCE_DATA');  
    }
  };//fonteFns.playNow;
}])

.controller('SettingsCtrl', ['$scope', '$ionicScrollDelegate', '$rootScope', '$http', '$translate', 'settingsFns', '$filter', 'message', 
  function($scope, $ionicScrollDelegate, $rootScope, $http, $translate, settingsFns, $filter, message) {
  message.gaView("Settings");
 //$scope.appVersion = appVersion;
  
  next = function(number) {
    message.console("Next function called");
    $(".splash").animate({
      'background-position-x': number * 20 + 40 + "%"
    }, 400, 'linear');
    $("#fp-div").animate({
      'left': number * -2000 + "px"
    }, 400, 'linear');
    $ionicScrollDelegate.scrollTop(true);
    $("#fp-2").fadeOut(800);
  }

  if($rootScope.settings.country != "") {
    $("#fp-div").css("left", "-4000px");
  }

  $scope.rLatest = [];
  // message.console("lang: ", lang);
  
  $scope.next = next; //make function next() accessible from the front page

  //message.console("SettingsCtrl settings information: ", $rootScope.settings);
  $scope.changedCountry = function() {
    $rootScope.$broadcast('countryChange');
  }

  $scope.changeLanguage = function(newLang) {
    message.unsubscribeFromTopic("appLang" + $translate.use());
    $translate.use(newLang);
    message.subscribeToTopic("appLang" + newLang);
    
    $rootScope.settings.lang = newLang;
    $scope.lang = newLang;
    // message.console("Language changed - $scope.lang = ", $scope.lang);
  };

  $scope.runVideo = function(){
    $rootScope.$broadcast('VIDEO_SOURCE_DATA');
  };

  // $rootScope.$watch("settings.rLanguageid", function() {
  //   message.console("rLanguageid changed. Changing rLanguage.");
  //   $rootScope.settings.rLanguage = $filter('filter')($rootScope.settings.languages, {id: $rootScope.settings.rLanguageid})[0];
  //   message.console("rLanguage variable: ", $rootScope.settings.rLanguage);
  // })

  //This function will track the page the user travels to from the setting side menu
  $scope.settings_analytics = function(page) {
    message.console("settings_analytics active: ", page);
    message.gaView(page);
  };
}])

.controller('PlayerCtrl', ["$sce", "$rootScope", "$scope", "$timeout", "playlistService", 'message', 
  function ($sce, $rootScope, $scope, $timeout, playlistService, message) {
      var controller = this;

      controller.config = { 
        playerType: undefined,
        open: false,       
        preload: "none",
        autoPlay: true,
        sources: [],
        theme: {
          url: "lib/videogular-themes-default/videogular.css"
        },
        plugins: {
            poster: "http://www.videogular.com/assets/images/videogular.png"
        },
        waitTime: 150
      };

      controller.state = null;
      controller.API = null;
      controller.currentSource = 0;

      controller.onPlayerReady = function(API) {
        message.console("Player ready");
        controller.API = API;
        enableVol();
      };

      controller.onCompleteSource = function() {
          controller.isCompleted = true;
          controller.currentSource++;
          if (controller.currentSource >= controller.sourceData.length) controller.currentSource = 0;
          controller.setSource(controller.currentSource);
      };
        
      controller.setSource = function(index) {
          controller.API.stop();
          controller.currentSource = index;
          controller.config.sources = controller.sourceData[index].sources;
          $timeout(controller.API.play.bind(controller.API), 100);
      };

      controller.checkState = function(){
        if(controller.API == null)
          return 'angular-player-play'
        else if(controller.API.currentState === 'play')
          return 'angular-player-pause'
        else
          return 'angular-player-play'
      };

      controller.playPause = function(){
        if(controller.API.currentState === 'play') {
          setTimeout(function() {
            controller.stopSource();
             MusicControls.updateIsPlaying(false);
          }, controller.config.waitTime);
        }
        else {
          setTimeout(function() {
            controller.playSource();
            MusicControls.updateIsPlaying(true);
          }, controller.config.waitTime);
        }
      };

      $rootScope.$on("playPause", function(){
          controller.playPause();
      });

      controller.stopSource = function(){
        message.console("play stopped");
        disableVol();
        setTimeout(function() {
            controller.API.pause();
          }, controller.config.waitTime);
        enableVol();
      };

      $rootScope.$on("stop", function(){
          controller.stopSource();
      });      

      controller.playSource = function(){
        message.console("play begun with playlist: ", playlistService.getAudioPlayList());
        message.gaEvent("Audio", "Play", JSON.stringify(playlistService.getAudioPlayList()));
        enableVol();
        $timeout(function() {
            controller.API.play();
            message.console("play begun with API");
            
          }, controller.config.waitTime);
      };



      controller.nextSource = function() {
        if (controller.currentSource < controller.sourceData.length-1){
          enableVol();
          controller.API.stop();
          controller.currentSource += 1;
          controller.config.sources = controller.sourceData[controller.currentSource].sources;
          $timeout(controller.API.play.bind(controller.API), 100);
          var title =  controller.sourceData[controller.currentSource].title;
          var subtitle =  controller.sourceData[controller.currentSource].subtitle;
          var image = controller.sourceData[controller.currentSource].image;
          //message.console(playlistService.audioPlayList);
          createMusicControls(title,subtitle,image);
        }
      };

      $rootScope.$on("next", function(){
           controller.nextSource();
      });

      controller.prevSource = function() {
        if (controller.currentSource > 0){
          enableVol();
          controller.API.stop();
          controller.currentSource -= 1;
          controller.config.sources = controller.sourceData[controller.currentSource].sources;
          $timeout(controller.API.play.bind(controller.API), 100);
          var title =  controller.sourceData[controller.currentSource].title;
          var subtitle =  controller.sourceData[controller.currentSource].subtitle;
          var image = controller.sourceData[controller.currentSource].image;
          //message.console(playlistService.audioPlayList);
          createMusicControls(title,subtitle,image);
        }
      };

      $rootScope.$on("previous", function(){
           controller.prevSource();
      });


      controller.closePlayer = function(){
        disableVol();
        controller.API.stop();
        controller.config.open = false;
        playlistService.setAudioPlayList([]);
        enableVol(); 
        if (MusicControls != undefined) {
          MusicControls.destroy();     
        }
      };

      function enableVol(){
        $timeout(controller.API.setVolume(1), 1000);
        //controller.API.setVolume(1);
      };
      
      function disableVol(){
        controller.API.setVolume(0);
      };

      $scope.$on('AUDIO_SOURCE_DATA', function() {
        message.console("broadcast of AUDIO_SOURCE_DATA caught");
        controller.config.playerType = 'audio';
        controller.currentSource = playlistService.getClicked();
        controller.sourceData = playlistService.getAudioPlayList();
        message.console("broadcast of AUDIO_SOURCE_DATA caught, sourceData, currentSource: ", controller.sourceData, controller.currentSource);
        controller.config.sources = controller.sourceData[controller.currentSource].sources;

        message.console("controller.config.sources: ", controller.config.sources);

        // message.console(controller.sourceData);
        enableVol();
        var title =  controller.sourceData[controller.currentSource].title;
        var subtitle =  controller.sourceData[controller.currentSource].subtitle;
        var image = controller.sourceData[controller.currentSource].image;
        //message.console(playlistService.audioPlayList);
        createMusicControls(title,subtitle,image);
        controller.config.open = true;
        
      });

      function createMusicControls(title,subtitle,image){
        //MusicControls.destroy();
        MusicControls.create({
            track       : title ,    // optional, default : ''
              artist      : subtitle,           // optional, default : ''
              cover       : image,    // optional, default : nothing
            // cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
            //       or a remote url ('http://...', 'https://...', 'ftp://...')
            isPlaying   : true,             // optional, default : true
            dismissable : true,             // optional, default : false

            // hide previous/next/close buttons:
            hasPrev   : true,    // show previous button, optional, default: true
            hasNext   : true,    // show next button, optional, default: true,
            ticker    : 'Now playing "'+title+'"'
        }, onSuccess, onError);
      }
      
      function onSuccess(res){
        controller.playSource();
        //message.console('onSuccess');
        //message.console(res);
      }

      function onError(err){
        message.error('Error on Play', err);
      }

      $scope.$on('VIDEO_SOURCE_DATA', function(data_source) {
        controller.config.playerType = 'video';
        controller.sourceData = playlistService.getVideoPlayList();
        message.console("Video opened - sourceData: ", controller.sourceData);
        controller.config.sources = [
                   {src: $sce.trustAsResourceUrl(controller.sourceData), type: "video/mp4"}
                   //{src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"), type: "video/webm"},
                   //{src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"), type: "video/ogg"}
                ];
        message.console("controller.config.sources: ", controller.config.sources);
        enableVol();
        controller.config.open = true;
      });

      // $scope.$on('VIDEO_SOURCE_DATA', function(data_source) {
      //   controller.config.playerType = 'video';
      //   message.console("Video opened - data_source: ", data_source);
      //   controller.config.sources = [
      //               {src: $sce.trustAsResourceUrl("http://files.globalrecordings.net/audio/s82297/mp4/Shona%20Chindau%20Good%20News%20S82297.mp4"), type: "video/mp4"},
      //               {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"), type: "video/webm"},
      //               {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"), type: "video/ogg"}
      //           ];
        
      //   enableVol();
      //   controller.config.open = true;
      // });
  }]);
