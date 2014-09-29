var STORAGE_KEY = 'github-repos';

$(function() {
  // Load defaults if nothing is yet set.
  chrome.storage.sync.get(STORAGE_KEY, function(items) {
    if ($.isEmptyObject(items)) {
      var defaults = {};
      var template = '&nbsp; | Detail\n\
------------ | -------------\n\
Browser | [ Chrome / Firefox / Internet Explorer / Netscape Navigator ]\n\
OS | [ OSX / Windows / Linux ]\n\
User | \n\
URL | \n\
Screenshot | ![Screenshot]( [screenshot] )\n\
Notes | ';

      defaults[STORAGE_KEY] = {
        repos: [
          {
            name: 'Report Webapp Issue',
            repo: 'AllPlayers/allplayers-mainline',
            template: 0
          },
          {
            name: 'Report Store Issue',
            repo: 'AllPlayers/apci-store',
            template: 0
          },
          {
            name: 'Report API Issue',
            repo: 'AllPlayers/allplayers-api',
            template: 0
          },
        ],
        templates: [
          {
            name: 'New Issue',
            template: template
          }
        ]
      }
    };
    chrome.storage.sync.set(defaults);
  });

  // Create a list of clickable repos, loaded from chrome storage (saved from
  // the options page)
  chrome.storage.sync.get(STORAGE_KEY, function(data) {
    var githubRepos = data[STORAGE_KEY].repos;

    for (var i = 0; i < githubRepos.length; i++) {
      href = 'https://github.com/' + githubRepos[i].repo + '/issues/new';
      $('#repos').append('<li>' +
        '<a href="' + href + '">' + githubRepos[i].name + '</a>' +
      '</li>');
    }

    // Catch click events on the repo links and communicate with the chrome tabs
    // in order to load the corresponding repo location
    $('#repos a').click(function(e) {
      e.preventDefault();
      var repoLocation = $(e.currentTarget).attr('href');

      // Attempt to fetch the instance of the currently-open tab
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Redirect the current tab if one is found, otherwise create a new one
        if (tabs.length) {
          chrome.tabs.update(tabs[0].id, {url: repoLocation});
        } else {
          chrome.tabs.create({url: repoLocation});
        }
      });
    });
  });
});
