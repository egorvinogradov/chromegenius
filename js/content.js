function ChromeGenius(){}

ChromeGenius.prototype = {

  initialize: function(){

    if (this.isLinkedinProfile()) {

      console.log('Initialize ChromeGenius');
      $('html').addClass('cg-panel-enabled');

      this.getSidebarTemplate($.proxy(function(template){

        this.template = template;
        this.renderSidebar(this.template);
        this.getProjects($.proxy(function(projects){

          this.projects = projects;
          this.renderProjects(this.projects);

          this.currentProject = this.getCurrentProject(this.projects);
          $('.cg-project-select').val(this.currentProject.slug);

          this.getLeadFields(this.currentProject.slug, $.proxy(function(leadFields){
            this.leadFields = leadFields;
            this.linkedinProfile = this.parseLinkedinProfile();
            this.renderLeadFields(this.leadFields, this.linkedinProfile);
          }, this));

        }, this));

        $('body')
          .delegate('.cg-save', 'click', $.proxy(this.submitForm, this))
          .delegate('.cg-project-select', 'change', $.proxy(function(){
            localStorage.setItem('chromegenius-current-project', $('.cg-project-select').val());
            this.currentProject = this.getCurrentProject(this.projects);
            this.getLeadFields(this.currentProject.slug, $.proxy(function(leadFields){
              this.leadFields = leadFields;
              this.renderLeadFields(this.leadFields, this.linkedinProfile);
            }, this));
          }, this));

      }, this));
    }
  },
  isLinkedinProfile: function(){
    // TODO: replace with real code
    return true;
  },
  getSidebarTemplate: function(callback){
    chrome.extension.sendMessage('getTemplate', function(data){
      callback(data)
    });
  },
  renderSidebar: function(template){
    $('body').append(template);
  },
  renderProjects: function(projects){
    var html = _.map(projects, function(project){
      return '<option value="' + project.slug + '">' + project.name + '</option>';
    }).join('\n');
    $('.cg-project-select').html(html);
  },
  renderLeadFields: function(leadFields, linkedinProfile){
    var html = _.map(leadFields, function(leadField){
      var value = linkedinProfile[leadField.key] || 'N/A';
      return '<div class="cg-block"><h4 class="cg-caption">' + leadField.name + '</h4><input class="cg-field" value="' + value + '" name="' + leadField.key + '"></div>';
    }).join('\n');
    $('.cg-lead-fields').html(html);
  },
  getProjects: function(callback) {
    // TODO: replace with real API
    callback([
      {
        slug: 'project-2015-02-10-2607151050-3705',
        name: 'Taft New Project'
      },
      {
        slug: 'project-2014-12-14-2416875429-1084',
        name: 'GTS - Glass Industry'
      }
    ]);
  },
  getCurrentProject: function(projects){
    var currentProjectSlug = localStorage.getItem('chromegenius-current-project');
    var currentProject;
    if (currentProjectSlug) {
      currentProject = _.find(projects, function(project){
        return project.slug = currentProjectSlug;
      });
    }
    return currentProject || projects[0];
  },
  getLeadFields: function(projectSlug, callback){
    // TODO: replace with real API

    var leadFields1 = [{
      name: 'First Name',
      key: 'first_name'
    }, {
      name: 'Last Name',
      key: 'last_name'
    }, {
      name: 'Job Title',
      key: 'job_title'
    }, {
      name: 'Company',
      key: 'org_name'
    }, {
      name: 'Email',
      key: 'email'
    }];

    var leadFields2 = [{
      name: 'First Name',
      key: 'first_name'
    }, {
      name: 'Last Name',
      key: 'last_name'
    }, {
      name: 'Linkedin URL',
      key: 'linkedin_url'
    }, {
      name: 'Company',
      key: 'org_name'
    }, {
      name: 'Website',
      key: 'website'
    }];

    callback(projectSlug === 'project-2015-02-10-2607151050-3705' ? leadFields1 : leadFields2);
  },
  parseLinkedinProfile: function(){

    var data = {};

    data.job_title = $('[id=headline].editable-item').find('p.title').text();
    data.full_name = $('.full-name').text();
    data.first_name = data.full_name.split(/\s+/)[0];
    data.last_name = data.full_name.split(/\s+/)[1];
    data.email = $('#email-view li').find('a').text();
    data.linkedin_url = $(".view-public-profile").first().text();
    data.org_name = $('[id^=experience].section-item').first().find('.new-miniprofile-container a').text();

    // TODO:
    // Person:
    // data.website

    // Org:
    // data.org_website

    return data
  },
  submitForm: function(){

    // TODO: replace with real code
    // TODO: add allow access-control-allow-origin

    var data = {};

    _.each($('.cg-field'), function(el){
      var element = $(el);
      var key = element.attr('name');
      data[key] = element.val();
    });


    $.ajax({
      url: 'http://localhost:8000/worker/account/',
      success: $.proxy(function (data) {

        var token = data.split('csrfmiddlewaretoken')[1].split('\' />')[0].split('value=\'')[1];

        console.log('---', token, this.currentProject);

        $.ajax({
          url: 'http://localhost:8000/api/projects/' + this.currentProject.slug + '/leads/',
          method: 'POST',
          headers: {
            'X-CSRF-Token': token
          },
          data: JSON.stringify({
            lead: {
              data: data
            }
          }),
          success: function(data){
            console.log('>>> FUCK', data)
          }
        });

        console.log('submitForm');

      }, this)
    });

    console.log('777', data);

  }
};

var chromeGenius = new ChromeGenius();
chromeGenius.initialize();
