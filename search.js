fetch("./navbar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;

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
    document.querySelectorAll(".dropdown > a").forEach(link => {
      link.addEventListener("click", (e) => {
        if (window.innerWidth <= 950) {
          e.preventDefault();
          link.parentElement.classList.toggle("open");
        }
      });
    });

    // 3. Search Toggle
    if (searchButton && searchBox) {
      searchButton.addEventListener("click", () => {
        const isHidden = searchBox.style.display === "none";
        searchBox.style.display = isHidden ? "inline-block" : "none";
        if (isHidden) searchBox.focus();
      });
      // 4. NEW: Search Execution Logic

searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const query = searchBox.value.toLowerCase().trim();

        // Instead of searching the HTML, we "fetch" the map of your site
        fetch("./pages.json")
            .then(res => res.json())
            .then(data => {
                // Look for the page that matches the search
                const match = data.find(p => p.content.toLowerCase().includes(query));

                if (match) {
                    window.location.href = match.url; // GO to the page!
                } else {
                    alert("We couldn't find anything for '" + query + "'");
                }
            });
    }
});
          // Optional: Close the search box after searching
          // searchBox.style.display = "none";
        }
      });
  .catch(err => console.error("Nav load error:", err));
    }
  })
  .catch(err => console.error("Nav load error:", err));

// Calendar logic
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("month-toggle")) {
    const table = e.target.nextElementSibling;
    table.style.display = table.style.display === "table" ? "none" : "table";
  }
});
