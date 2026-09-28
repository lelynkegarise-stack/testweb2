document.addEventListener("DOMContentLoaded", () => {
  setupNavbar();
  setupSearch();
  initCalendar();
});

// 1. MOBILE NAVBAR & DROPDOWN LOGIC
function setupNavbar() {
  const hamburger = document.getElementById("hamburger");
  const menu = document.getElementById("menu");

  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      menu.classList.toggle("active");
    });
  }

  // Mobile Dropdown Click Handler
  document.querySelectorAll(".dropdown > a").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 950) {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
      }
    });
  });
}

// 2. SEARCH LOGIC (Live Dropdown & Page Search)
function setupSearch() {
  const btn = document.getElementById("searchButton");
  const box = document.getElementById("searchBox");
  const resultsDropdown = document.getElementById("searchResults");
  if (!btn || !box) return;

  // Toggle search box display on search icon click
  btn.onclick = () => {
    const isHidden = window.getComputedStyle(box).display === "none";
    box.style.display = isHidden ? "inline-block" : "none";
    if (isHidden) {
      box.focus();
    } else {
      if (resultsDropdown) resultsDropdown.style.display = "none";
    }
  };

  // Live search recommendations on typing
  box.addEventListener("input", () => {
    const query = box.value.toLowerCase().trim();
    if (!query) {
      if (resultsDropdown) resultsDropdown.style.display = "none";
      return;
    }
    fetchLiveResults(query);
  });

  // Handle Enter Key Press
  box.onkeypress = (e) => {
    if (e.key === "Enter") {
      const query = box.value.toLowerCase().trim();
      if (!query) return;

      const isCalendar = window.location.pathname.includes("calendar");

      if (isCalendar) {
        const months = document.querySelectorAll(".month");
        let foundAny = false;

        months.forEach((m) => {
          if (m.innerText.toLowerCase().includes(query)) {
            m.style.display = "block";
            foundAny = true;
            const tbl = m.querySelector(".month-table");
            if (tbl) tbl.classList.add("show");
          } else {
            m.style.display = "none";
          }
        });

        if (!foundAny) {
          runGlobalSearch(query);
        } else if (resultsDropdown) {
          resultsDropdown.style.display = "none";
        }
      } else {
        runGlobalSearch(query);
      }
    }
  };

  // Hide dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const container = document.getElementById("navSearchContainer");
    if (container && !container.contains(e.target) && resultsDropdown) {
      resultsDropdown.style.display = "none";
    }
  });
}

// 3. FETCH LIVE SEARCH RESULTS
function fetchLiveResults(query) {
  const resultsDropdown = document.getElementById("searchResults");
  if (!resultsDropdown) return;

  getSearchData()
    .then((data) => {
      const matches = data.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.content && p.content.toLowerCase().includes(query))
      );

      resultsDropdown.innerHTML = "";

      if (matches.length > 0) {
        matches.slice(0, 5).forEach((match) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = match.url;
          a.textContent = match.title || match.url;
          li.appendChild(a);
          resultsDropdown.appendChild(li);
        });
        resultsDropdown.style.display = "block";
      } else {
        const li = document.createElement("li");
        li.innerHTML = "<a style='cursor:default;'>No results found</a>";
        resultsDropdown.appendChild(li);
        resultsDropdown.style.display = "block";
      }
    })
    .catch((err) => console.error("Search fetch error:", err));
}

// 4. GLOBAL SEARCH REDIRECT
function runGlobalSearch(query) {
  getSearchData()
    .then((data) => {
      const match = data.find(
        (p) =>
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.content && p.content.toLowerCase().includes(query))
      );

      if (match) {
        window.location.href = match.url;
      } else {
        alert("Sorry! Couldn't find anything for '" + query + "'");
        document
          .querySelectorAll(".month")
          .forEach((m) => (m.style.display = "block"));
      }
    })
    .catch((err) => {
      console.error("Search error:", err);
      alert("Search failed. Ensure search.json exists in your site root.");
    });
}

// Helper to reliably fetch search.json across subfolders/GitHub Pages
function getSearchData() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  let jsonPath = "/search.json";

  if (pathParts.length > 0 && !window.location.hostname.includes("localhost")) {
    jsonPath = "/" + pathParts[0] + "/search.json";
  }

  return fetch(jsonPath).then((res) => {
    if (!res.ok) {
      return fetch("./search.json").then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      });
    }
    return res.json();
  });
}

// 5. CALENDAR TOGGLES
function initCalendar() {
  const container = document.getElementById("months-container");
  if (!container) return;

  const months = Array.from(container.querySelectorAll(".month"));
  months.sort((a, b) =>
    (a.getAttribute("data-month") || "").localeCompare(
      b.getAttribute("data-month") || ""
    )
  );
  months.forEach((month) => container.appendChild(month));

  container.onclick = function (e) {
    if (e.target.classList.contains("month-toggle")) {
      const table = e.target.nextElementSibling;
      if (table) table.classList.toggle("show");
    }
  };
}
