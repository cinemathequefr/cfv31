$(function() {
  eagerNavbar($(".menu-wrapper"));
  var elOn = $("#menu-evenements").addClass("on");
  $(".menu-top, .menu-bottom").on("click", "a", function(e) {
    $(elOn).removeClass("on");
    elOn = e.target;
    $(elOn).addClass("on");
  });
});