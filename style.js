/* ==========================================================================
   MAIN INITIALIZATION & DOM READY WRAPPER
   ========================================================================== */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

function initApp() {
  setupNavbar();
  setupSearch();
  initCalendar();
}

/* ==========================================================================
   1. MOBILE NAVBAR & DROPDOWN LOGIC
   ========================================================================== */
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

/* ==========================================================================
   2. SEARCH LOGIC & TOGGLE FUNCTIONALITY
   ========================================================================== */
function setupSearch() {
  // Document-level event delegation ensures clicks work on button OR inner icon/img
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#searchButton");
    const box = document.getElementById("searchBox");
    const resultsDropdown = document.getElementById("searchResults");

    if (btn && box) {
      e.preventDefault();
      const isHidden = window.getComputedStyle(box).display === "none";
      box.style.display = isHidden ? "inline-block" : "none";

      if (isHidden) {
        box.focus();
      } else if (resultsDropdown) {
        resultsDropdown.style.display = "none";
      }
      return;
    }

    // Hide dropdown when clicking outside search container
    const container = document.getElementById("navSearchContainer");
    if (container && !container.contains(e.target) && resultsDropdown) {
      resultsDropdown.style.display = "none";
    }
  });

  const box = document.getElementById("searchBox");
  if (box) {
    box.addEventListener("input", () => {
      const query = box.value.toLowerCase().trim();
      const resultsDropdown = document.getElementById("searchResults");
      if (!query) {
        if (resultsDropdown) resultsDropdown.style.display = "none";
        return;
      }
      fetchLiveResults(query);
    });

    box.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = box.value.toLowerCase().trim();
        if (!query) return;

        if (window.location.pathname.includes("calendar")) {
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
          } else {
            const resultsDropdown = document.getElementById("searchResults");
            if (resultsDropdown) resultsDropdown.style.display = "none";
          }
        } else {
          runGlobalSearch(query);
        }
      }
    });
  }
}

/* ==========================================================================
   3. SAFARI-SAFE LIVE SEARCH RESULTS DROPDOWN
   ========================================================================== */
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

          // Safely encode relative URLs to prevent Safari DOMExceptions
          let safeUrl = "#";
          if (match.url) {
            try {
              safeUrl = encodeURI(match.url.trim());
            } catch (err) {
              safeUrl = match.url;
            }
          }

          a.setAttribute("href", safeUrl);
          a.textContent = match.title ? match.title.trim() : "Untitled Page";

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

/* ==========================================================================
   4. GLOBAL SEARCH REDIRECT
   ========================================================================== */
function runGlobalSearch(query) {
  getSearchData()
    .then((data) => {
      const match = data.find(
        (p) =>
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.content && p.content.toLowerCase().includes(query))
      );

      if (match && match.url) {
        window.location.href = encodeURI(match.url.trim());
      } else {
        alert("Sorry! Couldn't find anything for '" + query + "'");
        document
          .querySelectorAll(".month")
          .forEach((m) => (m.style.display = "block"));
      }
    })
    .catch((err) => {
      console.error("Search error:", err);
      alert("Search failed. Ensure search.json exists in your project root.");
    });
}

/* ==========================================================================
   5. SEARCH DATA FETCH HELPER
   ========================================================================== */
function getSearchData() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  let searchJsonUrl = "/search.json";
  if (pathParts.length > 0 && !window.location.hostname.includes("localhost")) {
    searchJsonUrl = "/" + pathParts[0] + "/search.json";
  }

  return fetch(searchJsonUrl).then((res) => {
    if (!res.ok) {
      return fetch("./search.json").then((fallbackRes) => {
        if (!fallbackRes.ok) {
          throw new Error("HTTP " + fallbackRes.status);
        }
        return fallbackRes.json();
      });
    }
    return res.json();
  });
}

/* ==========================================================================
   6. CALENDAR TOGGLES & SORTING
   ========================================================================== */
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
}  });
}

/* ==========================================================================
   2. SEARCH LOGIC & TOGGLE FUNCTIONALITY
   ========================================================================== */
function setupSearch() {
  // Document-level event delegation ensures clicks work on the button OR any child icon/img inside it
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#searchButton");
    const box = document.getElementById("searchBox");
    const resultsDropdown = document.getElementById("searchResults");

    // Toggle search box visibility when search button is clicked
    if (btn && box) {
      e.preventDefault();
      const isHidden = window.getComputedStyle(box).display === "none";
      box.style.display = isHidden ? "inline-block" : "none";

      if (isHidden) {
        box.focus();
      } else if (resultsDropdown) {
        resultsDropdown.style.display = "none";
      }
      return;
    }

    // Hide search results dropdown when clicking outside the search container
    const container = document.getElementById("navSearchContainer");
    if (container && !container.contains(e.target) && resultsDropdown) {
      resultsDropdown.style.display = "none";
    }
  });

  // Attach key listeners to the input box
  const box = document.getElementById("searchBox");
  if (box) {
    // Live search on typing
    box.addEventListener("input", () => {
      const query = box.value.toLowerCase().trim();
      const resultsDropdown = document.getElementById("searchResults");
      if (!query) {
        if (resultsDropdown) resultsDropdown.style.display = "none";
        return;
      }
      fetchLiveResults(query);
    });

    // Execute search on Enter key press
    box.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = box.value.toLowerCase().trim();
        if (!query) return;

        // Calendar-page specific filtering logic
        if (window.location.pathname.includes("calendar")) {
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
          } else {
            const resultsDropdown = document.getElementById("searchResults");
            if (resultsDropdown) resultsDropdown.style.display = "none";
          }
        } else {
          runGlobalSearch(query);
        }
      }
    });
  }
}

/* ==========================================================================
   3. LIVE SEARCH RESULTS DROPDOWN
   ========================================================================== */
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

          const targetUrl = match.url ? match.url : "#";
          a.setAttribute("href", targetUrl);
          a.textContent = match.title || "Untitled Page";

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

/* ==========================================================================
   4. GLOBAL SEARCH REDIRECT
   ========================================================================== */
function runGlobalSearch(query) {
  getSearchData()
    .then((data) => {
      const match = data.find(
        (p) =>
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.content && p.content.toLowerCase().includes(query))
      );

      if (match && match.url) {
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
      alert("Search failed. Ensure search.json exists in your project root.");
    });
}

/* ==========================================================================
   5. SEARCH DATA FETCH HELPER (Safari-Safe URL Resolution)
   ========================================================================== */
function getSearchData() {
  // Uses absolute origin path to work on localhost, GitHub Pages subfolders, and custom domains
  const origin = window.location.origin;
  const pathPrefix = window.location.pathname.split("/")[1] || "";
  
  // If hosted on GitHub Pages subfolder (e.g. username.github.io/repository-name/)
  let searchUrl = "/search.json";
  if (pathPrefix && !window.location.hostname.includes("localhost") && !pathPrefix.includes(".")) {
    searchUrl = `/${pathPrefix}/search.json`;
  }

  return fetch(searchUrl)
    .then((res) => {
      if (!res.ok) {
        // Fallback to absolute relative path
        return fetch(origin + "/search.json").then((fallbackRes) => {
          if (!fallbackRes.ok) {
            throw new Error(`HTTP error! status: ${fallbackRes.status}`);
          }
          return fallbackRes.json();
        });
      }
      return res.json();
    });
}

/* ==========================================================================
   6. CALENDAR TOGGLES & MONTH SORTING
   ========================================================================== */
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
