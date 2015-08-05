function Background(){}

Background.prototype = {

  LOCAL_STORAGE_EXTENSION_KEY: 'lg-extension-key',

  initialize: function () {
    this.getSidebarTemplate($.proxy(function (template) {
      this.template = template;
      this.subscribeContentScript();
    }, this));
    console.log('Initialize background script')
  },

  getSidebarTemplate: function (callback) {
    $.get('content.html')
      .then(function (template) {
        console.log('Load sidebar template');
        callback(template);
      })
      .fail(function () {
        console.error('Failed to load template', arguments);
      });
  },

  subscribeContentScript: function () {

    chrome.extension.onMessage.addListener($.proxy(function (request, sender, callback) {

      if (request === 'getTemplate') {
        callback(this.template);
      }

      if (request === 'setLocalData') {
        console.log('setLocalData', arguments);
      }

      if (request === 'getLocalData') {
        console.log('getLocalData', arguments);
      }

    }, this));
    
  }
};


var background = new Background();
background.initialize();
