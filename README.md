# GitFlowy Chrome Extension

**GitFlowy** is a lightweight Chrome extension designed to unblock development teams. By providing instant visibility into pending pull request reviews directly within the GitHub UI, it ensures that "Review Requested" never becomes a graveyard.

<img width="400" height="400" alt="GitFlowy" src="https://github.com/user-attachments/assets/eb2eb3b3-192f-4b5d-a477-53f204adf302" />


## 🚀 The Problem
In the era of AI-accelerated coding, the bottleneck has shifted from *writing* code to *reviewing* it. When PRs sit idle, velocity drops. GitFlowy uses a simple, intuitive traffic-light system to tell you exactly what needs your attention and how urgent it is.

## ✨ Features
* **Integrated Dashboard:** Adds a "Requested Reviews" component directly above the GitHub PR search bar.
* **Urgency Indicators:** * 🟢 **Green:** New PRs (< 1h).
    * 🟡 **Yellow:** Pending reviews (≥ 1h).
    * 🔴 **Red:** Stale PRs (≥ 24h) — these also get a bold red left border in your main PR list!
* **Toolbar Stats:** A glanceable count of your pending reviews in the Chrome extension bar.
* **Native Feel:** Built to blend seamlessly with GitHub's design system.
* **Privacy First:** All data, including your Personal Access Token (PAT), is stored locally in your Chrome storage.

## 🛠️ Built With
* **Vanilla JavaScript** (ES6+)
* **CSS3** (Custom GitHub UI Injections)
* **HTML5**

## 📦 Installation
### Download from Chrome Extension Store
- Simple 1-click install: [Click Here]([https://chromewebstore.com](https://chromewebstore.google.com/detail/gitflowy-visualize-pr-rev/oohljhpihallnpdodiakekkckahgphic))
### Local Installarion
If you prefer to create a local copy, do the following:
1. Clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.
5. Click the GitFlowy icon in your toolbar to set your GitHub PAT and Urgency Threshold.

## 🤝 Contributing
This is an open-source project and I love collaboration! Whether it's a bug fix, a new feature, or a UI improvement:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📝 License
Distributed under the MIT License.

---
Made with ❤️ & ☕ by [Imtiaz Raqib](https://imtiazraqib.com)
