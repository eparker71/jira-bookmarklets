# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Browser bookmarklets for enhancing Jira's built-in views. The live demo/install page is hosted at https://eparker71.github.io/jira-bookmarklets/ via GitHub Pages.

## Architecture

Each bookmarklet is two things:
1. A readable source file (`.js`) — edited by humans, checked into git
2. A URL-encoded `javascript:` href embedded in `index.html` — generated from the source, used for drag-to-install

`index.html` doubles as both the install page (users drag the button to their bookmarks toolbar) and a local preview/test harness — it includes a mock Jira table so the velocity bookmarklet can be demoed in-browser without Jira.

`showdaysincard.js` is an older bookmarklet that uses jQuery (available on Jira pages); `calc_velocity_over_time.js` is vanilla JS only.

## Deploying changes to a bookmarklet

After editing `calc_velocity_over_time.js`, regenerate the encoded href and paste it into the `href` attribute of the `<a class="bookmarklet">` anchor in `index.html`:

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

The script strips comments and collapses whitespace before encoding, so the readable source and the minified href stay in sync manually — there is no build tool.

## Key Jira DOM selectors used by the velocity bookmarklet

- `[data-test-id="report-table"]` — wraps the sprint data table on the Velocity Chart page (Jira Cloud)
- `td:nth-child(3)` — the "Completed" column (1-indexed; Sprint name is col 1, Commitment is col 2)
- The SVG chart is injected directly into `[data-test-id="report-table"]` (no dedicated chart container exists in Jira Cloud)
