const WINDOW_SIZE = 3;

const TABLE = '[data-testid="software-velocity-report.root-container"] table';

const commitment = [];
const completed = [];
document.querySelectorAll(`${TABLE} tr`).forEach((row, i) => {
  if (i === 0) return;
  const c2 = row.querySelector('td:nth-child(2)');
  const c3 = row.querySelector('td:nth-child(3)');
  if (c2 && c3) {
    commitment.push(Number(c2.textContent));
    completed.push(Number(c3.textContent));
  }
});

const a = completed;

if (a.length >= WINDOW_SIZE) {

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

// Add ratio column to table
if (!document.getElementById('r-0')) {
  document.querySelectorAll(`${TABLE} tr`).forEach((row, i) => {
    if (i === 0) {
      row.insertAdjacentHTML('beforeend', `<th id="r-0" style="text-align:right">Ratio</th>`);
    } else {
      row.insertAdjacentHTML('beforeend', `<td id="r-${i}" style="text-align:right"></td>`);
    }
  });
}

// Populate ratio column
for (let i = 0; i < commitment.length; i++) {
  const cell = document.getElementById(`r-${i + 1}`);
  if (!cell) continue;
  if (commitment[i] === 0) {
    cell.textContent = '—';
  } else {
    const ratio = completed[i] / commitment[i];
    cell.textContent = Math.round(ratio * 100) + '%';
    cell.style.color = ratio >= 1 ? 'green' : '#c00';
  }
}

// Chart dimensions
const MAX_CHART_HEIGHT = 300;
const MAX_CHART_WIDTH = 450;
const MAX_GRAPH_HEIGHT = MAX_CHART_HEIGHT * 0.8;
const MAX_GRAPH_WIDTH = MAX_CHART_WIDTH * 0.8;
const MIN_GRAPH_X = MAX_CHART_WIDTH / 10;

// Scale y-axis to all three datasets with 20% headroom, rounded to a clean number
const maxVal = Math.max(...commitment, ...completed, ...b);
const yAxisTop = Math.ceil(maxVal * 1.2 / 10) * 10;
const yIncrement = MAX_GRAPH_HEIGHT / 3;
const yScale = (MAX_GRAPH_HEIGHT - yIncrement) / yAxisTop;

// Evenly space all sprints across chart width
const n = commitment.length;
const xIncrement = n > 1 ? (MAX_GRAPH_WIDTH - MIN_GRAPH_X) / (n - 1) : 0;
const cx = commitment.map((_, i) => Math.round(MIN_GRAPH_X + i * xIncrement));

// Map both series to SVG coordinates (higher value = lower y number = higher on screen)
const commitY = commitment.map(v => parseFloat((MAX_GRAPH_HEIGHT - v * yScale).toFixed(2)));
const completedY = completed.map(v => parseFloat((MAX_GRAPH_HEIGHT - v * yScale).toFixed(2)));

const yLabelX = MIN_GRAPH_X - 15;
const xLabelY = MAX_GRAPH_HEIGHT + 15;

// Build per-segment fill polygons between the two lines, with crossing detection
const fillSegments = commitment.slice(0, -1).map((_, i) => {
  const x1 = cx[i], x2 = cx[i + 1];
  const d0 = completed[i] - commitment[i];
  const d1 = completed[i + 1] - commitment[i + 1];
  if (Math.sign(d0) !== Math.sign(d1) && d0 !== 0 && d1 !== 0) {
    // Lines cross — split at the intersection point
    const t = d0 / (d0 - d1);
    const xCross = (x1 + t * (x2 - x1)).toFixed(2);
    const yCross = (commitY[i] + t * (commitY[i + 1] - commitY[i])).toFixed(2);
    const c1 = d0 >= 0 ? 'rgba(0,160,0,0.3)' : 'rgba(200,0,0,0.3)';
    const c2 = d1 >= 0 ? 'rgba(0,160,0,0.3)' : 'rgba(200,0,0,0.3)';
    return `<polygon points="${x1},${commitY[i]} ${xCross},${yCross} ${x1},${completedY[i]}" fill="${c1}" stroke="none"/>` +
           `<polygon points="${xCross},${yCross} ${x2},${commitY[i + 1]} ${x2},${completedY[i + 1]}" fill="${c2}" stroke="none"/>`;
  }
  const color = d0 + d1 >= 0 ? 'rgba(0,160,0,0.3)' : 'rgba(200,0,0,0.3)';
  return `<polygon points="${x1},${commitY[i]} ${x2},${commitY[i + 1]} ${x2},${completedY[i + 1]} ${x1},${completedY[i]}" fill="${color}" stroke="none"/>`;
}).join('');

const commitPointsStr = commitY.map((y, i) => `${cx[i]},${y}`).join(' ');
const completedPointsStr = completedY.map((y, i) => `${cx[i]},${y}`).join(' ');

const commitCircles = commitY.map((y, i) => `<circle cx="${cx[i]}" cy="${y}" r="3" fill="#e67e00"/>`).join('');
const completedCircles = completedY.map((y, i) => `<circle cx="${cx[i]}" cy="${y}" r="3" fill="#0074d9"/>`).join('');

// Velocity line starts at sprint index WINDOW_SIZE-1 (first window completes there)
const velocityCx = b.map((_, i) => cx[i + WINDOW_SIZE - 1]);
const velocityY = b.map(v => parseFloat((MAX_GRAPH_HEIGHT - v * yScale).toFixed(2)));
const velocityPointsStr = velocityY.map((y, i) => `${velocityCx[i]},${y}`).join(' ');
const velocityCircles = velocityY.map((y, i) => `<circle cx="${velocityCx[i]}" cy="${y}" r="4" fill="#9333ea"/>`).join('');

// Legend
const legendX = MAX_GRAPH_WIDTH - 80;
const legendY = yIncrement * 0.6;

const svg = `<svg version="1.2" xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  style="height:${MAX_CHART_HEIGHT}px;width:${MAX_CHART_WIDTH}px;padding-left:50"
  aria-labelledby="title" role="img" id="velocity-chart">
  <title id="title">Commitment vs Completed</title>
  <g style="stroke:#ccc;stroke-dasharray:0;stroke-width:1" id="yGrid">
    <line x1="${MIN_GRAPH_X}" x2="${MIN_GRAPH_X}" y1="${yIncrement}" y2="${MAX_GRAPH_HEIGHT}"></line>
  </g>
  <g style="stroke:#ccc;stroke-dasharray:0;stroke-width:1" id="xGrid">
    <line x1="${MIN_GRAPH_X}" x2="${MAX_GRAPH_WIDTH}" y1="${MAX_GRAPH_HEIGHT}" y2="${MAX_GRAPH_HEIGHT}"></line>
  </g>
  <g text-anchor="middle">
    <text x="${MAX_GRAPH_WIDTH / 2}" y="${xLabelY}"
      style="font-weight:bold;text-transform:uppercase;font-size:12px;fill:black">Commitment vs Completed</text>
  </g>
  <g text-anchor="end">
    <text x="${yLabelX}" y="${yIncrement}">${yAxisTop}</text>
    <text x="${yLabelX}" y="${yIncrement * 2}">${Math.round(yAxisTop / 2)}</text>
    <text x="${yLabelX}" y="${yIncrement * 3}">0</text>
  </g>
  ${fillSegments}
  <polyline fill="none" stroke="#e67e00" stroke-width="1.5" opacity="0.5" points="${commitPointsStr}"/>
  <polyline fill="none" stroke="#0074d9" stroke-width="1.5" opacity="0.5" points="${completedPointsStr}"/>
  <polyline fill="none" stroke="#9333ea" stroke-width="3" points="${velocityPointsStr}"/>
  <g opacity="0.5">${commitCircles}${completedCircles}</g>
  ${velocityCircles}
  <g text-anchor="start" style="font-size:11px">
    <line x1="${legendX}" x2="${legendX + 18}" y1="${legendY}" y2="${legendY}" stroke="#e67e00" stroke-width="1.5" opacity="0.5"/>
    <circle cx="${legendX + 9}" cy="${legendY}" r="3" fill="#e67e00" opacity="0.5"/>
    <text x="${legendX + 22}" y="${legendY + 4}" fill="#999">Commitment</text>
    <line x1="${legendX}" x2="${legendX + 18}" y1="${legendY + 16}" y2="${legendY + 16}" stroke="#0074d9" stroke-width="1.5" opacity="0.5"/>
    <circle cx="${legendX + 9}" cy="${legendY + 16}" r="3" fill="#0074d9" opacity="0.5"/>
    <text x="${legendX + 22}" y="${legendY + 20}" fill="#999">Completed</text>
    <line x1="${legendX}" x2="${legendX + 18}" y1="${legendY + 32}" y2="${legendY + 32}" stroke="#9333ea" stroke-width="3"/>
    <circle cx="${legendX + 9}" cy="${legendY + 32}" r="4" fill="#9333ea"/>
    <text x="${legendX + 22}" y="${legendY + 36}" fill="#333" style="font-weight:bold">Velocity</text>
  </g>
</svg>`;

const tableEl = document.querySelector(TABLE);
if (tableEl) tableEl.style.float = 'left';

if (!document.getElementById('csv-export-btn')) {
  const btn = document.createElement('button');
  btn.id = 'csv-export-btn';
  btn.textContent = 'Export CSV';
  btn.style.cssText = 'margin-top:8px;padding:4px 10px;background:#32a0eb;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px;display:block;clear:both';
  btn.addEventListener('click', () => {
    const sprintNames = [];
    document.querySelectorAll(`${TABLE} tr`).forEach((row, i) => {
      if (i === 0) return;
      const cell = row.querySelector('td:nth-child(1)');
      if (cell) sprintNames.push(cell.textContent.trim());
    });
    const rows = [['Sprint', 'Commitment', 'Completed', 'Velocity', 'Ratio']];
    for (let i = 0; i < commitment.length; i++) {
      const vel = i >= WINDOW_SIZE - 1 ? b[i - (WINDOW_SIZE - 1)] : '';
      const ratio = commitment[i] === 0 ? '' : Math.round(completed[i] / commitment[i] * 100) + '%';
      rows.push([sprintNames[i] || `Sprint ${i + 1}`, commitment[i], completed[i], vel, ratio]);
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'velocity.csv';
    a.click();
    URL.revokeObjectURL(url);
  });
  document.querySelector('[data-testid="software-velocity-report.root-container"]').insertAdjacentElement('beforeend', btn);
}

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

}
