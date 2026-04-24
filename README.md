# jira-bookmarklets

Browser bookmarklets for enhancing Jira's built-in views.

**Try it:** https://eparker71.github.io/jira-bookmarklets/

## Change In Velocity

Adds a rolling 3-sprint velocity column and an SVG trend chart to Jira's Velocity Chart page.

**What it does:**
- Reads the "Completed" column from the sprint table on Jira's Velocity Chart
- Computes a 3-sprint rolling average and appends a **Velocity** column to the table
- Hover over any velocity cell to highlight the three sprints that contributed to it
- Renders a line chart (SVG) below the table showing velocity trend over time, with a y-axis scaled to the actual data

**No dependencies** — pure vanilla JS, no jQuery.

### Installation

1. Open `index.html` in a browser
2. Drag the **Change In Velocity** button to your bookmarks toolbar

### Usage

1. Navigate to the Velocity Chart in Jira (Board → Reports → Velocity Chart)
2. Click the **Change In Velocity** bookmark
3. The velocity column and chart will appear on the page

### Development

The bookmarklet source is in [`calc_velocity_over_time.js`](calc_velocity_over_time.js). After editing it, regenerate the URL-encoded `href` in `index.html` by running:

```bash
python3 -c "
import re, sys
from urllib.parse import quote
src = open('calc_velocity_over_time.js').read()
code = re.sub(r'(?m)^\s*//.*$', '', src)
code = re.sub(r'\s+', ' ', code).strip()
safe = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~*'()\"
print('javascript:' + quote('(function(){' + code + '})();', safe=safe))
"
```

Paste the output as the `href` value on the bookmarklet anchor in `index.html`.
