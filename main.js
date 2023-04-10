const grid = document.getElementById("grid");
const textarea = document.querySelector("textarea");

const checkSE = (_new, cur) => _new-cur <= 1;
const checkES = (_new, cur) => cur-_new <= 1;

const sleep = async (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDefaultInput() {
  const req = await fetch("./input.txt");
  const defaultValue = await req.text();
  textarea.value = defaultValue;
  return defaultValue;
}

async function run() {
  let chars;
  if (!textarea.value.trim()) {
    chars = await fetchDefaultInput();
  } else {
    chars = textarea.value.trim().split("\n");
  }
  
  drawGrid(chars);

  const order = document.querySelector('input[name="search_order"]:checked').value;
  const [start, end] = order.split();

  if (start === 'S') {
    await solve(chars, start, end, checkSE);
  } else {
    await solve(chars, start, end, checkES);
  }
}



function drawGrid(chars) {
  grid.replaceChildren();

  const R = chars.length, C = chars[0].length;
  
  for (let r = 0; r < R; r++) {
    let row = document.createElement("div");
    row.classList.add("grid-row");
    
    for (let c = 0; c < C; c++) {
      let cell = document.createElement("div");
      cell.classList.add("grid-cell");
      cell.innerText = chars[r][c];
      cell.id = `${r}_${c}`
      row.appendChild(cell);
    }

    grid.appendChild(row);
  }
}


async function solve(chars, start, end, check) {
  const R = chars.length, C = chars[0].length;
  let start_r, start_c;

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (chars[r][c] === start) {
        start_r = r;
        start_c = c
        break;
      }
    }
  }

  height = {}
  for (let code = 'a'.charCodeAt(0); code <= 'z'.charCodeAt(0); code++) {
    const c = String.fromCharCode(code);
    height[c] = code - 'a'.charCodeAt(0) + 1;
  }
  height['S'] = height['a'];
  height['E'] = height['z'];

  const root = {
    r: start_r,
    c: start_c,
    path: [`${start_r}_${start_c}`]
  }
  const res = await bfs(root);
  console.log(res);


  async function bfs(root) {
    let queue = [root];
    const direction = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let visited = new Set();
    let prevPath = [];
  
    while (queue) {
      size = queue.length;
  
      for (let i=0; i<size; i++) {
        const node = queue.shift();
        const r = node.r, c = node.c;
        
        const key = `${r}_${c}`;
        if (visited.has(key)) {
          continue;
        }
        visited.add(key);

        // draw path
        let i = 0;
        while (i<prevPath.length) {
          if (prevPath[i] !== node.path[i]) {
            const prevCell = document.getElementById(prevPath[i]);
            prevCell.style.backgroundColor = '#bae6fd';
            const newCell = document.getElementById(node.path[i]);
            newCell.style.backgroundColor = '#0ea5e9';
            await sleep(0);
          }
          i++;
        }
        while (i < node.path.length) {
          const newCell = document.getElementById(node.path[i]);
          newCell.style.backgroundColor = '#0ea5e9';
          i++;
          await sleep(0);
        }
        prevPath = node.path.slice();

        if (chars[r][c] === end) {
          return node.path;
        }

        const cur_height = height[chars[r][c]];

        for (const [ri, ci] of direction) {
          const new_r = r+ri, new_c = c+ci;
          const new_key = `${new_r}_${new_c}`;

          if (new_r < 0 || new_r >= R || new_c < 0 || new_c >= C) {
            continue;
          }

          if (visited.has(new_key)) {
            continue;
          }

          const new_height = height[chars[new_r][new_c]];
          if (check(new_height, cur_height)) {
            const new_node = {
              r: new_r,
              c: new_c,
              path: [...node.path, new_key]
            };
            
            queue.push(new_node);
          }
        }
      }
    }
  }
}

