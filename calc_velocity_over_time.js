const WINDOW_SIZE = 3;

const TABLE = '[data-testid="software-velocity-report.root-container"] table';

const a = [];
document.querySelectorAll(`${TABLE} tr td:nth-child(3)`).forEach(el => {
  a.push(Number(el.textContent));
});

if (a.length < WINDOW_SIZE) return;

// Calculate rolling averages
const b = [];
for (let i = 0; i <= a.length - WINDOW_SIZE; i++) {
  let total = 0;
  for (let y = 0; y < WINDOW_SIZE; y++) total += a[i + y];
  b.push(total / WINDOW_SIZE);
}

// Add velocity column to table
if (!document.getElementById('v-0')) {
  document.querySelectorAll(`${TABLE} tr`).forEach((row, i) => {
    if (i === 0) {
      row.insertAdjacentHTML('beforeend', `<th id="v-0" style="text-align:right">Velocity</th>`);
    } else if (i >= WINDOW_SIZE) {
      row.insertAdjacentHTML('beforeend', `<td id="v-${i}" class="highlight" style="text-align:right"></td>`);
    } else {
      row.insertAdjacentHTML('beforeend', `<td id="v-${i}" style="text-align:right"></td>`);
    }
  });
}

// Assign group classes for hover highlighting
for (let i = 1; i <= a.length; i++) {
  const startGroup = Math.max(1, i - WINDOW_SIZE + 1);
  const endGroup = Math.min(b.length, i);
  const classes = [];
  for (let g = startGroup; g <= endGroup; g++) classes.push('g' + g);
  const cell = document.querySelector(`${TABLE} tr:nth-child(${i}) td:nth-child(3)`);
  if (cell) cell.classList.add(...classes);
}

// Populate velocity column
const d = b.map(x => String(parseFloat(x.toFixed(2))));
for (let i = 0; i < d.length; i++) {
  const cell = document.getElementById(`v-${i + WINDOW_SIZE}`);
  if (cell) cell.textContent = d[i];
}

// Chart dimensions
const MAX_CHART_HEIGHT = 300;
const MAX_CHART_WIDTH = 450;
const MAX_GRAPH_HEIGHT = MAX_CHART_HEIGHT * 0.8;
const MAX_GRAPH_WIDTH = MAX_CHART_WIDTH * 0.8;
const MIN_GRAPH_X = MAX_CHART_WIDTH / 10;

// Scale y-axis to actual data with 20% headroom, rounded to a clean number
const maxVelocity = Math.max(...b);
const yAxisTop = Math.ceil(maxVelocity * 1.2 / 10) * 10;
const yIncrement = MAX_GRAPH_HEIGHT / 3;
const yScale = (MAX_GRAPH_HEIGHT - yIncrement) / yAxisTop;

// Evenly space data points across chart width
const xIncrement = b.length > 1 ? (MAX_GRAPH_WIDTH - MIN_GRAPH_X) / (b.length - 1) : 0;

// Map data to SVG coordinates
const cx = b.map((_, i) => Math.round(MIN_GRAPH_X + i * xIncrement));
const cy = b.map(v => (MAX_GRAPH_HEIGHT - v * yScale).toFixed(2));
const yLabelX = MIN_GRAPH_X - 15;
const xLabelY = MAX_GRAPH_HEIGHT + 15;

const pointsStr = cy.map((y, i) => `${cx[i]},${y}`).join(' ');
const circlesStr = cy.map((y, i) => {
  const textY = Math.round(parseFloat(y)) - 10;
  return `<circle cx="${cx[i]}" cy="${y}" data-value="${d[i]}" r="4"></circle>`
    + `<text x="${cx[i]}" y="${textY}">${d[i]}</text>`;
}).join('');

const svg = `<svg version="1.2" xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  style="height:${MAX_CHART_HEIGHT}px;width:${MAX_CHART_WIDTH}px;padding-left:50"
  aria-labelledby="title" role="img" id="velocity-chart">
  <title id="title">Change In Velocity</title>
  <g style="stroke:#ccc;stroke-dasharray:0;stroke-width:1" id="yGrid">
    <line x1="${MIN_GRAPH_X}" x2="${MIN_GRAPH_X}" y1="${yIncrement}" y2="${MAX_GRAPH_HEIGHT}"></line>
  </g>
  <g style="stroke:#ccc;stroke-dasharray:0;stroke-width:1" id="xGrid">
    <line x1="${MIN_GRAPH_X}" x2="${MAX_GRAPH_WIDTH}" y1="${MAX_GRAPH_HEIGHT}" y2="${MAX_GRAPH_HEIGHT}"></line>
  </g>
  <g text-anchor="middle">
    <text x="${MAX_GRAPH_WIDTH / 2}" y="${xLabelY}"
      style="font-weight:bold;text-transform:uppercase;font-size:12px;fill:black">&Delta; in Velocity</text>
  </g>
  <g text-anchor="end">
    <text x="${yLabelX}" y="${yIncrement}">${yAxisTop}</text>
    <text x="${yLabelX}" y="${yIncrement * 2}">${Math.round(yAxisTop / 2)}</text>
    <text x="${yLabelX}" y="${yIncrement * 3}">0</text>
  </g>
  <g style="fill:red;stroke-width:1">
    <polyline fill="none" stroke="#0074d9" stroke-width="3" points="${pointsStr}"/>
    ${circlesStr}
  </g>
</svg>`;

const tableEl = document.querySelector(TABLE);
if (tableEl) tableEl.style.float = 'left';

if (!document.getElementById('velocity-chart')) {
  document.querySelector('[data-testid="software-velocity-report.root-container"]').insertAdjacentHTML('beforeend', svg);

  document.querySelectorAll('.highlight').forEach(cell => {
    const gnum = parseInt(cell.id.split('-')[1], 10) - WINDOW_SIZE + 1;
    cell.addEventListener('mouseover', () => {
      cell.style.backgroundColor = '#ffffbb';
      document.querySelectorAll('.g' + gnum).forEach(el => el.style.backgroundColor = '#ffeebd');
    });
    cell.addEventListener('mouseout', () => {
      cell.style.backgroundColor = 'white';
      document.querySelectorAll('.g' + gnum).forEach(el => el.style.backgroundColor = 'white');
    });
  });
}
