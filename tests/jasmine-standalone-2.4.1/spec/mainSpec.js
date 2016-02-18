describe("resetValues", function() {

  beforeEach(function(){
    valueStore.years = [1,2,3];
  });

  it("Should clear valueStore.years", function() {
    resetValues();
    expect(valueStore.years).toEqual([]);
  });
});

describe("valueStore.customerLifetimeValue()", function() {

  beforeEach(function() {
    valueStore.revenue = 30;
    valueStore.margin = .1;
    valueStore.churn = .1;
    valueStore.discount = .1;
  });

  it("Should calculate the customer lifetime value", function() {
    expect(valueStore.customerLifetimeValue()).toEqual(13.499999999999996);
  });
});

describe("valueStore.costPerAcquisition()", function() {

  beforeEach(function() {
    valueStore.lead = 3;
    valueStore.hours = 5;
    valueStore.hourlyRate = 50;
    valueStore.numberOfLeads = 100;
    valueStore.closing = 0.3;
  });

  it("Should calculate the cost per acquisition", function() {
    expect(valueStore.costPerAcquisition()).toEqual(843.3333333333334);
  });
});

//TODO add tests discountedCashFlow()
//TODO add tests endOfGrowth()
