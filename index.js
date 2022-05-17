function callbackMergeSort(list, comparator, onValue, done) {
  function resolveValue(value) {
    try {
      onValue(value);
    } catch {}
  }
  function resolve() {
    try {
      done();
    } catch {}
  }

  if (list.length < 2) {
    list.forEach(item => resolveValue(item));
    resolve();
  } else {
    const a = [];
    const b = [];
    let aDone = false;
    let bDone = false;
    let waiting = false;

    function handleValue() {
      if (!waiting) {
        if (a.length && b.length) {
          waiting = true;
          comparator(a[0], b[0], result => {
            waiting = false;
            resolveValue((result > 0 ? b : a).shift());
            handleValue();
          });
        } else {
          while (bDone && a.length) {
            resolveValue(a.shift());
          }
          while (aDone && b.length) {
            resolveValue(b.shift());
          }

          if (aDone && bDone) {
            resolve();
          }
        }
      }
    }

    callbackMergeSort(
      list.slice(0, Math.floor(list.length / 2)),
      comparator,
      value => {
        a.push(value);
        handleValue();
      },
      () => {
        aDone = true;
        handleValue();
      }
    );
    callbackMergeSort(
      list.slice(Math.floor(list.length / 2)),
      comparator,
      value => {
        b.push(value);
        handleValue();
      },
      () => {
        bDone = true;
        handleValue();
      }
    );
  }
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
  const sorted = [];

  callbackMergeSort(
    values,
    (a, b, resolve) => {
      comparisonQueue.push({ a, b, resolve });
    },
    value => sorted.push(value),
    () => output.innerHTML = sorted.map(val => `<li>${val}</li>`).join('')
  );

  while (comparisonQueue.length) {
    const [comparison] = comparisonQueue.splice(Math.random() * comparisonQueue.length, 1);
    const flip = Math.random() < 0.5;

    comparison.resolve(
      (prompt(`A) ${
        flip ? comparison.b : comparison.a
      }\nB) ${
        flip ? comparison.a : comparison.b
      }`) == 'B' ? 1 : -1) * (flip ? -1 : 1)
    );
  }
}

clear.onclick = () => {
  input.innerHTML = '';
  output.innerHTML = '';
}
