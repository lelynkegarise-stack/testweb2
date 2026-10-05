document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  setupNavbar();
  setupSearch();
  initCalendar();
}

function setupNavbar() {
  const hamburger = document.getElementById("hamburger");
  const menu = document.getElementById("menu");

  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      menu.classList.toggle("active");
    });
  }

  document.querySelectorAll(".dropdown > a").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 950) {
        e.preventDefault();
        const parent = link.parentElement;
        if (parent) parent.classList.toggle("open");
      }
    });
  });
}

function setupSearch() {
  const box = document.getElementById("searchBox");
  const resultsDropdown = document.getElementById("searchResults");
  const navSearchContainer = document.getElementById("navSearchContainer");

  document.addEventListener("click", (event) => {
    const searchButton = event.target.closest("#searchButton");
    if (searchButton && box) {
      event.preventDefault();
      const isHidden = window.getComputedStyle(box).display === "none";
      box.style.display = isHidden ? "inline-block" : "none";

      if (isHidden) {
        box.focus();
      } else if (resultsDropdown) {
        resultsDropdown.style.display = "none";
      }
      return;
    }

    if (navSearchContainer && !navSearchContainer.contains(event.target) && resultsDropdown) {
      resultsDropdown.style.display = "none";
    }
  });

  if (!box) return;

  box.addEventListener("input", () => {
    const query = box.value.trim().toLowerCase();
    if (!query) {
      if (resultsDropdown) resultsDropdown.style.display = "none";
      return;
    }
    fetchLiveResults(query);
  });

  box.addEventListener("keypress", (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const query = box.value.trim().toLowerCase();
    if (!query) return;

    if (window.location.pathname.includes("calendar")) {
      const months = document.querySelectorAll(".month");
      let foundMatch = false;

      months.forEach((month) => {
        const monthText = month.innerText.toLowerCase();
        const table = month.querySelector(".month-table");

        if (monthText.includes(query)) {
          month.style.display = "block";
          foundMatch = true;
          if (table) table.classList.add("show");
        } else {
          month.style.display = "none";
        }
      });

      if (!foundMatch) {
        runGlobalSearch(query);
      } else if (resultsDropdown) {
        resultsDropdown.style.display = "none";
      }
      return;
    }

    runGlobalSearch(query);
  });
}

function fetchLiveResults(query) {
  const resultsDropdown = document.getElementById("searchResults");
  if (!resultsDropdown) return;

  getSearchData()
    .then((data) => {
      if (!Array.isArray(data)) return;

      const matches = data.filter((page) => {
        if (!page) return false;
        const title = page.title ? String(page.title).toLowerCase() : "";
        const content = page.content ? String(page.content).toLowerCase() : "";
        return title.includes(query) || content.includes(query);
      });

      resultsDropdown.innerHTML = "";

      if (matches.length > 0) {
        matches.slice(0, 5).forEach((match) => {
          const item = document.createElement("li");
          const link = document.createElement("a");

          let safeUrl = "#";
          if (match.url) {
            try {
              safeUrl = encodeURI(String(match.url).trim());
            } catch (err) {
              safeUrl = String(match.url).trim();
            }
          }

          link.href = safeUrl;
          link.textContent = match.title ? String(match.title).trim() : "Untitled Page";
          item.appendChild(link);
          resultsDropdown.appendChild(item);
        });

        resultsDropdown.style.display = "block";
      } else {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.textContent = "No results found";
        link.style.cursor = "default";
        item.appendChild(link);
        resultsDropdown.appendChild(item);
        resultsDropdown.style.display = "block";
      }
    })
    .catch((error) => {
      console.error("Search fetch error:", error);
    });
}

function runGlobalSearch(query) {
  getSearchData()
    .then((data) => {
      if (!Array.isArray(data)) return;

      const match = data.find((page) => {
        if (!page) return false;
        const title = page.title ? String(page.title).toLowerCase() : "";
        const content = page.content ? String(page.content).toLowerCase() : "";
        return title.includes(query) || content.includes(query);
      });

      if (match && match.url) {
        window.location.href = encodeURI(String(match.url).trim());
      } else {
        alert("Sorry! Couldn't find anything for '" + query + "'");
        const months = document.querySelectorAll(".month");
        months.forEach((month) => {
          month.style.display = "block";
        });
      }
    })
    .catch((error) => {
      console.error("Search error:", error);
      alert("Search failed. Ensure search.json exists in your project root.");
    });
}

function getSearchData() {
  const origin = window.location.origin;
  const pathSegments = window.location.pathname.split("/").filter(Boolean);

  let searchUrl = "/search.json";
  if (pathSegments.length > 0 && !window.location.hostname.includes("localhost")) {
    searchUrl = `/${pathSegments[0]}/search.json`;
  }

  return fetch(searchUrl)
    .then((response) => {
      if (!response.ok) {
        return fetch(`${origin}/search.json`).then((fallbackResponse) => {
          if (!fallbackResponse.ok) {
            throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
          }
          return fallbackResponse.json();
        });
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Fetch helper error:", error);
      return [];
    });
}

function initCalendar() {
  const container = document.getElementById("months-container");
  if (!container) return;

  const months = Array.from(container.querySelectorAll(".month"));
  months.sort((a, b) =>
    (a.getAttribute("data-month") || "").localeCompare(
      b.getAttribute("data-month") || ""
    )
  );

  months.forEach((month) => {
    container.appendChild(month);
  });

  container.addEventListener("click", (event) => {
    if (event.target.classList.contains("month-toggle")) {
      const table = event.target.nextElementSibling;
      if (table) {
        table.classList.toggle("show");
      }
    }
  });
}
