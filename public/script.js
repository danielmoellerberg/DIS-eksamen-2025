document.addEventListener("DOMContentLoaded", () => {

  const heroPlayerEl = document.getElementById("heroPlayer");
  if (heroPlayerEl && window.cloudinary && window.cloudinary.videoPlayer) {
    const cloudName = heroPlayerEl.dataset.cloudName;
    const publicId = heroPlayerEl.dataset.publicId;

    if (cloudName && publicId) {
      const player = cloudinary.videoPlayer("heroPlayer", {
        cloud_name: cloudName,
        controls: false,
        autoplayMode: "always",
        loop: true,
        muted: true,
        playsinline: true,
        showLogo: false,
      });

      player.source(publicId, {
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
    }
  }

  // Filtrering
  const searchInput = document.getElementById("searchInput");
  const cards = document.querySelectorAll(".event.card");
  const chips = document.querySelectorAll(".chip");
  const categoryCards = document.querySelectorAll(".category.card");

  let activeCategory = "Alle";

  function applyFilters() {
      const searchValue = searchInput ? searchInput.value.toLowerCase() : "";

      cards.forEach(card => {
          const title = card.querySelector("h3").textContent.toLowerCase();
          const description = card.querySelector("p").textContent.toLowerCase();

          const matchesSearch =
              title.includes(searchValue) ||
              description.includes(searchValue);

          const matchesCategory =
              activeCategory === "Alle" ||
              description.includes(activeCategory);

          card.style.display = (matchesSearch && matchesCategory) ? "block" : "none";
      });
  }

  if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
  }

  chips.forEach(chip => {
      chip.addEventListener("click", () => {

          chips.forEach(c => c.classList.remove("active"));
          chip.classList.add("active");

          activeCategory = chip.dataset.category;
          applyFilters();
      });
  });

  categoryCards.forEach(card => {
      card.addEventListener("click", () => {

          const cat = card.dataset.category;

          chips.forEach(c => c.classList.remove("active"));
          chips.forEach(c => {
              if (c.dataset.category === cat) {
                  c.classList.add("active");
              }
          });

          activeCategory = cat;
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
