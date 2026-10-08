fetch("./navbar.html")
  .then((response) => {
    if (!response.ok) throw new Error("Failed to load navbar.html");
    return response.text();
  })
  .then((data) => {
    const navContainer = document.getElementById("navbar");
    if (navContainer) {
      navContainer.innerHTML = data;
    }

    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("menu");
    const searchButton = document.getElementById("searchButton");
    const searchBox = document.getElementById("searchBox");

    // 1. Hamburger Toggle
    if (hamburger && menu) {
      hamburger.addEventListener("click", () => {
        menu.classList.toggle("active");
      });
    }

    // 2. Mobile Dropdown (About Us)
    document.querySelectorAll(".dropdown > a").forEach((link) => {
      link.addEventListener("click", (e) => {
        if (window.innerWidth <= 950) {
          e.preventDefault();
          if (link.parentElement) {
            link.parentElement.classList.toggle("open");
          }
        }
      });
    });

    // 3. Search Toggle & Keypress Logic
    if (searchButton && searchBox) {
      searchButton.addEventListener("click", () => {
        const isHidden = window.getComputedStyle(searchBox).display === "none";
        searchBox.style.display = isHidden ? "inline-block" : "none";
        if (isHidden) searchBox.focus();
      });

      searchBox.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const query = searchBox.value.toLowerCase().trim();
          if (!query) return;

          fetch("./search.json")
            .then((res) => {
              if (!res.ok) throw new Error("search.json not found");
              return res.json();
            })
            .then((data) => {
              const match = data.find((p) => {
                const title = p.title ? p.title.toLowerCase() : "";
                const content = p.content ? p.content.toLowerCase() : "";
                return title.includes(query) || content.includes(query);
              });

              if (match && match.url) {
                window.location.href = match.url;
              } else {
                alert("We couldn't find anything for '" + query + "'");
              }
            })
            .catch((err) => {
              console.error("Search fetch error:", err);
              alert("Could not load search data. Ensure search.json exists.");
            });
        }
      });
    }
  })
  .catch((err) => console.error("Nav load error:", err));

// Calendar logic
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("month-toggle")) {
    const table = e.target.nextElementSibling;
    if (table) {
      const isHidden = window.getComputedStyle(table).display === "none";
      table.style.display = isHidden ? "table" : "none";
    }
  }
});
