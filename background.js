const ALARM_NAME = "POLL_GITHUB_REVIEWS";
const DEFAULT_POLL_MINUTES = 5;

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create(ALARM_NAME, { periodInMinutes: DEFAULT_POLL_MINUTES });
  await refresh();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) await refresh();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "REFRESH_NOW") {
    refresh().then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false }));
    return true; // keep channel open
  }
});

async function refresh() {
  const { ghToken, ghOrg, ghRepo, urgencyHours } = await chrome.storage.sync.get([
    "ghToken",
    "ghOrg",
    "ghRepo",
    "urgencyHours",
  ]);

  if (!ghToken) {
    await setBadge({ count: "", color: "#8c959f" }); // grey
    await chrome.storage.local.set({ latestReviews: null, latestError: "No token set" });
    return;
  }

  try {
    const hours = Number(urgencyHours || 24);
    const result = await fetchReviewRequestedPRs({ ghToken, ghOrg, ghRepo });

    // Compute traffic-light based on oldest "updated_at" as a proxy.
    // (Later: improve to "time since review requested" via timeline/events)
    const now = Date.now();
    let oldestMs = null;
    for (const pr of result.items) {
      const t = new Date(pr.updated_at).getTime();
      if (!oldestMs || t < oldestMs) oldestMs = t;
    }
    const ageHours = oldestMs ? (now - oldestMs) / 36e5 : 0;

    const count = result.items.length;
    let color = "#2da44e"; // green
    if (count === 0) color = "#2da44e";
    else if (ageHours >= hours) color = "#cf222e"; // red
    else color = "#bf8700"; // yellow-ish

    await setBadge({ count: count ? String(count) : "", color });
    await chrome.storage.local.set({
      latestReviews: {
        fetchedAt: new Date().toISOString(),
        count,
        color,
        items: result.items.map((pr) => ({
          id: pr.id,
          title: pr.title,
          url: pr.html_url,
          repo: pr.repository_url?.split("/repos/")[1] || "",
          number: pr.number,
          updated_at: pr.updated_at,
          user: pr.user?.login || "",
        })),
      },
      latestError: null,
    });
  } catch (e) {
    await setBadge({ count: "!", color: "#8c959f" });
    await chrome.storage.local.set({ latestReviews: null, latestError: String(e?.message || e) });
  }
}

async function setBadge({ count, color }) {
  await chrome.action.setBadgeText({ text: count });
  await chrome.action.setBadgeBackgroundColor({ color });
}

// Uses Search Issues API (PRs are issues with is:pr)
async function fetchReviewRequestedPRs({ ghToken, ghOrg, ghRepo }) {
  // If org/repo set, narrow search. Otherwise search across all.
  const scope =
    ghOrg && ghRepo ? ` repo:${ghOrg}/${ghRepo}` :
    ghOrg ? ` org:${ghOrg}` :
    "";

  const q = `is:open is:pr review-requested:@me${scope}`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=50`;

  const res = await fetch(url, {
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${ghToken}`,
      "X-GitHub-Api-Version": "2022-11-28"
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }
  return await res.json();
}
