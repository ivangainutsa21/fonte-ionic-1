angular.module('starter', ['ionic',
'ionic.service.core', 
'ionic.service.analytics', 
'main.controllers', 
'page.controllers',
'starter.services',
'directives',
'filters',
'ngCordova', 
'pascalprecht.translate', 
'ngStorage', 
'ngSanitize',
'ngFitText', 
"com.2fdevs.videogular",
"com.2fdevs.videogular.plugins.controls",
"com.2fdevs.videogular.plugins.buffering",
"com.2fdevs.videogular.plugins.overlayplay",
"com.2fdevs.videogular.plugins.poster"
])

.run(function($ionicPlatform, $ionicAnalytics, $rootScope, $translate, downloadService, message, settingsFns, $interval, $http, $cordovaFileTransfer, $location, $window,$timeout) {
  $http.get('translation/en.json').success(function(response) {  
    $rootScope.settings.enJSON = response;
  });
  $ionicPlatform.ready(function() {
    setTimeout(function() {
      if(typeof navigator.splashscreen != 'undefined') {    
        navigator.splashscreen.hide();
      }
    }, 300);

    if (typeof analytics !== 'undefined'){
      window.ga.startTrackerWithId('UA-53163653-2');
      window.ga.trackView('App Started');
      
      console.log("analytics app called; start");
    } else {
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

      $window.ga('create', 'UA-53163653-3', 'auto');
      $rootScope.$on('$stateChangeSuccess', function (event) {
          $window.ga('send', 'pageview', $location.path());
      });
      console.log("Anayltics for websites started");
    }

    //Network connection indicator
    if (typeof analytics !== 'undefined'){
      window.ga.trackEvent("Connection", "Type", navigator.connection.type);
    }
    
    if (navigator.connection == undefined) {
      $rootScope.settings.connection = 1;
    } else if(navigator.connection.type == "NONE") {
      $rootScope.settings.connection = 0;
    } else {
      $rootScope.settings.connection = 1;
    }

   // Location Indicator ***
    function onSuccess(position) {
      console.log("Geolocation called: " + position.coords.latitude + ", " + position.coords.longitude);
      if (typeof analytics !== 'undefined'){
        window.ga.trackEvent("location", "coordinates", position.coords.latitude + ", " + position.coords.longitude);
      }
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
      console.log("geolocation error");
      if (typeof analytics !== 'undefined'){
        window.ga.trackEvent("error", "geolocation", error);
      }

    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
    downloadService.downloads.bible = $rootScope.settings.dBible;
    downloadService.downloads.teaching = $rootScope.settings.dTeaching;
    downloadService.downloads.resource = $rootScope.settings.dResource;
    console.log('Download List Original', JSON.stringify(downloadService.downloads));

    $ionicPlatform.isFullScreen = false;
    $rootScope.settings.runTimes += 1;
    console.log("runTimes: ", $rootScope.settings.runTimes);


    function events(action) {
        switch(action) {
          case 'music-controls-next':
            console.log('called play next >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            $rootScope.$emit("next", {});
            break;
          case 'music-controls-previous':
            console.log('called play previous >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            $rootScope.$emit("previous", {});
            break;

          case 'music-controls-play':
            $rootScope.$emit("playPause", {});
            break;

          case 'music-controls-pause':
            $rootScope.$emit("playPause", {});
            break;

          case 'music-controls-destroy':
            $rootScope.$emit("stop", {});
            break;

          default:
            break;
        }
    }

    //console.log('check backgroundMode status >>>>>>>>>>>>>>>>>>>>');
    //Only run if not on the web
    if(!$rootScope.settings.web) {

    }
    
    // Changing 

    // messaging.onMessage(function(notification) {    
    //   console.log("message received: ", notification);
    // });
    $rootScope.appVersion = "web";
    
    //This part ONLY calls on devices: IOS and Android
    document.addEventListener("deviceready", onDeviceReady, false);
      function onDeviceReady() {
        
        //console.log("Cordova file log: ", cordova.file);
        
        $rootScope.settings.android = ionic.Platform.isAndroid();
        $rootScope.settings.ios = ionic.Platform.isIOS();
        console.log("Device Android (onReady): ", $rootScope.settings.android);
        console.log("Device IOS (onReady): ", $rootScope.settings.ios);
        console.log(FileTransfer);
        // Video settings
        var url = "http://cdn.wall-pix.net/albums/art-space/00030109.jpg";
        var targetPath = cordova.file.documentsDirectory + "testImage.png";
        var trustHosts = true;
        window.open = cordova.InAppBrowser.open;
        var options = {};
        
        //For the music notification controls
        MusicControls.subscribe(events);
        // Start listening for events
        // The plugin will run the events function each time an event is fired
        MusicControls.listen();
        
        //For Firebase
        window.FirebasePlugin.getToken(function(token) {
            // save this server-side and use it to push notifications to this device
            message.console('token get successful');
            message.console(token);
            $rootScope.settings.token = token
            if(localStorage.device_token == undefined || localStorage.device_token == null) {
              localStorage.device_token = newPostKey;
            }
            var newPostKey = firebase.database().ref().child('device_tokens/').push().key;
            var key = localStorage.device_token || newPostKey;
            firebase.database().ref('device_tokens/'+key+'/').set({
                "token":token
            });
            message.subscribeToTopic("allUsers");
            message.subscribeToTopic("appLang" + $rootScope.settings.lang);

        }, function(error) {
            message.console('error while getting device token');
            message.error(error);
        });

        //On PUSH Notification reception
        window.FirebasePlugin.onNotificationOpen(function(notification) {
            message.console('opened notification');
            message.console(JSON.stringify(notification));
            
            //for preachings
            $rootScope.play = true;
            


            if (notification.tap) {
              //When app is in background and notification comes in, do this:            
              location.href = notification.url;
            } else {
              //When app is open and notification comes in, do this:
              //message.alert('TAB_BIBLE');
            }
        }, function(error) {
            message.console('error in opening notification');
            message.console(JSON.stringify(error));
        });

        cordova.getAppVersion(function(version) {
                $rootScope.appVersion = version;
                message.subscribeToTopic("version" + version);
            });

       } 

       if(!$rootScope.settings.android && !$rootScope.settings.ios) {
         $rootScope.settings.web = true;
       } else {
         $rootScope.settings.web = false;
       }



        //Language Setter. Runs only if on a Device with the plugin enabled, and if it's the first time to run
        setRLang = function(lang) {
          if($rootScope.settings.runTimes < 2) {
            switch(lang) {
              case 'pt':
                $rootScope.settings.rLanguage = $rootScope.settings.languages[0];
                break;
              case 'en':
                $rootScope.settings.rLanguage = $rootScope.settings.languages[1];
                break;
            }
          }
        }

        if(typeof navigator.globalization !== "undefined" && $rootScope.settings.runTimes < 2) {
          navigator.globalization.getPreferredLanguage(function(syslanguage) {
            console.log(syslanguage.value);
            $translate.use((syslanguage.value).split("-")[0]).then(function(data) {
                console.log("Language-choice SUCCESS through OS settings: " + data);
                $rootScope.settings.lang = (syslanguage.value).split("-")[0];
                $rootScope.lang = $rootScope.settings.lang;
                setRLang($rootScope.settings.lang);
              }, function(data) {
                console.log("Language-choice FAIL through OS settings" + data);
            });

          }, null);
        } else {
          $translate.use($rootScope.settings.lang);
          // console.log("default Language used");
          setRLang($rootScope.settings.lang);
        }


      });
})

.config(function ($sceDelegateProvider, $translateProvider) {

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://storage.googleapis.com/jonandc1-europe/**',
    'http://cloud.faithcomesbyhearing.com/**',
    'http://www.inspirationalfilms.com/audio/**',
    'http://dbt.io/**',
    'http://146.148.29.150/fonte/api/html/web/nt-book/api',
    'http://146.148.29.150/fonte/api/html/web/ot-book/api',
    'http://146.148.29.150/fonte/api/html/web/teaching/api',
    'http://api.fontedavida.org/**',
    'http://api.fontedavida.org:3000/**',
    'http://web.fontedavida.org/**',
    'https://5fish.mobi/**',
    'http://5fish.mobi/**'
  ]);
  // $translateProvider.useUrlLoader('translation/en.json');
  $translateProvider.useStaticFilesLoader({
    prefix: 'translation/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('pt');
  $translateProvider.fallbackLanguage('en');//if language fail to load from system!
  $translateProvider.useSanitizeValueStrategy('escape');
})
  

.config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(5);

  // Moving Android tabs to the bottom
  $ionicConfigProvider.tabs.position('bottom');
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  .state('info', {
    url: '/info',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  .state('info.about', {
    url: '/about',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-about.html'
      }
    }
  })
  .state('info.orglist', {
    url: '/orglist',
    views: {
      'tab-dash': {
        templateUrl: 'templates/info-orglist.html',
        controller: 'OrganizationCtrl'
      }
    }
  })
  .state('info.partner', {
    url: '/partner',
    views: {
      'tab-dash': {
        templateUrl: 'templates/info-partner.html',
        controller: 'FormCtrl as form'
      }
    }
  })
  .state('info.friend', {
    url: '/friend',
    views: {
      'tab-dash': {
        templateUrl: 'templates/info-friend.html'
      }
    }
  })
  .state('info.help', {
    url: '/help',
    views: {
      'tab-dash': {
        templateUrl: 'templates/info-help.html'
      }
    }
  })
  .state('info.privacy', {
    url: '/privacy',
    views: {
      'tab-dash': {
        templateUrl: 'templates/info-privacy.html'
      }
    }
  })
  .state('info.team', {
    url: '/team',
    views: {
      'tab-dash': {
        templateUrl: 'templates/info-team.html'
      }
    }
  })


  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html'
      }
    }
  })
  .state('tab.bible', {
      url: '/bible',
      views: {
        'tab-bible': {
          templateUrl: 'templates/tab-bible.html',
          controller: 'BibleCtrl'
        }
      }
    })
  .state('tab.bible-book', {
      url: '/bible/:bookId/:bookName/:bookCode',
      views: {
        'tab-bible': {
          templateUrl: 'templates/bible-book.html'
        }
      }
    })
  .state('tab.sermons', {
      url: '/sermons',
      views: {
        'tab-sermons': {
          templateUrl: 'templates/tab-sermons.html',
          controller: 'SermonsCtrl'
        }
      }
    })
  .state('tab.videos', {
    url: '/videos',
    views: {
      'tab-videos': {
        templateUrl: 'templates/tab-videos.html',
        controller: 'VideosCtrl'
      }
    }
  })
  .state('tab.sermons-detail', {
      url: '/sermons/teaching-:teachingId',
      views: {
        'tab-sermons': {
          templateUrl: 'templates/sermons-detail.html',
          controller: 'SDetailCtrl'
        }
      }
    })
  .state('tab.orgdetail', {
      url: '/teaching/org-:orgId',
      views: {
        'tab-sermons': {
          templateUrl: 'templates/sermons-orgdetail.html',
          controller: 'DetailPageCtrl'
        }
      }
    })
    .state('tab.speakerdetail', {
      url: '/teaching/speaker-:speakerId',
      views: {
        'tab-sermons': {
          templateUrl: 'templates/sermons-speakerdetail.html',
          controller: 'DetailPageCtrl'
        }
      }
    })
    .state('tab.rorgdetail', {
      url: '/resource/org-:orgId',
      views: {
        'tab-resources': {
          templateUrl: 'templates/sermons-orgdetail.html',
          controller: 'DetailPageCtrl'
        }
      }
    })
    .state('tab.rspeakerdetail', {
      url: '/resource/speaker-:speakerId',
      views: {
        'tab-resources': {
          templateUrl: 'templates/sermons-speakerdetail.html',
          controller: 'DetailPageCtrl'
        }
      }
    })
    .state('tab.resourcedetail', {
      url: '/resources/resource-:resourceId?open',
      views: {
        'tab-resources': {
          templateUrl: 'templates/resource-resourcedetail.html',
          controller: 'RDetailCtrl'
        }
      }
    })
  .state('tab.resources', {
    url: '/resources',
    views: {
      'tab-resources': {
        templateUrl: 'templates/tab-resources.html',
        controller: 'ResourceCtrl'
      }
    }
  })
  .state('tab.download', {
    url: '/download',
    cache: false,
    views: {
      'tab-download': {
        templateUrl: 'templates/tab-download.html',
        controller: 'DownloadCtrl'
      }
    }
  })
  .state('tab.about', {
    url: '/about',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-about.html'
      }
    }
  })
  .state('info.copyright', {
      url: '/copyright',
      views: {
        'tab-dash': {
          templateUrl: 'templates/about-copyright.html',
          controller: 'FormCtrl as form'
        }
      }
    })
  .state('tab.partnership', {
      url: '/about/partnership-form',
      views: {
        'tab-about': {
          templateUrl: 'templates/about-partnership.html',
          controller: 'FormCtrl as form'
        }
      }
    })
  .state('tab.info', {
    url: '/info',
    views: {
      'tab-info': {
        templateUrl: 'templates/tab-info.html'
      }
    }
  })
  .state('tab.orglist', {
      url: '/info/orglist',
      views: {
        'tab-dash': {
          templateUrl: 'templates/info-orglist.html',
          controller: 'OrganizationCtrl'
        }
      }
    })


  ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');
});
