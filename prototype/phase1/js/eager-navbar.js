/**
 * Eager navbar (prototype)
 * Dépendences : jQuery
 */

function eagerNavbar($nav) {
  var h = $nav.outerHeight();
  var lastY = getY();
  // var $placeholderNav = $(".nav")
  var $placeholderNav = $nav
    .clone(false)
    .css({ visibility: "hidden" })
    .insertBefore($nav);

  $nav.css({ position: "fixed", top: "0px" });

  var states = {
    initial: function(amount, enter) {
      var navY = Math.max(-getY(), -h);
      $nav.css({ top: navY + "px" });
      if (navY === -h) transitionTo("hidden");
    },
    hidden: function(amount, enter) {
      if (amount < 0) transitionTo("moving");
    },
    moving: function(amount, enter) {
      if (enter === true) {
        navY = parseInt($nav.css("top"));
      }
      if (amount < 0) {
        navY = Math.min(navY - amount, 0);
        $nav.css({ top: navY + "px" });
        if (navY === 0) transitionTo("sticky");
      } else if (amount > 0) {
        navY = Math.max(navY - amount, -h);
        $nav.css({ top: navY + "px" });
        if (navY === -h) transitionTo("hidden");
      }
    },
    sticky: function(amount, enter) {
      if (amount > 0) transitionTo("moving");
    }
  };

  $(window).on("scroll", function(e) {
    var y = getY();
    fsm(y - lastY);
    lastY = y;
  });

  transitionTo("initial");

  /**
   * Dispatches some event-related info (here, amount of scrolling) to a state-dependent handler.
   * @param amount {integer} amount of scrolling
   */
  function fsm(amount) {
    states[state].call(this, amount, false);
  }

  function transitionTo(_state) {
    state = _state;
    states[state].call(this, 0, true);
  }

  function getY() {
    console.log(window.pageYOffset || document.documentElement.scrollTop);
    return window.pageYOffset || document.documentElement.scrollTop;
  }
}