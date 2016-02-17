describe("resetValues", function() {

  beforeEach(function(){
    valueStore.years = [1,2,3];
  });

  it("it should clear valueStore.years", function() {
    resetValues();
    expect(valueStore.years).toEqual([]);
  });
});

describe("valueStore.customerLifetimeValue", function() {

  beforeEach(function() {
    valueStore.revenue = 30;
    valueStore.margin = .1;
    valueStore.churn = .1;
    valueStore.discount = .1;
    valueStore.costPerAcquisition = 843.3333333333334;
    valueStore.lead = 3;
    valueStore.hours = 5;
    valueStore.hourlyRate = 50;
    valueStore.numberOfLeads = 100;
    valueStore.closing = 0.3;
  })
})
