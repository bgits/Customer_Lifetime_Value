describe("resetValues", function() {

  beforeEach(function(){
    valueStore.years = [1,2,3];
  });

  it("it should clear valueStore.years", function() {
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
    valueStore.costPerAcquisition = 843.3333333333334;
  });

  it("it should calculate the customer lifetime value", function() {
    expect(valueStore.customerLifetimeValue()).toEqual(13.499999999999996);
  });
});
