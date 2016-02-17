describe("resetValues", function() {

  beforeEach(function(){
    valueStore.years = [1,2,3];
  });

  it("it should clear valueStore.years", function() {
    resetValues();
    expect(valueStore.years).toEqual([]);
  });
});
