




$(function () {

  $(".remarque").on("blur", function () {



    // $(this).val(firstCap(stripEndDot($(this).val())));


    // var t = $(this).val();

    // console.log(_.trimEnd(t, "."));
    // console.log(_(t).trimEnd(".").value());




    // $(this).val(
    //   _($(this).val() + "")
    //   .deburr()
    //   // .trimEnd(".")
    //   // .upperFirst()
    //   .value()
    // );



  });



});





function firstCap (s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function stripEndDot (s) { return s.replace(/\.+$/gi, ""); }
