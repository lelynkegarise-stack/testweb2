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

// 2. SEARCH LOGIC (Live Suggestions & Navigation)
function setupSearch() {
  const btn = document.getElementById("searchButton");
  const box = document.getElementById("searchBox");
  const resultsDropdown = document.getElementById("searchResults");
  if (!btn || !box) return;

  // Toggle search box on search icon click
  btn.onclick = (e) => {
    e.preventDefault();
    const isHidden = window.getComputedStyle(box).display === "none";
    box.style.display = isHidden ? "inline-block" : "none";
    if (isHidden) {
      box.focus();
    } else if (resultsDropdown) {
      resultsDropdown.style.display = "none";
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

  // Handle Enter key press
  box.onkeypress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
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

// 3. FETCH LIVE SEARCH RESULTS FOR DROPDOWN
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

// 4. GLOBAL SEARCH REDIRECT
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

// 5. HELPER: FETCH search.json WITH PATH RESOLUTION
function getSearchData() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  
  // Handles repository subfolder (e.g. /testweb2/search.json)
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

// 6. CALENDAR TOGGLES & SORTING
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
}  btn.onclick = () => {
    const isHidden = window.getComputedStyle(box).display === "none";
    box.style.display = isHidden ? "inline-block" : "none";
    if (isHidden) {
      box.focus();
    } else if (resultsDropdown) {
      resultsDropdown.style.display = "none";
    }
  };

  // Live autocomplete search while typing
  box.addEventListener("input", () => {
    const query = box.value.toLowerCase().trim();
    if (!query) {
      if (resultsDropdown) resultsDropdown.style.display = "none";
      return;
    }
    fetchLiveResults(query);
  });

  // Handle Enter key press
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

  // Hide live dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const container = document.getElementById("navSearchContainer");
    if (container && !container.contains(e.target) && resultsDropdown) {
      resultsDropdown.style.display = "none";
    }
  });
}

// 3. FETCH LIVE SEARCH RESULTS FOR DROPDOWN
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
          
          // Safari fix: safely encode URL before setting href
          const safeUrl = match.url ? encodeURI(match.url) : "#";
          a.setAttribute("href", safeUrl);
          a.textContent = match.title || match.url || "Page";
          
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

      if (match && match.url) {
        window.location.href = encodeURI(match.url);
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

// 5. HELPER: FETCH search.json WITH SUBFOLDER PATH RESOLUTION
function getSearchData() {
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  
  // Detect subfolder repository (e.g. /testweb2/search.json)
  let searchJsonUrl = "/search.json";
  if (pathSegments.length > 0 && !window.location.hostname.includes("localhost")) {
    searchJsonUrl = `/${pathSegments[0]}/search.json`;
  }

  return fetch(searchJsonUrl).then((res) => {
    if (!res.ok) {
      return fetch("./search.json").then((fallbackRes) => {
        if (!fallbackRes.ok) {
          throw new Error(`HTTP status ${fallbackRes.status} when fetching search.json`);
        }
        return fallbackRes.json();
      });
    }
    return res.json();
  });
}

// 6. CALENDAR TOGGLES & SORTING
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
}  btn.onclick = () => {
    const isHidden = window.getComputedStyle(box).display === "none";
    box.style.display = isHidden ? "inline-block" : "none";
    if (isHidden) {
      box.focus();
    } else if (resultsDropdown) {
      resultsDropdown.style.display = "none";
    }
  };

  // Live autocomplete search while typing
  box.addEventListener("input", () => {
    const query = box.value.toLowerCase().trim();
    if (!query) {
      if (resultsDropdown) resultsDropdown.style.display = "none";
      return;
    }
    fetchLiveResults(query);
  });

  // Handle Enter key press
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

  // Hide live dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const container = document.getElementById("navSearchContainer");
    if (container && !container.contains(e.target) && resultsDropdown) {
      resultsDropdown.style.display = "none";
    }
  });
}

// 3. FETCH LIVE SEARCH RESULTS FOR DROPDOWN
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
      alert("Search failed. Ensure search.json exists in your project root.");
    });
}

// 5. HELPER: FETCH search.json WITH SUBFOLDER PATH RESOLUTION
function getSearchData() {
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  
  // Account for GitHub Pages subfolder repositories (e.g. /repo-name/search.json)
  let searchJsonUrl = "/search.json";
  if (pathSegments.length > 0 && !window.location.hostname.includes("localhost")) {
    searchJsonUrl = `/${pathSegments[0]}/search.json`;
  }

  return fetch(searchJsonUrl).then((res) => {
    if (!res.ok) {
      // Fallback relative path lookup
      return fetch("./search.json").then((fallbackRes) => {
        if (!fallbackRes.ok) {
          throw new Error(`HTTP status ${fallbackRes.status} when fetching search.json`);
        }
        return fallbackRes.json();
      });
    }
    return res.json();
  });
}

// 6. CALENDAR TOGGLES & SORTING
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
  const searchJsonUrl = "{{ '/search.json' | relative_url }}";
  
  return fetch(searchJsonUrl).then((res) => {
    if (!res.ok) {
      throw new Error(`HTTP status ${res.status} when fetching ${searchJsonUrl}`);
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
