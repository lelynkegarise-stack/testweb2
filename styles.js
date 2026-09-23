// 1. THE NAVBAR LOAD (Stays the same)
fetch("./navbar.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;
    setupSearch(); // We start the search AFTER the navbar exists
  });

// 2. THE SEARCH LOGIC (The "Smart" part)
function setupSearch() {
  const btn = document.getElementById("searchButton");
  const box = document.getElementById("searchBox");
  if (!btn || !box) return;

  btn.onclick = () => {
    box.style.display = box.style.display === "none" ? "inline-block" : "none";
    box.focus();
  };

  box.onkeypress = (e) => {
    if (e.key === "Enter") {
      const query = box.value.toLowerCase().trim();
      if (!query) return;

      const isCalendar = window.location.href.includes("calendar.html");

      if (isCalendar) {
        const months = document.querySelectorAll(".month");
        let foundAny = false;

        months.forEach(m => {
          if (m.innerText.toLowerCase().includes(query)) {
            m.style.display = "block";
            foundAny = true;
            // This line opens the table automatically if it finds a match!
            const tbl = m.querySelector(".month-table");
            if (tbl) tbl.classList.add("show");
          } else {
            m.style.display = "none";
          }
        });

        // SAFETY HATCH: If "Rentals" isn't on the calendar, jump to the JSON
        if (!foundAny) {
          runGlobalSearch(query);
        }
      } else {
        runGlobalSearch(query);
      }
    }
  };
}

// 3. THE REDIRECT LOGIC (Finds "Rentals" in your JSON)
function runGlobalSearch(query) {
  fetch("./pages.json")
    .then(res => res.json())
    .then(data => {
      const match = data.find(p => 
        p.title.toLowerCase().includes(query) || 
        p.content.toLowerCase().includes(query)
      );
      if (match) {
        window.location.href = match.url;
      } else {
        alert("Sorry! Couldn't find anything for " + query);
        // Put the calendar back to normal so it's not a blank screen
        document.querySelectorAll(".month").forEach(m => m.style.display = "block");
      }
    });
}

// 4. YOUR CALENDAR LOGIC (Untouched and Safe)
function initEvents() {
    const container = document.getElementById("months-container");
    if (!container) return; // This prevents errors on Home/Rentals pages

    const months = Array.from(container.querySelectorAll(".month"));
    months.sort((a, b) => (a.getAttribute('data-month') || "").localeCompare(b.getAttribute('data-month') || ""));
    months.forEach(month => container.appendChild(month));

    container.onclick = function(e) {
        if (e.target.classList.contains("month-toggle")) {
            const table = e.target.nextElementSibling;
            if (table) table.classList.toggle("show");
        }
    };
}

window.addEventListener("load", initEvents);
