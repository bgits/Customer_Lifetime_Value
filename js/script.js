var valueStore = {
  years : [],
  yearlyProfit : [],
  total_customer : 0
};

var resetValues = function() {
  valueStore.years = [];
  valueStore.yearlyProfit = [];
  valueStore.total_customer = 0;
};

function Round2Cent(v) {
  return Math.round(v*100)/100;
}

function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

$(document).ready(function () {
  $("#explanation_text").hide();


  //Updates when new number is entered
  $("#form input").keyup(function (event) {
    if (event.keyCode == 9) return; // 9 = tab
    updateValues();
  });

  function ShowValue (selector, v) {
    $(selector).html(isNaN(v) ? "Error" : "$" + numberWithCommas(Round2Cent(v)));
  }

  function showEndOfGrowth (selector, v) {
    $(selector).html(isNaN(v) ? "Error" : v + " Years " + "with " + Math.round(valueStore.total_customer) +
                     " customers. " + "Annual revenue at that time will be: $" +
                     numberWithCommas(Round2Cent(valueStore.revenue * valueStore.total_customer)) +
                     " with gross margin of $" +
                     numberWithCommas(Round2Cent((valueStore.revenue * valueStore.margin) * valueStore.total_customer)) +
                     " and " + "annual profit" + " of: $" + numberWithCommas(Round2Cent(profit)));
  }
  //Functions to update on input change
  function updateValues() {
    resetValues();
    get_values();
    window.customerLifetimeValue = ((valueStore.revenue * valueStore.margin) * (1 - churn) /
                    (1 + discount - (1 - churn)));
    window.costPerAcquisition = ((lead + (hours * hourlyRate)) * numberOfLeads) / (closing * numberOfLeads);
    window.netLifetimeValue = customerLifetimeValue - costPerAcquisition;
    window.leadcon = numberOfLeads * closing;
    endOfGrowth();
    discountedCashFlow();
    window.profit = ((valueStore.revenue * valueStore.margin) * valueStore.total_customer)  - ((numberOfLeads * lead) + (numberOfLeads * (hours * hourlyRate)));
    ShowValue("#clv", customerLifetimeValue);
    ShowValue("#cpa", costPerAcquisition);
    ShowValue("#nltv", netLifetimeValue);
    showEndOfGrowth("#churn_exceed_acq", valueStore.currentYear);
    if(yearlyDiscountedCashFlow.length) ShowValue("#ltbv", (valueStore.terminalValue + total));
    var lineChartData = {
      labels : valueStore.years,
      datasets : [

        {
          fillColor : "rgba(151,187,205,0.5)",
          strokeColor : "rgba(151,187,205,1)",
          pointColor : "rgba(151,187,205,1)",
          pointStrokeColor : "#fff",
          data : valueStore.yearlyProfit
        }
      ]

    };

    var ctx = $("#myChart").get(0).getContext("2d");
    var myNewChart = new Chart(ctx);
    new Chart(ctx).Line( lineChartData, { scaleFontColor: "#CCFFFF", scaleLabel: "$" + "<%= numberWithCommas(value) %>" });

    result();
    return;
  }

  // updates values

  function get_values() {
    valueStore.revenue = parse_currency($("#form input[name='revenue']").val());
    valueStore.margin = parse_percent($("#form input[name='margin']").val());
    window.churn = parse_percent($("#form input[name='churn']").val());
    window.discount = parse_percent($("#form input[name='discount']").val());
    window.lead = parse_currency($("#form input[name='lead']").val());
    window.closing = parse_percent($("#form input[name='closing']").val());
    window.hours = parse_currency($("#form input[name='hours']").val());
    window.hourlyRate = parse_currency($("#form input[name='hourlyRate']").val());
    window.numberOfLeads = parse_currency($("#form input[name='numberOfLeads']").val());

  };

  // Takes a string like "$123,456.789" and returns 123456.789 - from start-up death clock
  function parse_currency(str) {
    return parseFloat(str.replace(/\$|,/g, "")) || "";
  }

  function parse_percent(str) {
    return parseFloat(str = (str / 100.0));
  }

  function discountedCashFlow () {
    yearlyDiscountedCashFlow = [];
    for (yearOfProfit = 0; yearOfProfit < valueStore.yearlyProfit.length; yearOfProfit++){
      yearlyDiscountedCashFlow.push(valueStore.yearlyProfit[yearOfProfit] / Math.pow((1 + discount), yearOfProfit+1));
    }
    if (yearlyDiscountedCashFlow.length) {
      window.total = yearlyDiscountedCashFlow.reduce(function(a, b) {return a + b;});
    }
    /*compute terminal value */
    valueStore.terminalValue = valueStore.yearlyProfit[valueStore.currentYear - 1] / discount;
  }

  function endOfGrowth() {
    // TODO  Need to consider manhours
    for (valueStore.currentYear = 0; Math.ceil(churn * valueStore.total_customer) < (numberOfLeads * closing); valueStore.currentYear++) {
        valueStore.total_customer = (valueStore.total_customer + (numberOfLeads * closing)) - (churn * valueStore.total_customer);

        valueStore.yearlyProfit.push(
          ((valueStore.revenue * valueStore.margin) * valueStore.total_customer) - ((numberOfLeads * lead) + (numberOfLeads * (hours * hourlyRate)))
        );

        valueStore.years.push(valueStore.currentYear);
    }
  }

  function result() {
    if (valueStore.revenue > 0) {
      if (customerLifetimeValue / costPerAcquisition >= 3) {
        $("#result").html("Sweet Lifetime Value<br />You're doing something right!");
        $("#result_box").css("background-color", "green");
        return;
      } else if (customerLifetimeValue / costPerAcquisition <= 3 && customerLifetimeValue / costPerAcquisition >= 1) {
        $("#result").html("Cutting it close...<br />Your LTV should be at least 3X your CAC");
        $("#result_box").css("background-color", "#FF4500");
        return;
      } else if (netLifetimeValue < 0) {
        $("#result").html("Negitive LTV!<br />Time to rethink the model?");
        $("#result_box").css("background-color", "Crimson");
        return;
      };
    };
    return;
  };

  $("#bslide").click(function () {
    $("#explanation_text").slideToggle("slow", function () {});
  });

});
