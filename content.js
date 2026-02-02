function hoursBetween(iso) {
  const t = new Date(iso).getTime();
  return (Date.now() - t) / 36e5;
}
function fmtAgeHours(h) {
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 48) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

async function getData() {
  const { latestReviews, latestError } = await chrome.storage.local.get(["latestReviews", "latestError"]);
  const { urgencyHours } = await chrome.storage.sync.get(["urgencyHours"]);
  return { latestReviews, latestError, urgencyHours: Number(urgencyHours || 24) };
}

function findPRListBox() {
  // This is the big container that wraps the PR list
  return (
    document.querySelector('div.Box.mt-3.Box--responsive') ||
    document.querySelector('div.Box.mt-3') ||
    document.querySelector('div[aria-label="Pull requests"]') ||
    null
  );
}



function makePanel({ items, count, color, urgencyHours }) {
  const panel = document.createElement("div");
  panel.className = "gf-panel";
  panel.dataset.gf = "true";

  const header = document.createElement("div");
  header.className = "Box-header d-flex flex-justify-between";

  const title = document.createElement("div");
  title.className = "gf-title";
  title.textContent = "Requested Reviews";

  const pill = document.createElement("div");
  pill.className = "gf-pill";
  pill.textContent = `${count} open`;
  pill.style.borderColor = color;
  pill.style.color = "#fff";

  header.appendChild(title);
  header.appendChild(pill);

  const list = document.createElement("div");
  list.className = "gf-list";

  const top = items.slice(0, 5);
  if (top.length === 0) {
    const empty = document.createElement("div");
    empty.style.color = "var(--fgColor-muted, #656d76)";
    empty.style.fontSize = "13px";
    empty.textContent = "No PRs currently requesting your review 🎉";
    list.appendChild(empty);
  } else {
    for (const pr of top) {
      const row = document.createElement("div");
      row.className = "gf-item";

      const a = document.createElement("a");
      a.href = pr.url;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = pr.title;

      const ageH = hoursBetween(pr.updated_at);
      const age = document.createElement("div");
      age.className = "gf-age";
      age.textContent = `${fmtAgeHours(ageH)} • ${pr.repo}#${pr.number}`;

      row.appendChild(a);
      row.appendChild(age);
      list.appendChild(row);
    }
  }

  panel.appendChild(header);
  panel.appendChild(list);

  // Small hint row at bottom create a legend for the color types with color boxes and time info
  const hint = document.createElement("div");
  hint.style.marginTop = "10px";
  hint.style.fontSize = "12px";
  hint.style.padding = "12px";
  hint.style.color = "var(--fgColor-muted, #656d76)";
  hint.innerHTML = `
    <span style="color: #2da44e;">&#9679;</span> New &lt; 1h &nbsp;&nbsp;
    <span style="color: #bf8700;">&#9679;</span> Updated ≥ 1h &nbsp;&nbsp;
    <span style="color: #cf222e;">&#9679;</span> Oldest updated ≥ ${urgencyHours}h (proxy).
  `;
  panel.appendChild(hint);
  return panel;
}

function removeExistingPanel() {
  document.querySelectorAll('[data-gf="true"]').forEach((n) => n.remove());
}

function urgencyClass(ageHours, urgencyHours) {
  if (ageHours >= urgencyHours) return "gf-border-red";
  if (ageHours >= 1) return "gf-border-yellow";
  return "gf-border-green";
}

function highlightRows(items, urgencyHours) {
  // GitHub PR list items are often <div class="Box-row"> in a .js-navigation-container
  const rows = Array.from(document.querySelectorAll(".js-navigation-container .Box-row, div.Box-row"));
  if (!rows.length) return;

  // Map PR URL -> class
  const byUrl = new Map();
  for (const pr of items) {
    const ageH = hoursBetween(pr.updated_at);
    byUrl.set(pr.url, urgencyClass(ageH, urgencyHours));
  }

  for (const row of rows) {
    // Find link to PR
    const link = row.querySelector('a[href*="/pull/"]');
    if (!link) continue;

    const abs = new URL(link.getAttribute("href"), location.origin).toString();
    const cls = byUrl.get(abs);
    if (!cls) continue;

    row.classList.remove("gf-border-green", "gf-border-yellow", "gf-border-red");
    row.classList.add(cls);
  }
}

async function render() {
  if (!/\/pulls/.test(location.pathname)) return;

  const { latestReviews, latestError, urgencyHours } = await getData();

  removeExistingPanel();

  const prListBox = findPRListBox();
  if (!prListBox || !prListBox.parentElement) return;

  if (latestError) {
    const err = document.createElement("div");
    err.className = "gf-panel";
    err.dataset.gf = "true";
    err.textContent = `GitFlowy: ${latestError}`;
    prListBox.parentElement.insertBefore(err, prListBox);
    return;
  }

  if (!latestReviews) return;

  const panel = makePanel({
    items: latestReviews.items || [],
    count: latestReviews.count || 0,
    color: latestReviews.color || "#8c959f",
    urgencyHours
  });

  // ✅ Insert panel directly above the PR list container
  prListBox.parentElement.insertBefore(panel, prListBox);

  highlightRows(latestReviews.items || [], urgencyHours);
}


// Re-render on SPA-ish navigation
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    render();
  }
}, 800);

// Also re-render when storage updates (badge refresh)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.latestReviews || changes.latestError)) {
    render();
  }
});

render();
