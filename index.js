async function* asyncSortedListGenerator(list, comparator, lazyComparisons = true) {
  if (list.length < 2) {
    if (list.length) {
      yield list[0];
    }
  } else {
    const [a, b] = [list.slice(0, list.length / 2), list.slice(list.length / 2)]
      .map(sublist => (async function* () {
        for (const value of (lazyComparisons ? promisedSort : asyncSortedListGenerator)(sublist, comparator)) {
          yield await value;
        }
      })());

    let aNext = a.next();
    let bNext = b.next();
    let aValue, aDone;
    let bValue, bDone;

    // TODO if lasyComparisons is false, make Promise chain to finish conparisons before yielding
    while (([
      { done: aDone, value: aValue },
      { done: bDone, value: bValue }
    ] = await Promise.all([aNext, bNext])) && !aDone && !bDone) {
      if (await comparator(aValue, bValue) > 0) {
        bNext = b.next();
        yield bValue;
      } else {
        aNext = a.next();
        yield aValue;
      }
    }

    for (
      let gen = aDone ? b : a,
        value = aDone ? bValue : aValue,
        done = false;
      !done;
      { done, value } = await gen.next()
    ) {
      yield value;
    }
  }
}

function promisedSort(list, comparator) {
  const generator = asyncSortedListGenerator(list, comparator, false);
  const sorted = list.length ? [generator.next().then(({ value }) => value)] : [];

  for (let i = 1; i < list.length; i++) {
    sorted.push(sorted[i - 1].then(() => generator.next().then(({ value }) => value)));
  }

  return sorted;
}

async function asyncSort(list, comparator) {
  return await Promise.all(promisedSort(list, comparator));
}

const q = document.getElementById('q');
const add = document.getElementById('add');
const sort = document.getElementById('sort');
const clear = document.getElementById('clear');
const input = document.getElementById('input');
const output = document.getElementById('output');
const removeButton = '<button onclick="this.parentNode.parentNode.removeChild(this.parentNode)">Remove</button>';

add.onclick = () => {
  const value = q.value;
  q.value = '';
  if (value) {
    input.insertAdjacentHTML('beforeend', `<li>${value} ${removeButton}</li>`);
  }
  q.focus()
}

sort.onclick = async () => {
  const values = Array.from(input.children).map(child => child.innerText.replace(/ Remove$/, ''));

  const comparisonQueue = [];
  asyncMergeSort(values, (a, b) => new Promise(resolve => {
    console.log(`Push: ${a}, ${b}`);
    comparisonQueue.push({a, b, resolve});
  })).then(sorted => output.innerHTML = sorted.map(val => `<li>${val}</li>`).join(''));

  let comparison;
  while (comparison = await Promise.resolve().then(() => {
    console.log(`Get: ${comparisonQueue.length}`);
    comparisonQueue.splice(Math.random() * comparisonQueue.length, 1)[0]}
  )) {
    console.log(`Compare: ${comparison.a}, ${comparison.b}`);
    comparison.resolve(prompt(`A) ${comparison.a}\nB) ${comparison.b}`) == 'B' ? 1 : -1);
  }
}

clear.onclick = () => {
  input.innerHTML = '';
  output.innerHTML = '';
}
