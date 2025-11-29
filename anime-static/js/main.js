// API Configuration
const API_BASE_URL = "https://rdapi.up.railway.app/api/anime";

// Wait for DOM to be ready
$(document).ready(function () {
  // Hide preloader after content loads
  setTimeout(function () {
    $("#preloader").fadeOut("slow");
  }, 1500);

  // Mobile menu toggle
  $(".dropdown").click(function () {
    $("#menu").toggleClass("show");
  });

  // Dark mode toggle
  const darkModeToggle = $("#darkModeToggle");
  const body = $("body");

  // Check for saved dark mode preference
  if (localStorage.getItem("darkMode") === "enabled") {
    body.addClass("dark");
    darkModeToggle.prop("checked", true);
  }

  darkModeToggle.change(function () {
    if ($(this).is(":checked")) {
      body.addClass("dark");
      localStorage.setItem("darkMode", "enabled");
    } else {
      body.removeClass("dark");
      localStorage.setItem("darkMode", "disabled");
    }
  });

  // Back to top button
  $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
      $("#backToTop").addClass("show");
    } else {
      $("#backToTop").removeClass("show");
    }
  });

  $("#backToTop").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 600);
    return false;
  });

  // Load data from API
  loadOngoingAnime();
  loadSliderData();
  loadPopularAnime();
});

// Load Ongoing Anime from API
function loadOngoingAnime(page = 1) {
  $.ajax({
    url: `${API_BASE_URL}/ongoing?page=${page}`,
    method: "GET",
    success: function (response) {
      if (response.success && response.data) {
        renderAnimeGrid(response.data);
      } else {
        showError("Failed to load anime data");
      }
    },
    error: function (xhr, status, error) {
      console.error("Error loading ongoing anime:", error);
      showError("Failed to connect to API. Please try again later.");
    },
  });
}

// Render Anime Grid
function renderAnimeGrid(animeList) {
  let animeHTML = "";

  animeList.forEach((anime) => {
    const slug = anime.slug || "#";
    const title = anime.title || "Unknown Title";
    const thumb = anime.thumb || "https://via.placeholder.com/300x400/0c70de/ffffff?text=No+Image";
    const episode = anime.episode || "N/A";
    const day = anime.day || "";
    const date = anime.date || "";

    animeHTML += `
            <article class="post-outer-container">
                <div class="thumbnail">
                    <a href="detail.html?slug=${encodeURIComponent(slug)}">
                        <img src="${thumb}" alt="${title}" onerror="this.src='https://via.placeholder.com/300x400/0c70de/ffffff?text=No+Image'">
                    </a>
                    <div class="bt">
                        <span class="tipeps">${episode}</span>
                        <span class="sub">
                            <span class="rate-archive">★</span>
                        </span>
                    </div>
                </div>
                <h3 class="post-title entry-title">
                    <a href="detail.html?slug=${encodeURIComponent(slug)}">${title}</a>
                </h3>
                <div class="post-date">${day} ${date}</div>
            </article>
        `;
  });

  $(".blog-posts.hfeed.item").html(animeHTML);
}

// Load Slider Data
function loadSliderData() {
  // Load first 5 ongoing anime for slider
  $.ajax({
    url: `${API_BASE_URL}/ongoing?page=1`,
    method: "GET",
    success: function (response) {
      if (response.success && response.data) {
        const sliderAnime = response.data.slice(0, 5);
        renderSlider(sliderAnime);
      }
    },
    error: function (xhr, status, error) {
      console.error("Error loading slider data:", error);
      // Fallback to placeholder slider
      renderPlaceholderSlider();
    },
  });
}

// Render Slider with API Data
function renderSlider(animeList) {
  let sliderHTML = "";

  animeList.forEach((anime) => {
    const title = anime.title || "Unknown Title";
    const thumb = anime.thumb || "https://via.placeholder.com/125x180/0c70de/ffffff?text=No+Image";
    const slug = anime.slug || "#";
    const episode = anime.episode || "N/A";

    sliderHTML += `
            <div class="slider-item">
                <div class="slider-wrapp">
                    <div class="thumb overlay">
                        <a href="detail.html?slug=${encodeURIComponent(slug)}">
                            <img src="${thumb}" alt="${title}" onerror="this.src='https://via.placeholder.com/1000x290/0c70de/ffffff?text=No+Image'">
                        </a>
                    </div>
                    <div class="covert">
                        <a href="detail.html?slug=${encodeURIComponent(slug)}">
                            <img src="${thumb}" alt="${title}" onerror="this.src='https://via.placeholder.com/125x180/0c70de/ffffff?text=No+Image'">
                        </a>
                    </div>
                    <div class="post-descript">
                        <div class="post-title">
                            <div class="right-title">
                                <h2 class="post-titlenya">
                                    <a href="detail.html?slug=${encodeURIComponent(slug)}">${title}</a>
                                </h2>
                                <div class="post-tag">
                                    <span class="type-poss">${episode}</span>
                                </div>
                            </div>
                        </div>
                        <div class="post-sinop">
                            <strong>Latest Episode</strong>
                            <p>${episode}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
  });

  $(".owl_carouselle").html(sliderHTML);
  initOwlCarousel();
}

// Render Placeholder Slider (fallback)
function renderPlaceholderSlider() {
  const sliderHTML = `
        <div class="slider-item">
            <div class="slider-wrapp">
                <div class="thumb overlay">
                    <img src="https://via.placeholder.com/1000x290/0c70de/ffffff?text=Loading..." alt="Placeholder">
                </div>
                <div class="post-descript">
                    <div class="post-title">
                        <h2 class="post-titlenya">Loading Anime Data...</h2>
                    </div>
                    <div class="post-sinop">
                        <p>Please wait while we fetch the latest anime episodes.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

  $(".owl_carouselle").html(sliderHTML);
  initOwlCarousel();
}

// Initialize Owl Carousel
function initOwlCarousel() {
  $(".owl_carouselle").owlCarousel({
    loop: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 5000,
    items: 1,
    nav: true,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
  });
}

// Load Popular Anime
function loadPopularAnime() {
  // Use complete anime as popular (you can change this endpoint)
  $.ajax({
    url: `${API_BASE_URL}/complete?page=1`,
    method: "GET",
    success: function (response) {
      if (response.success && response.data) {
        const popularAnime = response.data.slice(0, 5);
        renderPopularPosts(popularAnime);
      }
    },
    error: function (xhr, status, error) {
      console.error("Error loading popular anime:", error);
    },
  });
}

// Render Popular Posts
function renderPopularPosts(animeList) {
  let popularHTML = "";

  animeList.forEach((anime) => {
    const title = anime.title || "Unknown Title";
    const thumb = anime.thumb || "https://via.placeholder.com/45x65/0c70de/ffffff?text=No+Image";
    const slug = anime.slug || "#";
    const rating = anime.rating || "N/A";

    popularHTML += `
            <li>
                <img src="${thumb}" alt="${title}" class="post-thumbnail" onerror="this.src='https://via.placeholder.com/45x65/0c70de/ffffff?text=No+Image'">
                <div class="item-content">
                    <a href="detail.html?slug=${encodeURIComponent(slug)}" class="item-title">${title}</a>
                    <span class="tren-tag">Rating: ${rating}</span>
                </div>
            </li>
        `;
  });

  $("#PopularPosts1 ul").html(popularHTML);
}

// Show Error Message
function showError(message) {
  const errorHTML = `
        <div style="padding: 20px; text-align: center; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; margin: 10px;">
            <i class="fa fa-exclamation-triangle" style="color: #ff9800; font-size: 24px;"></i>
            <p style="margin: 10px 0; color: #856404;">${message}</p>
            <p style="font-size: 12px; color: #666;">Please check your internet connection and try again.</p>
        </div>
    `;
  $(".blog-posts.hfeed.item").html(errorHTML);
}

// Tab functionality for popular posts
$("#tabspop li").click(function () {
  const index = $(this).index();
  $("#tabspop li").removeClass("current");
  $(this).addClass("current");

  // Load different data based on tab
  if (index === 0) {
    loadPopularAnime(); // Today
  } else if (index === 1) {
    loadPopularAnime(); // Week (same for now)
  } else {
    loadPopularAnime(); // Month (same for now)
  }
});

// Search functionality
$("#form").submit(function (e) {
  e.preventDefault();
  const query = $("#q").val();
  if (query) {
    // Redirect to search results
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
  }
});

// Pagination
$(".blog-pager-older-link").click(function (e) {
  e.preventDefault();
  const currentPage = parseInt($(this).data("page") || 1);
  loadOngoingAnime(currentPage + 1);
  $(this).data("page", currentPage + 1);
});

$(".blog-pager-newer-link").click(function (e) {
  e.preventDefault();
  const currentPage = parseInt($(".blog-pager-older-link").data("page") || 1);
  if (currentPage > 1) {
    loadOngoingAnime(currentPage - 1);
    $(".blog-pager-older-link").data("page", currentPage - 1);
  }
});
