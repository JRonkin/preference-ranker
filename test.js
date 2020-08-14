(async function() {

  function callbackSort(list, comparator, onItem, onError) {
    if (list.length < 2) {
      if (list.length) {
        onItem(list[0]);
      }

      return;
    }

    const a = [];
    const b = [];
    let comparisonInProgress = false;
    let remainingItems = list.length;

    function compare() {
      if (!comparisonInProgress) {
        if (a.length && b.length) {
          comparisonInProgress = true;
          (async () => comparator(a[0], b[0]))()
            .then(result => {
              const item = (result > 0 ? b : a).splice(0, 1)[0];
              comparisonInProgress = false;
              compare();
              onItem(item);
            })
            .catch(onError);
        } else if (!remainingItems) {
          onItem((a.length ? a : b)[0]);
        }
      }
    }

    function recursiveOnItem(list) {
      return item => {
        --remainingItems;
        list.push(item);
        compare();
      }
    }

    callbackSort(list.slice(0, list.length / 2), comparator, recursiveOnItem(a), onError);
    callbackSort(list.slice(list.length / 2), comparator, recursiveOnItem(b), onError);
  }

  async function asyncSort(list, comparator) {
    const sorted = [];

    return list.length ? await new Promise((resolve, reject) => {
      function callbackComparator(a, b, callback, onError) {
        Promise.resolve(comparator(a, b)).then(callback).catch(onError);
      }

      function onItem(item) {
        sorted.push(item);
        console.log(sorted);

        if (sorted.length == list.length) {
          resolve(sorted);
        }
      }

      callbackSort(list, callbackComparator, onItem, reject);
    }) : sorted;
  }

  const values = [4, 2, 5, 1, 3];

  console.log('Normal Sorting: ' + await asyncSort(values, (a, b) => a - b));

  const comparisonQueue = [];
  asyncSort(values, (a, b) => new Promise(resolve => {
    console.log(`Push: ${a}, ${b}`);
    comparisonQueue.push({a, b, resolve});
    // console.log(`Compare: ${a}, ${b}`);
    // resolve(a - b);
  })).then(sorted => console.log('Sorted: ' + sorted.join(',')));

  let comparison;
  while (comparison = await (() => {
    console.log(`Get: ${comparisonQueue.length}`);
    return comparisonQueue.splice(Math.random() * comparisonQueue.length, 1)[0];
  })()) {
    console.log(`Compare: ${comparison.a}, ${comparison.b}`);
    // comparison.resolve(prompt(`A) ${comparison.a}\nB) ${comparison.b}`) == 'B' ? 1 : -1);
    comparison.resolve(comparison.a - comparison.b);
  }

  console.log(`Comparisons: ${comparisonQueue.length}`);
  console.log('Done.');

})();
