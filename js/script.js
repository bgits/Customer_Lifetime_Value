function Round2Cent(v) {
  return Math.round(v*100)/100;
}

function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

$(document).ready(function () {
  $("#btext").hide();


  //Updates when new number is entered   
  $("#form input").keyup(function (event) {
    if (event.keyCode == 9) return; // 9 = tab
    fun_list()
  });

  function ShowValue (selector, v) {
    $(selector).html(isNaN(v) ? "Error" : "$" + numberWithCommas(Round2Cent(v))); 
  }

  function ShowValue2 (selector, v) {
    $(selector).html(isNaN(v) ? "Error" : v + " Years " + "with " + Math.round(total_customer) + " customers. " + "Annual revenue at that time will be: $" + numberWithCommas(Round2Cent(revenue * total_customer)) + " with gross margin of $" + numberWithCommas(Round2Cent((revenue * margin) * total_customer)) + " and " + "annual profit" + " of: $" + numberWithCommas(Round2Cent(profit))); 
  }
  //Functions to update on input change
  function fun_list() {
    get_values();
    window.clval = ((revenue * margin) * (1 - churn) / 
                    (1 + discount - (1 - churn)));
    window.clpa = ((lead + (hours * hr)) * leadr) / (closing * leadr);
    window.nltval = clval - clpa;
    window.leadcon = leadr * closing;
    cgr();
    dcf();
    window.profit = ((revenue * margin) * total_customer)  - ((leadr * lead) + (leadr * (hours * hr)));
    //	$("#clv")[0].scrollIntoView();
    //        clv();
    //        cpa();
    //        nltv();
    ShowValue("#clv", clval);
    ShowValue("#cpa", clpa);
    ShowValue("#nltv", nltval);
    ShowValue2("#car", year1);
    ShowValue("#ltbv", (termv + total));
    var lineChartData = {
      labels : years,
      datasets : [

	{
	  fillColor : "rgba(151,187,205,0.5)",
	  strokeColor : "rgba(151,187,205,1)",
	  pointColor : "rgba(151,187,205,1)",
	  pointStrokeColor : "#fff",
	  data : yearlyp
	}
      ]
      
    }

    var ctx = $("#myChart").get(0).getContext("2d");
    var myNewChart = new Chart(ctx);
    new Chart(ctx).Line( lineChartData, { scaleFontColor: "#CCFFFF", scaleLabel: "$" + "<%= numberWithCommas(value) %>" });

    result();
    return;
  }

  // updates values

  function get_values() {
    window.revenue = parse_currency($("#form input[name='revenue']").val());
    window.margin = parse_percent($("#form input[name='margin']").val());
    window.churn = parse_percent($("#form input[name='churn']").val());
    window.discount = parse_percent($("#form input[name='discount']").val());
    window.lead = parse_currency($("#form input[name='lead']").val());
    window.closing = parse_percent($("#form input[name='closing']").val());
    window.hours = parse_currency($("#form input[name='hours']").val());
    window.hr = parse_currency($("#form input[name='hr']").val());
    window.leadr = parse_currency($("#form input[name='leadr']").val());

  };

  // Takes a string like "$123,456.789" and returns 123456.789 - from start-up death clock
  function parse_currency(str) {
    return parseFloat(str.replace(/\$|,/g, "")) || "";
  }

  function parse_percent(str) {
    return parseFloat(str = (str / 100.0));
  }
  function clv() {
    if (!isNaN(clval)) {
      $("#clv").html("$" + (Round2Cent(clval)));
    } else {
      $("#clv").html("error");
    };
    return
  };

  function cpa() {
    if (!isNaN(clpa)) {
      $("#cpa").html("$" + Round2Cent(clpa));
    } else {
      $("#cpa").html("error");
    }
    return;
  }
  
  function dcf () {
    dcash = [];
    for (cfyear = 0; cfyear < yearlyp.length; cfyear++){
      dcash.push(yearlyp[cfyear] / Math.pow((1 + discount), cfyear+1));
    }
    window.total = dcash.reduce(function(a, b) {
      return a + b;
    });
    window.termv = yearlyp[year1 - 1] / discount /*compute terminal value */	
  }

  function cgr() {
    total_customer = 0;
    TCC = [];
    yearlyp = [];
    yearlyd = [];
    years = [];
    for (year1 = 0; Math.ceil(churn * total_customer) < (leadr * closing); year1++) {
      if ((churn * total_customer) >= (leadr * closing)) {
        final = year1;
      } else {
	total_customer = (total_customer + (leadr * closing)) - (churn * total_customer);
	yearlyp.push(
	  ((revenue * margin) * total_customer) - ((leadr * lead) + (leadr * (hours * hr))));
	yearlyd.push(
	  numberWithCommas(((revenue * margin) * total_customer) - ((leadr * lead) + (leadr * (hours * hr)))));
	years.push(year1);
	TCC.push(total_customer);
      }
    }
  }


  function nltv() {
    if (!isNaN(nltval)) {
      $("#nltv").html("$" + Round2Cent(nltval));
    } else {
      $("#nltv").html("error");
    };

    return;
  };

  function result() {
    if (revenue > 0) {
      if (clval / clpa >= 3) {
        $("#result").html("Sweet Lifetime Value<br />You're doing something right!");
        $("#result_box").css("background-color", "green");
        return;
      } else if (clval / clpa <= 3 && clval / clpa >= 1) {
        $("#result").html("Cutting it close...<br />Your LTV should be at least 3X your CAC");
        $("#result_box").css("background-color", "#FF4500");
        return;
      } else if (nltval < 0) {
        $("#result").html("Negitive LTV!<br />Time to rethink the model?");
        $("#result_box").css("background-color", "Crimson");
        return;nlt
      };
    };
    return;
  };

  $("#bslide").click(function () {
    $("#btext").slideToggle("slow", function () {});
  });

});
