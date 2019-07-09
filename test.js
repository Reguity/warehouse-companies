const {
  createShareLedgerEventsParams
} = require('./createShareLedgerEventsParams');

test('One owner 1000 shares', () => {

  let result = createShareLedgerEventsParams({
    companyId: "42",
    sharetypeId: 55,
    startCapital: 50000,
    endCapital: 50000,
    startQuantity: 1000,
    firstShareownerId: "1",
    firstDate: '2018-01-01T00:00:00.000Z',
    endDate: '2018-01-02T00:00:00.000Z',
    shareownerAndQuantityTuples: [{
      shareownerId: "2",
      quantity: 1000
    }],
    firstRefusal: true
  });

  expect(result).toEqual([{
    companyId: "42",
    type: 'Setup',
    shareCapitalChange: 50000,
    date: '2018-01-01T00:00:00.000Z',
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 1000,
      shareownerId: "1",
      sharetypeId: 55,
      buyDate: '2018-01-01T00:00:00.000Z'
    }]
  }, {
    companyId: "42",
    type: 'Transaction',
    date: '2018-01-02T00:00:00.000Z',
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 1000,
      shareownerId: "2"
    }]
  }, {
    companyId: "42",
    type: 'Reservationupdate',
    date: '2018-01-02T00:00:00.000Z',
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 1000,
      firstRefusal: true
    }]
  }]);

});

test('Two owners 1000 shares', () => {

  let result = createShareLedgerEventsParams({
    companyId: "42",
    sharetypeId: 55,
    startCapital: 50000,
    endCapital: 50000,
    startQuantity: 1000,
    firstShareownerId: "1",
    firstDate: '2018-01-01T00:00:00.000Z',
    endDate: '2018-01-02T00:00:00.000Z',
    shareownerAndQuantityTuples: [{
      shareownerId: "2",
      quantity: 500
    }, {
      shareownerId: "3",
      quantity: 500
    }],
    firstRefusal: true
  });

  expect(result).toEqual([{
    companyId: "42",
    type: 'Setup',
    shareCapitalChange: 50000,
    date: '2018-01-01T00:00:00.000Z',
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 1000,
      shareownerId: "1",
      sharetypeId: 55,
      buyDate: '2018-01-01T00:00:00.000Z'
    }]
  }, {
    companyId: "42",
    type: 'Transaction',
    date: '2018-01-02T00:00:00.000Z',
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 500,
      shareownerId: "2"
    }, {
      startNr: 501,
      stopNr: 1000,
      shareownerId: "1"
    }, ]
  }, {
    companyId: "42",
    type: 'Transaction',
    date: '2018-01-02T00:00:00.000Z',
    shareholdingChanges: [{
      startNr: 501,
      stopNr: 1000,
      shareownerId: "3"
    }]
  }, {
    companyId: "42",
    type: 'Reservationupdate',
    date: '2018-01-02T00:00:00.000Z',
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 500,
      firstRefusal: true
    }, {
      startNr: 501,
      stopNr: 1000,
      firstRefusal: true
    }, ]
  }]);
});

test('Two owners. Initially 1000 shares => 600 vs 700', () => {

  let result = createShareLedgerEventsParams({
    companyId: "42",
    sharetypeId: 55,
    startCapital: 50000,
    endCapital: 50000,
    startQuantity: 1000,
    firstShareownerId: "1",
    firstDate: '2018-01-01T00:00:00.000Z',
    endDate: '2018-01-02T00:00:00.000Z',
    shareownerAndQuantityTuples: [{
      shareownerId: "2",
      quantity: 600
    }, {
      shareownerId: "3",
      quantity: 700
    }],
    firstRefusal: true
  });

  expect(result).toEqual([{
    companyId: "42",
    type: "Setup",
    date: "2018-01-01T00:00:00.000Z",
    shareCapitalChange: 50000,
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 1000,
      buyDate: "2018-01-01T00:00:00.000Z",
      shareownerId: "1",
      sharetypeId: 55
    }]
  }, {
    companyId: "42",
    type: "Transaction",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 462,
      shareownerId: "2"
    }, {
      startNr: 463,
      stopNr: 1000,
      shareownerId: "1"
    }]
  }, {
    companyId: "42",
    type: "Transaction",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 463,
      stopNr: 1000,
      shareownerId: "3"
    }]
  }, {
    companyId: "42",
    type: "Split",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1001,
      stopNr: 1138,
      shareownerId: "2",
      sharetypeId: 55
    }, {
      startNr: 1139,
      stopNr: 1300,
      shareownerId: "3",
      sharetypeId: 55
    }]
  }, {
    companyId: "42",
    type: "Reservationupdate",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 462,
      firstRefusal: true
    }, {
      startNr: 463,
      stopNr: 1000,
      firstRefusal: true
    }, {
      startNr: 1001,
      stopNr: 1138,
      firstRefusal: true
    }, {
      startNr: 1139,
      stopNr: 1300,
      firstRefusal: true
    }]
  }]);
});

test('Three owners. 1000 shares initially. 334 each.', () => {
  let result = createShareLedgerEventsParams({
    companyId: "42",
    sharetypeId: 55,
    startCapital: 50000,
    endCapital: 50150,
    startQuantity: 1000,
    firstShareownerId: "1",
    firstDate: '2018-01-01T00:00:00.000Z',
    endDate: '2018-01-02T00:00:00.000Z',
    shareownerAndQuantityTuples: [{
      shareownerId: 2,
      quantity: 334
    }, {
      shareownerId: 3,
      quantity: 334
    }, {
      shareownerId: 4,
      quantity: 334
    }],
    firstRefusal: true
  });
  expect(result).toEqual([{
    companyId: "42",
    type: "Setup",
    date: "2018-01-01T00:00:00.000Z",
    shareCapitalChange: 50000,
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 1000,
      buyDate: "2018-01-01T00:00:00.000Z",
      shareownerId: "1",
      sharetypeId: 55
    }]
  }, {
    companyId: "42",
    type: "Transaction",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 333,
      shareownerId: "2"
    }, {
      startNr: 334,
      stopNr: 1000,
      shareownerId: "1"
    }]
  }, {
    companyId: "42",
    type: "Transaction",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 334,
      stopNr: 666,
      shareownerId: "3"
    }, {
      startNr: 667,
      stopNr: 1000,
      shareownerId: "1"
    }]
  }, {
    companyId: "42",
    type: "Transaction",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 667,
      stopNr: 1000,
      shareownerId: "4"
    }]
  }, {
    companyId: "42",
    type: "Newshareissue",
    shareCapitalChange: 150,
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1001,
      stopNr: 1001,
      shareownerId: "2",
      sharetypeId: 55
    }, {
      startNr: 1002,
      stopNr: 1002,
      shareownerId: "3",
      sharetypeId: 55
    }, {
      startNr: 1003,
      stopNr: 1003,
      shareownerId: "4",
      sharetypeId: 55
    }]
  }, {
    companyId: "42",
    type: "Reservationupdate",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 333,
      firstRefusal: true
    }, {
      startNr: 334,
      stopNr: 666,
      firstRefusal: true
    }, {
      startNr: 667,
      stopNr: 1000,
      firstRefusal: true
    }, {
      startNr: 1001,
      stopNr: 1001,
      firstRefusal: true
    }, {
      startNr: 1002,
      stopNr: 1002,
      firstRefusal: true
    }, {
      startNr: 1003,
      stopNr: 1003,
      firstRefusal: true
    }]
  }]);
});

test('Two owners. New issuing of 1000 shares equally.', () => {
  let result = createShareLedgerEventsParams({
    companyId: "42",
    sharetypeId: 55,
    startCapital: 50000,
    endCapital: 100000,
    startQuantity: 1000,
    firstShareownerId: "1",
    firstDate: '2018-01-01T00:00:00.000Z',
    endDate: '2018-01-02T00:00:00.000Z',
    shareownerAndQuantityTuples: [{
      shareownerId: "2",
      quantity: 1000
    }, {
      shareownerId: "3",
      quantity: 1000
    }],
    firstRefusal: true
  });
  expect(result).toEqual([{
    companyId: "42",
    type: "Setup",
    date: "2018-01-01T00:00:00.000Z",
    shareCapitalChange: 50000,
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 1000,
      buyDate: "2018-01-01T00:00:00.000Z",
      shareownerId: "1",
      sharetypeId: 55
    }]
  }, {
    companyId: "42",
    type: "Transaction",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 500,
      shareownerId: "2"
    }, {
      startNr: 501,
      stopNr: 1000,
      shareownerId: "1"
    }]
  }, {
    companyId: "42",
    type: "Transaction",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 501,
      stopNr: 1000,
      shareownerId: "3"
    }]
  }, {
    companyId: "42",
    type: "Newshareissue",
    shareCapitalChange: 50000,
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1001,
      stopNr: 1500,
      shareownerId: "2",
      sharetypeId: 55
    }, {
      startNr: 1501,
      stopNr: 2000,
      shareownerId: "3",
      sharetypeId: 55
    }]
  }, {
    companyId: "42",
    type: "Reservationupdate",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 500,
      firstRefusal: true
    }, {
      startNr: 501,
      stopNr: 1000,
      firstRefusal: true
    }, {
      startNr: 1001,
      stopNr: 1500,
      firstRefusal: true
    }, {
      startNr: 1501,
      stopNr: 2000,
      firstRefusal: true
    }]
  }]);
});

test('Two owners. New issuing of 1300 with different proportions.', () => {
  let result = createShareLedgerEventsParams({
    companyId: "42",
    sharetypeId: 55,
    startCapital: 50000,
    endCapital: 100000,
    startQuantity: 1000,
    firstShareownerId: "1",
    firstDate: '2018-01-01T00:00:00.000Z',
    endDate: '2018-01-02T00:00:00.000Z',
    shareownerAndQuantityTuples: [{
      shareownerId: "2",
      quantity: 1200
    }, {
      shareownerId: "3",
      quantity: 1100
    }],
    firstRefusal: true
  });
  expect(result).toEqual([{
    companyId: "42",
    type: "Setup",
    date: "2018-01-01T00:00:00.000Z",
    shareCapitalChange: 50000,
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 1000,
      buyDate: "2018-01-01T00:00:00.000Z",
      shareownerId: "1",
      sharetypeId: 55
    }]
  }, {
    companyId: "42",
    type: "Transaction",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 522,
      shareownerId: "2"
    }, {
      startNr: 523,
      stopNr: 1000,
      shareownerId: "1"
    }]
  }, {
    companyId: "42",
    type: "Transaction",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 523,
      stopNr: 1000,
      shareownerId: "3"
    }]
  }, {
    companyId: "42",
    type: "Newshareissue",
    shareCapitalChange: 50000,
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1001,
      stopNr: 1522,
      shareownerId: "2",
      sharetypeId: 55
    }, {
      startNr: 1523,
      stopNr: 2000,
      shareownerId: "3",
      sharetypeId: 55
    }]
  }, {
    companyId: "42",
    type: "Split",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 2001,
      stopNr: 2157,
      shareownerId: "2",
      sharetypeId: 55
    }, {
      startNr: 2158,
      stopNr: 2300,
      shareownerId: "3",
      sharetypeId: 55
    }]
  }, {
    companyId: "42",
    type: "Reservationupdate",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 522,
      firstRefusal: true
    }, {
      startNr: 523,
      stopNr: 1000,
      firstRefusal: true
    }, {
      startNr: 1001,
      stopNr: 1522,
      firstRefusal: true
    }, {
      startNr: 1523,
      stopNr: 2000,
      firstRefusal: true
    }, {
      startNr: 2001,
      stopNr: 2157,
      firstRefusal: true
    }, {
      startNr: 2158,
      stopNr: 2300,
      firstRefusal: true
    }]
  }]);
});

test('Reverse split with different proportions.', () => {
  let result = createShareLedgerEventsParams({
    companyId: "42",
    sharetypeId: 55,
    startCapital: 50000,
    endCapital: 50000,
    startQuantity: 1000,
    firstShareownerId: "1",
    firstDate: '2018-01-01T00:00:00.000Z',
    endDate: '2018-01-02T00:00:00.000Z',
    shareownerAndQuantityTuples: [{
      shareownerId: "2",
      quantity: 250
    }, {
      shareownerId: "3",
      quantity: 100
    }],
    firstRefusal: true
  });;
  expect(result).toEqual([{
    companyId: "42",
    type: "Setup",
    date: "2018-01-01T00:00:00.000Z",
    shareCapitalChange: 50000,
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 1000,
      buyDate: "2018-01-01T00:00:00.000Z",
      shareownerId: "1",
      sharetypeId: 55
    }]
  }, {
    companyId: "42",
    type: "Transaction",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 714,
      shareownerId: "2"
    }, {
      startNr: 715,
      stopNr: 1000,
      shareownerId: "1"
    }]
  }, {
    companyId: "42",
    type: "Transaction",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 715,
      stopNr: 1000,
      shareownerId: "3"
    }]
  }, {
    companyId: "42",
    type: "Reversesplit",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 250,
      shareownerId: "2",
      sharetypeId: 55
    }, {
      startNr: 251,
      stopNr: 350,
      shareownerId: "3",
      sharetypeId: 55
    }]
  }, {
    companyId: "42",
    type: "Reservationupdate",
    date: "2018-01-02T00:00:00.000Z",
    shareholdingChanges: [{
      startNr: 1,
      stopNr: 250,
      firstRefusal: true
    }, {
      startNr: 251,
      stopNr: 350,
      firstRefusal: true
    }]
  }]);
});
