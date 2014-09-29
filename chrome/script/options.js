var STORAGE_KEY = 'github-repos';

$(function() {
  var $repos = $('#repos');
  var $templates = $('#templates');
  var $reposTable = $('#repos table');
  var $templatesTable = $('#templates table');
  var $addRepo = $('#add_repo');
  var $saveRepo = $('#save_repo');
  var $addTemplate = $('#add_template');
  var $saveTemplate = $('#save_template');
  var $switchRepo = $('#switch_repo');
  var $switchTemplate = $('#switch_template');

  // Show/hide repo/template lists.
  $switchRepo.click(function() {
    $templates.hide();
    $repos.show();

    return false;
  });

  $switchTemplate.click(function() {
    $repos.hide();
    $templates.show();

    return false;
  });

  // Load defaults if nothing is yet set.
  chrome.storage.sync.get(STORAGE_KEY, function(items) {
    if ($.isEmptyObject(items)) {
      var template = '&nbsp; | Detail\n\
------------ | -------------\n\
Browser | [ Chrome / Firefox / Internet Explorer / Netscape Navigator ]\n\
OS | [ OSX / Windows / Linux ]\n\
User | \n\
URL | \n\
Screenshot | ![Screenshot]( [screenshot] )\n\
Notes | ';
      var defaults = {};

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
      };

      chrome.storage.sync.set(defaults);
    }
  });

  chrome.storage.sync.get(STORAGE_KEY, function(data) {
    var githubRepos = data[STORAGE_KEY].repos;
    var templates = data[STORAGE_KEY].templates;

    // Build tempate select list.
    var $templateDropdown = $('<select></select>');
    var usedTemplates = templatesInUse(githubRepos);

    for (var i = 0; i < templates.length; i++) {
      $templateDropdown.append('<option value="' + i + '">' + templates[i].name + '</option>');

      // Check to see if template is used, and allow it to be removed if not.
      var remove = usedTemplates.indexOf(i.toString()) == -1 ? true : false;

      // Add each template entry to the DOM.
      $templatesTable.append(newTemplate(templates[i].name, templates[i].template, remove));
    }

    // Add each repo entry to the DOM.
    for (var i = 0; i < githubRepos.length; i++) {
      $reposTable.append(newRepo($templateDropdown.clone(), githubRepos[i].name, githubRepos[i].repo));
    }

    // Add additional repo.
    $addRepo.click(function() {
      $reposTable.append(newRepo($templateDropdown.clone()));
    });

    // Add additional template.
    $addTemplate.click(function() {
      $templatesTable.append(newTemplate());
    });

    // Update list of repos into Chrome storage after clicking "Save Repositories".
    $saveRepo.click(function() {
      var save_repos = [];
      $('tr:not(:first)', $reposTable).each(function() {
        var name = $('.name', this).val();
        var repo = $('.repo', this).val();

        // Only save non-blank entries.
        if (name && repo) {
          save_repos.push({
            name: $('.name', this).val(),
            repo: $('.repo', this).val(),
            template: $('.template select', this).val()
          });
        }
      });
      data[STORAGE_KEY].repos = save_repos;
      chrome.storage.sync.set(data, function() {
        alert('Repositories saved');
        location.reload();
      });
    });

    // Update list of templates into local storage after clicking "Save Templates".
    $saveTemplate.click(function() {
      var save_templates = [];
      $('tr:not(:first)', $templatesTable).each(function() {
        save_templates.push({
          name: $('.name', this).val(),
          template: $('.template', this).val()
        });
      });
      data[STORAGE_KEY].templates = save_templates;
      chrome.storage.sync.set(data, function() {
        alert('Templates saved');
        location.reload();
      });
    });
  });
});

/**
 * Adds a new/existing repository row.
 *
 * @param {Object} $templateDropdown The template dropdown object
 * @param {String} name The name of the repository
 * @param {String} repo The Github repository path
 * @return {Object} The prepared repository row
 */
function newRepo($templateDropdown, name, repo) {
  var row = $('<tr><td><input class="name" name="name" type="text"></td><td><input class="repo" name="repo" type="text"></td><td class="template"></td><td><a class="remove" href="#">remove</a></tr>');
  $('.template', row).html($templateDropdown);
  if (typeof name !== undefined && typeof repo !== undefined) {
    $('.name', row).attr('value', name);
    $('.repo', row).attr('value', repo);
  }

  $('.remove', row).click(function() {
    row.remove();
  });

  return row;
}

/**
 * Adds a new/existing template row.
 *
 * @param {String} name The name of the template
 * @param {String} template The actual template
 * @param {Boolean} remove Whether or not to show remove option
 * @return {Object} The prepared template row
 */
function newTemplate(name, template, remove) {
  var row = $('<tr><td><input class="name" type="text"></td><td><textarea class="template"></textarea></td><td><a class="remove" style="display:none" href="#">remove</a></td></tr>');
  if (typeof name !== undefined && typeof template !== undefined) {
    $('.name', row).attr('value', name);
    $('.template', row).attr('value', template);

    if (remove) {
      $('.remove', row).show();
    }

  }

  $('.remove', row).click(function() {
    row.remove();
  });

  return row;
}

/**
 * Creates a list of in-use templates.
 *
 * @param {Array} repos An array of repo objects
 * @return {Array} An array of utilized template indexes
 */
function templatesInUse(repos) {
  var usedTemplates = [];

  for (var i = 0; i < repos.length; i++) {
    // Only add unique values.
    if (!usedTemplates.hasOwnProperty(repos[i].template)) {
      usedTemplates.push(repos[i].template);
    }
  }

  return usedTemplates;
}
