// Enable trace statements
DEBUG = true;

var Motivatr = {
  // All pages
  common: {
    init: function() {
      // Capitalise first letter of <title>
      var title = $('title').text();
      $('title').html(title.charAt(0).toUpperCase() + title.slice(1));
      $('input').checkAndTriggerAutoFillEvent();
    },
    finalize: function() { }
  },
  // Login page
  login: {
    init: function() {
      console.log('Login fired');
    }
  },
  // Home page
  home: {
    init: function() {
      console.log('Home fired');
    }
  },
  // Share page
  share: {
    init: function() {
      console.log('Share fired');
    }
  },
  // Profile page
  profile: {
    init: function() {
      console.log('Profile fired');
      $('.form-tabular .title').click(function() {
        $(this).toggleClass('active');
        $(this).next('.collapse-area').slideToggle();
      });
    }
  }
};

var UTIL = {
  fire: function(func, funcname, args) {
    var namespace = Motivatr;
    funcname = (funcname === undefined) ? 'init' : funcname;
    if (func !== '' && namespace[func] && typeof namespace[func][funcname] === 'function') {
      namespace[func][funcname](args);
    }
  },
  loadEvents: function() {

    UTIL.fire('common');

    $.each(document.body.className.replace(/-/g, '_').split(/\s+/),function(i,classnm) {
      UTIL.fire(classnm);
    });

    UTIL.fire('common', 'finalize');
  }
};

$(document).ready(UTIL.loadEvents);
