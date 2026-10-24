document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  setupNavbar();
  setupSearch();
  initCalendar();
}

function setupNavbar() {
  const hamburger = document.getElementById("hamburger") || 
                    document.querySelector(".hamburger") || 
                    document.querySelector(".menu-toggle");
  
  const menu = document.getElementById("menu") || document.querySelector(".menu");

  if (hamburger && menu) {
    hamburger.addEventListener("click", () => {
      menu.classList.toggle("active");
    });
  }

  // Mobile dropdown toggles
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

  // Toggle search box display on search icon click
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

  // Handle typing inside the search box
  box.addEventListener("input", () => {
    const query = box.value.trim().toLowerCase();

    if (!query) {
      if (resultsDropdown) resultsDropdown.style.display = "none";
      document.querySelectorAll(".month").forEach((month) => {
        month.style.display = "";
      });
      return;
    }

    fetchLiveResults(query);
  });

  // Handle Enter keypress to navigate to matched page
  box.addEventListener("keypress", (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const query = box.value.trim().toLowerCase();
    if (!query) return;

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
            safeUrl = match.url.startsWith("/") ? match.url : "/" + match.url;
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
        const targetUrl = match.url.startsWith("/") ? match.url : "/" + match.url;
        window.location.href = targetUrl;
      } else {
        alert("Sorry! Couldn't find anything for '" + query + "'");
      }
    })
    .catch((error) => {
      console.error("Search error:", error);
      alert("Search failed. Ensure search.json exists in your project root.");
    });
}

function getSearchData() {
  const searchUrl = window.location.pathname.includes('/testweb2') 
    ? '/testweb2/search.json' 
    : './search.json';

  return fetch(searchUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .catch((error) => {
      console.error("Fetch search.json error:", error);
      return [];
    });
}

function initEvents() {
    const container = document.getElementById("months-container");
    if (!container) return;

    const months = Array.from(container.querySelectorAll(".month"));
    months.sort((a, b) => {
        const aDate = a.getAttribute('data-month') || "";
        const bDate = b.getAttribute('data-month') || "";
        return aDate.localeCompare(bDate);
    });
    months.forEach(month => container.appendChild(month));

    container.onclick = function(e) {
        if (e.target.classList.contains("month-toggle")) {
            const table = e.target.nextElementSibling;
            if (table) table.classList.toggle("show");
        }
    };
}

window.addEventListener("load", initEvents);
