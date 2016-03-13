var valueStore = {
  years : [],
  yearlyProfit : [],
  total_customer : 0,
  customerLifetimeValue : function() {
    return this.grossPerCustomer() * 1 - this.churn /
            (1 + this.discount - (1 - this.churn));
  },
  costPerAcquisition : function() {
    return ((this.lead + (this.hours * this.hourlyRate)) * this.numberOfLeads) /
      (this.closing * this.numberOfLeads);
  },
  ltvCacRatio : function() {
    return this.customerLifetimeValue() / this.costPerAcquisition();
  },
  netLifetimeValue : function() {
    return this.customerLifetimeValue() - this.costPerAcquisition();
  },
  numberCustomersAcquired : function() {
    return this.numberOfLeads * this.closing;
  },
  numberCustomersLost : function() {
    return this.churn * this.total_customer;
  },
  grossPerCustomer : function() {
    return this.revenue * this.margin;
  },
  profit : function(){
    return (this.grossPerCustomer() * this.total_customer)  - ((this.numberOfLeads * this.lead) + (this.numberOfLeads * (this.hours * this.hourlyRate)));
  }
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
                     " and " + "annual profit" + " of: $" + numberWithCommas(Round2Cent(valueStore.profit())));
  }
  //Functions to update on input change
  function updateValues() {
    resetValues();
    get_values();
    valueStore.customerLifetimeValue();
    valueStore.costPerAcquisition();
    valueStore.netLifetimeValue();
    endOfGrowth();
    discountedCashFlow();
    valueStore.profit();
    ShowValue("#clv", valueStore.customerLifetimeValue());
    ShowValue("#cpa", valueStore.costPerAcquisition());
    ShowValue("#nltv", valueStore.netLifetimeValue());
    showEndOfGrowth("#churn_exceed_acq", valueStore.currentYear);
    if(yearlyDiscountedCashFlow.length) ShowValue("#ltbv", (valueStore.terminalValue + valueStore.total));
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

    if (valueStore.myNewChart) valueStore.myNewChart.destroy();
    var ctx = $("#myChart").get(0).getContext("2d");
    valueStore.myNewChart = new Chart(ctx).Line( lineChartData, { scaleFontColor: "#CCFFFF", scaleLabel: "$" + "<%= numberWithCommas(value) %>" });

    result();
    return;
  }

  // updates values

  function get_values() {
    valueStore.revenue = parse_currency($("#form input[name='revenue']").val());
    valueStore.margin = parse_percent($("#form input[name='margin']").val());
    valueStore.churn = parse_percent($("#form input[name='churn']").val());
    valueStore.discount = parse_percent($("#form input[name='discount']").val());
    valueStore.lead = parse_currency($("#form input[name='lead']").val());
    valueStore.closing = parse_percent($("#form input[name='closing']").val());
    valueStore.hours = parse_currency($("#form input[name='hours']").val());
    valueStore.hourlyRate = parse_currency($("#form input[name='hourlyRate']").val());
    valueStore.numberOfLeads = parse_currency($("#form input[name='numberOfLeads']").val());

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
      yearlyDiscountedCashFlow.push(valueStore.yearlyProfit[yearOfProfit] / Math.pow((1 + valueStore.discount), yearOfProfit+1));
    }
    if (yearlyDiscountedCashFlow.length) {
      valueStore.total = yearlyDiscountedCashFlow.reduce(function(a, b) {return a + b;});
    }
    /*compute terminal value */
    valueStore.terminalValue = valueStore.yearlyProfit[valueStore.currentYear - 1] / valueStore.discount;
  }

  function endOfGrowth() {
    for (valueStore.currentYear = 0; Math.ceil(valueStore.numberCustomersLost()) < valueStore.numberCustomersAcquired(); valueStore.currentYear++) {
      valueStore.total_customer = valueStore.total_customer + valueStore.numberCustomersAcquired() - valueStore.numberCustomersLost();

        valueStore.yearlyProfit.push(
          ((valueStore.grossPerCustomer() * valueStore.total_customer) - ((valueStore.numberOfLeads * valueStore.lead) + (valueStore.numberOfLeads * (valueStore.hours * valueStore.hourlyRate)))).toFixed(2)
        );

        valueStore.years.push(valueStore.currentYear);
    }
  }

  function result() {
    if (valueStore.revenue > 0) {
      if (valueStore.ltvCacRatio() >= 3) {
        $("#result").html("Sweet Lifetime Value<br />You're doing something right!");
        $("#result_box").css("background-color", "green");
        return;
      } else if (valueStore.ltvCacRatio() <= 3 && valueStore.ltvCacRatio() >= 1) {
        $("#result").html("Cutting it close...<br />Your LTV should be at least 3X your CAC");
        $("#result_box").css("background-color", "#FF4500");
        return;
      } else if (valueStore.netLifetimeValue() < 0) {
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
