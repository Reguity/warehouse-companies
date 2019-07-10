# warehouse-companies
Helper methods to create a initial share ledger for a warehouse company using Reguity

# Installation
```
npm install warehouse-companies
```

`createShareLedgerEventsParams` can be used in a scenario where you want to sell a warehouse company that has
one owner and one sharetype, given the following parameters:

* **companyId** The id of the company to sell
* **sharetypeId** The id of the sharetype
* **startCapital** The amount of share capital that exists from the start
* **endCapital** The amount of share capital to exist once the new owners have bought it
* **startQuantity** The amount of shares that exist from the start
* **firstShareownerId** The id of the initial owner of the first shares
* **firstDate** The date on which the company was founded
* **endDate** The date on which the company was sold
* **shareownerAndQuantityTuples** List of objects on the form `{ shareownerId, quantity }`, where `shareownerId` is the id of a new shareowner and quantity is the amount of shares that he/she should receive
* **firstRefusal** Whether first refusal should be set

# Example call.
**Scenario**: Warehouse company initially has 1000 shares and a share capital of 50000.
Two shareowners want to buy it but end up owning 1200 and 1100 shares respectively, with a new share capital of 100000.


This will yeild a initial setup where we say that we initially own the 1000 shares, two transactions where we distribute the 1000 shares proportionaly to the new owners, a new share issue (doesn't change quotient value) and a split (that changes quotient value):

```js
const { createShareLedgerEventsParams } = require('warehouse-companies');

createShareLedgerEventsParams({
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

/*
  =>
  [{
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
      stopNr: 1521,
      shareownerId: "2",
      sharetypeId: 55
    }, {
      startNr: 1522,
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
      stopNr: 1521,
      firstRefusal: true
    }, {
      startNr: 1522,
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
  }]
*/
```

# Usage with Reguity GraphQL API
The response from `createShareLedgerEventsParams` is an array of parameters that can used as consecutive calls to the `createShareLedgerEvent` mutation.
One just has to iterate the response from `createShareLedgerEventParams`, and supply each element as the value for variable `$params`.

# Example using graphql-request and the example call
```js
const { createShareLedgerEventsParams } = require('warehouse-companies');
const { request } = require('graphql-request');
const endpoint = 'https://api-dev.reguity.com';
const query = `mutation CreateShareLedgerEvent ($params: EventCreationInput!) {
  createShareLedgerEvent (params: $params) {
    code
    message
  }
}`;
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
result.reduce((ack, params) => ack.then(() => request(endpoint, query, { params })), Promise.all([]));
```

Done!
