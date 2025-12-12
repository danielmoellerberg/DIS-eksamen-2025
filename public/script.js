document.addEventListener("DOMContentLoaded", () => {

  // Filtrering
  const searchInput = document.getElementById("searchInput");
  const cards = document.querySelectorAll(".event.card");
  const chips = document.querySelectorAll(".chip");
  const categoryCards = document.querySelectorAll(".category.card");

  let activeCategory = "Alle";

  // Kategori mapping - map visningsnavn til database kategori
  const categoryMap = {
    "Workshops": "Workshop",
    "Guidede ture": "Guidet tur",
    "Natur": "Natur",
    "Madoplevelser": "Mad",
    "Kreativitet": "Kreativitet"
  };

  // Filtrerer events baseret på søgetekst og valgt kategori og viser/skjuler event cards
  function applyFilters() {
      const searchValue = searchInput ? searchInput.value.toLowerCase() : "";

      cards.forEach(card => {
          const title = card.querySelector("h3").textContent.toLowerCase();
          const description = card.querySelector("p").textContent.toLowerCase();
          const cardCategory = card.dataset.category || "";

          const matchesSearch =
              title.includes(searchValue) ||
              description.includes(searchValue);

          let matchesCategory = true;
          if (activeCategory !== "Alle") {
              // Map visningsnavn til database kategori
              const dbCategory = categoryMap[activeCategory] || activeCategory;
              matchesCategory = cardCategory === dbCategory;
          }

          card.style.display = (matchesSearch && matchesCategory) ? "block" : "none";
      });

      // Vis "Ingen events fundet" besked hvis ingen kort er synlige
      const visibleCards = Array.from(cards).filter(card => card.style.display !== "none");
      const noResultsMessage = document.querySelector(".no-results-message");
      
      if (visibleCards.length === 0 && cards.length > 0) {
          if (!noResultsMessage) {
              const exploreSection = document.getElementById("explore");
              const message = document.createElement("p");
              message.className = "no-results-message";
              message.style.textAlign = "center";
              message.style.padding = "40px";
              message.style.color = "#666";
              message.textContent = "Ingen oplevelser fundet for denne kategori.";
              exploreSection.appendChild(message);
          }
      } else if (noResultsMessage) {
          noResultsMessage.remove();
      }
  }

  if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
  }

  chips.forEach(chip => {
      chip.addEventListener("click", () => {
          chips.forEach(c => c.classList.remove("active"));
          chip.classList.add("active");

          const chipCategory = chip.dataset.category;
          activeCategory = chipCategory === "Alle" ? "Alle" : chipCategory;

          // Opdater kategori kort
          categoryCards.forEach(c => c.classList.remove("active"));
          if (chipCategory !== "Alle") {
              categoryCards.forEach(c => {
                  const cardCategory = c.dataset.category;
                  const cardText = c.querySelector("span").textContent.trim();
                  const mappedCategory = categoryMap[cardText] || cardText;
                  if (cardCategory === chipCategory || mappedCategory === chipCategory) {
                      c.classList.add("active");
                  }
              });
          }

          // Scroll ned til oplevelserne
          const exploreSection = document.getElementById("explore");
          if (exploreSection) {
              exploreSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }

          applyFilters();
      });
  });

  categoryCards.forEach(card => {
      card.addEventListener("click", (e) => {
          e.preventDefault();

          const cat = card.dataset.category;
          const categoryText = card.querySelector("span").textContent.trim();

          // Opdater active kategori
          activeCategory = categoryText;

          // Opdater chips
          chips.forEach(c => c.classList.remove("active"));
          chips.forEach(c => {
              const chipCategory = c.dataset.category;
              const mappedCategory = categoryMap[categoryText] || categoryText;
              if (chipCategory === mappedCategory || chipCategory === categoryText) {
                  c.classList.add("active");
              }
          });

          // Highlight aktiv kategori kort
          categoryCards.forEach(c => c.classList.remove("active"));
          card.classList.add("active");

          // Scroll ned til oplevelserne
          const exploreSection = document.getElementById("explore");
          if (exploreSection) {
              exploreSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }

          applyFilters();
      });
  });


  // Mobil menu funktionalitet
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (burger && mobileMenu) {
      burger.addEventListener("click", () => {
          mobileMenu.classList.toggle("active");
      });

      mobileMenu.querySelectorAll("a").forEach(link => {
          link.addEventListener("click", () => {
              mobileMenu.classList.remove("active");
          });
      });
  }

});
