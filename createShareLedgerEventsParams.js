exports.createShareLedgerEventsParams = ({
    companyId,
    sharetypeId,
    startCapital,
    endCapital,
    startQuantity,
    firstShareownerId,
    firstDate,
    endDate,
    shareownerAndQuantityTuples,
    firstRefusal
}) => {

  let result = [];
  let finalRanges = [];

  // Setup event
  result.push({
    companyId,
    type: 'Setup',
    date: firstDate,
    shareCapitalChange: startCapital,
    shareholdingChanges: [{
      startNr: 1,
      stopNr: startQuantity,
      buyDate: firstDate,
      shareownerId: String(firstShareownerId),
      sharetypeId
    }]
  });

  // Final number of shares
  let totalNumShares = shareownerAndQuantityTuples.reduce((ack, { quantity }) => ack + quantity, 0);

  // Quotient value
  let q = startCapital / startQuantity;

  // Calculate a proportionate distribution of shares via Sainte-Lagu�  ("J�mkade uddatalsmetoden")
  let fromShareissue = (endCapital - startCapital) / q;
  let keyMap = {
    fromTransaction: startQuantity,
    fromShareissue,
    fromSplit: Math.max(0, totalNumShares - startQuantity - fromShareissue)
  };
  let byShareownerId = shareownerAndQuantityTuples
    .reduce((ack, t) => ({
      ...ack,
      [t.shareownerId]: {
        fromTransaction: 0,
        fromShareissue: 0,
        fromSplit: 0,
        quantity: t.quantity,
        divisor: t.quantity
      }
    }), {});
  Object.entries(keyMap).forEach(([k, v]) => {
    Object.values(byShareownerId).forEach(obj => { obj.divisor = obj.quantity; });
    while (v > 0) {
      let shareowner = Object
        .entries(byShareownerId)
        .reduce((ack, [ shareownerId, obj ]) => ack.divisor > obj.divisor ? ack : obj, { divisor: 0 });
      shareowner[k]++;
      v--;
      shareowner.divisor = shareowner.quantity / (2 * shareowner[k] + 1);
    }
  });

  // Create transactions
  let startNr = 1;
  Object.entries(byShareownerId).forEach(([ shareownerId, obj ]) => {
    if (startNr > startQuantity) { return; }
    let stopNr = startNr + obj.fromTransaction - 1;
    let range = { startNr, stopNr };
    finalRanges.push(range);
    let shareholdingChanges = [{ ...range, shareownerId: String(shareownerId) }];
    if (stopNr < startQuantity) {
      shareholdingChanges.push({
        startNr: stopNr + 1,
        stopNr: startQuantity,
        shareownerId: String(firstShareownerId)
      });
    }
    result.push({
      companyId,
      type: 'Transaction',
      date: endDate,
      shareholdingChanges
    });
    startNr = stopNr + 1;
  });

  startNr = startQuantity + 1;
  if (keyMap.fromShareissue > 0) {
    // Create new shareissue
    let shareholdingChanges = [];
    Object.entries(byShareownerId).forEach(([ shareownerId, obj ]) => {
      if (obj.fromShareissue == 0) { return; }
      let stopNr = startNr + obj.fromShareissue - 1;
      let range = { startNr, stopNr };
      finalRanges.push(range);
      shareholdingChanges.push({
        ...range,
        shareownerId,
        sharetypeId
      });
      startNr = stopNr + 1;
    });
    result.push({
      companyId,
      type: 'Newshareissue',
      shareCapitalChange: (endCapital - startCapital),
      date: endDate,
      shareholdingChanges
    });
  }

  if (keyMap.fromSplit > 0) {
    // Create split
    let shareholdingChanges = [];
    Object.entries(byShareownerId).forEach(([ shareownerId, obj ]) => {
      if (obj.fromSplit == 0) { return; }
      let stopNr = startNr + obj.fromSplit - 1;
      let range = { startNr, stopNr };
      finalRanges.push(range);
      shareholdingChanges.push({
        ...range,
        shareownerId,
        sharetypeId
      });
      startNr = stopNr + 1;
    });
    result.push({
      companyId,
      type: 'Split',
      date: endDate,
      shareholdingChanges
    });
  }

  if (totalNumShares < startQuantity) {
    // Create reverse split
    finalRanges = [];
    let startNr = 1;
    let shareholdingChanges = [];
    Object.entries(byShareownerId).forEach(([ shareownerId, obj ]) => {
      let stopNr = startNr + obj.quantity - 1;
      let range = { startNr, stopNr };
      finalRanges.push(range);
      shareholdingChanges.push({ ...range, shareownerId, sharetypeId });
      startNr = stopNr + 1;
    });
    result.push({
      companyId,
      type: 'Reversesplit',
      date: endDate,
      shareholdingChanges
    });
  }

  // Set first refusal
  if (firstRefusal) {
    result.push({
      companyId,
      type: 'Reservationupdate',
      date: endDate,
      shareholdingChanges: finalRanges.map(range => ({ ...range, firstRefusal: true }))
    });
  }

  return result;
}
