const els = {
  token: document.getElementById("token"),
  org: document.getElementById("org"),
  repo: document.getElementById("repo"),
  threshold: document.getElementById("threshold"),
  save: document.getElementById("save"),
  status: document.getElementById("status"),
};

function setStatus(msg) {
  els.status.textContent = msg;
}

async function load() {
  const { ghToken, ghOrg, ghRepo, urgencyHours } = await chrome.storage.sync.get([
    "ghToken",
    "ghOrg",
    "ghRepo",
    "urgencyHours",
  ]);
  els.token.value = ghToken || "";
  els.org.value = ghOrg || "";
  els.repo.value = ghRepo || "";
  els.threshold.value = urgencyHours || 24;
}
load();

els.save.addEventListener("click", async () => {
  const ghToken = els.token.value.trim();
  const ghOrg = els.org.value.trim();
  const ghRepo = els.repo.value.trim();
  const urgencyHours = Math.max(1, Number(els.threshold.value || 24));

  await chrome.storage.sync.set({ ghToken, ghOrg, ghRepo, urgencyHours });
  setStatus("Saved. Fetching…");

  // Trigger an immediate refresh
  chrome.runtime.sendMessage({ type: "REFRESH_NOW" }, () => {
    setStatus("Saved + refreshed.");
  });
});
