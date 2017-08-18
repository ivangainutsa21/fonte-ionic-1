angular.module('filters', [])

//Filter list by organization listed in settings
.filter("orgFilter", ['$rootScope', 'message', function($rootScope, message) {
  message.console("orgFilter Run");
  return function(items) {
    var filtered = [];
    orgs = $rootScope.settings.orgList;
    angular.forEach(orgs, function(org){
      if(org.checked) {
        angular.forEach(items, function(item) {
        if(org.id == item.organization_id) {
            filtered.push(item);
            //message.gaView("Organization", "Checked", item.organization_id);
          };
        });
      };
    });
    if(typeof analytics !== "undefined"){
      window.ga.trackView("Organization", "Filter list", filtered);
    }
    return filtered;
  }
  var filterTest = [];
  message.console("Filter results: ", filtered);

}])

//Filter by chosen language:
.filter("rLangFilter", ['$rootScope', 'message', function($rootScope, message) {
  rLanguage = $rootScope.settings.rLanguage;
  return function(items, settings) {
    if (settings.rLanguage == undefined) {
      settings.rLanguage = $rootScope.settings.languages[0];
      message.console("rLanguage undefined: set to:", settings.rLanguage);
    }
    var filtered = [];
      angular.forEach(items, function(item) {
        //message.console("org.id: ", org.id);
        //message.console("item.Organization", item);lang_main: 2,
        if((settings.rLanguage.id == item.primary_language_id) || (settings.rLanguage.id == item.secondary_language_id)) {
            filtered.push(item);
          };
        });
    return filtered;
  }

}])

.filter("ashtml", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  }
}])//