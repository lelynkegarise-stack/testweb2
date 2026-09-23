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
  // Fetches auto-generated Jekyll index
  fetch("{{ '/search.json' | relative_url }}")
    .then((res) => res.json())
    .then((data) => {
      const match = data.find(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
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
    .catch((err) => console.error("Search error:", err));
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
