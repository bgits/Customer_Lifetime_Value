$(document).ready(function() {  
  $("#btext").hide();


  //Updates when new number is entered   
  $("#form input").keyup(function(event) {
    if (event.keyCode == 9) return; // 9 = tab
    fun_list()
    });

  //Functions to update on input change
  function fun_list() {
    get_values();
    clv();
    nltv();
    result();
    return;
  }
   
  // updates values
   
  function get_values() {
      revenue = parse_currency($("#form input[name='revenue']").val());
      margin = parse_currency($("#form input[name='margin']").val());
      churn = parse_currency($("#form input[name='churn']").val());
      discount = parse_currency($("#form input[name='discount']").val());
      lead = parse_currency($("#form input[name='lead']").val());
      closing = parse_currency($("#form input[name='closing']").val());
      hours = parse_currency($("#form input[name='hours']").val());
      hr = parse_currency($("#form input[name='hr']").val());

    };

    // Takes a string like "$123,456.789" and returns 123456.789 - from start-up death clock
  function parse_currency(str) {
      return parseFloat(str.replace(/\$|,/g, "")) || ""
  }

  function clv() {
    clval = ((revenue * margin) * (1 - churn) / (1 + discount - (1 - churn)));  
    if (clval.toString() != "NaN") {
          $("#clv").html("$" + clval);
    }else{
      $("#clv").html("error");
    };
    return
};

  function cpa() {
    clpa = (lead + (hours * hr) / closing);
    if (clpa.toString() != "NaN") {
          $("#cpa").html("$" + clpa);
    }else{
      $("#cpa").html("error");
    }
    return;
}
     
  function nltv() {
    nltval = clv - cpa;  
    if (nltval.toString() != "NaN") {
          $("#nltv").html("$" + nltval);
    }else{
      $("#nltv").html("error");
    };

    return;
  };

  function result() {
    if (revenue > 0) {
      if (nltval > 0){
        $("#result").html("Sweet Lifetime Value<br />You're doing something right!");
        $("#result_box").css("background-color", "green");
        return;
      }
      else if (nltval === 0){
        $("#result").html("Cutting it close...<br />Better boost your revenue");
        $("#result_box").css("background-color", "#FF4500");
        return;
      }
      else if (nltval < 0){
        $("#result").html("Please. Color has a better LTV!<br />Time to rethink the model?");
        $("#result_box").css("background-color", "Crimson");
        return;
      };
    };
    return;
  };

  $("#bslide").click(function () {
      $("#btext").slideToggle("slow", function() {});
  });

}); 
