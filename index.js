const q = document.getElementById('q');
const add = document.getElementById('add');
const sort = document.getElementById('sort');
const clear = document.getElementById('clear');
const input = document.getElementById('input');
const output = document.getElementById('output');

add.onclick = () => {
	const value = q.value;
  q.value = '';
  if (value) input.innerHTML += `<li>${value} <button onclick="this.parentNode.parentNode.removeChild(this.parentNode)">Remove</button></li>`;
  q.focus()
}

sort.onclick = () => {
	const values = Array.from(input.children).map(child => child.innerText.replace(/ Remove$/, ''));
  const cache = {};

	values.sort((a, b) => {
  	cache[a] = cache[a] || {};
  	cache[b] = cache[b] || {};

  	let val = cache[a] && cache[a][b];
    if (!val) val = prompt(`A) ${a}\nB) ${b}`) == 'A' ? -1 : 1;

    return cache[a][b] = cache[b][a] = val;
  });

  output.innerHTML = '';
  values.forEach(value => output.innerHTML += `<li>${value}</li>`);
}

clear.onclick = () => {
	input.innerHTML = '';
  output.innerHTML = '';
}
