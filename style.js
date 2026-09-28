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

// 2. SEARCH LOGIC
function setupSearch() {
  const btn = document.getElementById("searchButton");
  const box = document.getElementById("searchBox");
  if (!btn || !box) return;

  btn.onclick = () => {
    const isHidden = window.getComputedStyle(box).display === "none";
    box.style.display = isHidden ? "inline-block" : "none";
    if (isHidden) box.focus();
  };

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
        }
      } else {
        runGlobalSearch(query);
      }
    }
  };
}

// 3. GLOBAL SITE SEARCH
function runGlobalSearch(query) {
  // Dynamically resolve relative path to search.json regardless of subdirectory hosting
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  let jsonPath = "/search.json";

  // Check if hosted on GitHub Pages subfolder (e.g. /repo-name/)
  if (pathParts.length > 0 && !window.location.hostname.includes("localhost")) {
    jsonPath = "/" + pathParts[0] + "/search.json";
  }

  fetch(jsonPath)
    .then((res) => {
      if (!res.ok) {
        // Fallback to relative site root fetch
        return fetch("./search.json").then((r) => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        });
      }
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new Error("search.json did not return an array.");
      }

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
      alert("Search error: Make sure search.json exists and is valid.");
    });
}

// 4. CALENDAR TOGGLES
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
