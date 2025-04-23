// Article page implementation

// 1. First, let's modify the displayArticles function to add click event handlers
function displayArticles(articles) {
  const newsSection = $("#news-section");

  // Keep the section title row
  const sectionTitle = newsSection.find(".col-12").first();
  newsSection.empty();
  newsSection.append(sectionTitle);

  // Add articles to the news section
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    // First article displayed in large format
    const featuredHtml = `
                  <div class="col-lg-12">
                      <div class="row news-lg mx-0 mb-3">
                          <div class="col-md-6 h-100 px-0 bg-white">
                              <img class="img-fluid h-100" src="${
                                article.coverImage
                              }" 
                                   style="object-fit: cover" alt="${
                                     article.title
                                   }"/>
                          </div>
                          <div class="col-md-6 d-flex flex-column border bg-white h-100 px-0">
                              <div class="mt-auto p-4">
                                  <div class="mb-2">
                                      <a class="badge badge-primary text-uppercase font-weight-semi-bold p-2 mr-2" href="">
                                          ${article.category || "Business"}
                                      </a>
                                      <a class="text-body" href="">
                                          <small>${formatDate(
                                            article.publishedAt
                                          )}</small>
                                      </a>
                                  </div>
                                  <a class="h4 d-block mb-3 text-secondary text-uppercase font-weight-bold article-link" 
                                     href="javascript:void(0);" data-article-id="${
                                       article.id
                                     }">
                                      ${article.title}
                                  </a>
                                  <p class="m-0">${truncateText(
                                    article.content,
                                    150
                                  )}</p>
                              </div>
                              <div class="d-flex justify-content-between bg-white border-top mt-auto p-4">
                                  <div class="d-flex align-items-center">
                                      <img class="rounded-circle mr-2" src="img/user.jpg" width="25" height="25" alt="" />
                                      <small>${article.reporter}</small>
                                  </div>
                                  <div class="d-flex align-items-center">
                                      <small class="ml-3"><i class="far fa-eye mr-2"></i>${
                                        article.viewCount || 0
                                      }</small>
                                      <small class="ml-3"><i class="far fa-comment mr-2"></i>123</small>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>`;

    newsSection.append(featuredHtml);
  }

  // Add click event handlers to article links
  $(".article-link").on("click", function () {
    const articleId = $(this).data("article-id");
    openArticlePage(articleId);
  });
}

// 2. Function to handle opening the article page
function openArticlePage(articleId) {
  // Store the article ID in localStorage to retrieve it on the article page
  localStorage.setItem("selectedArticleId", articleId);

  // Navigate to the article page
  window.location.href = "single.html";
}

// 3. Function to load article data on the article page
function loadArticleData() {
  // Check if we're on the article page
  if (window.location.pathname.includes("single.html")) {
    const articleId = localStorage.getItem("selectedArticleId");

    if (articleId) {
      console.log("Article ID:", articleId);

      // Fetch the article data - this could be from your API or from localStorage
      fetchArticleById(articleId);
    }
  }
}

// 4. Function to fetch article by ID (modify this to use your actual data source)
function fetchArticleById(articleId) {
  console.log("Fetching article by ID:", articleId);
  $.ajax({
    url: `http://localhost:8080/newsl/api/v1/article/${articleId}`,
    type: "GET",
    success: function (article) {
      console.log("Fetched article data:", article);
      populateArticlePage(article);
    },
    error: function (xhr, status, error) {
      console.error("Error fetching article:", error);
    },
  });
}
// 5. Function to populate the article page with data
function populateArticlePage(article) {
  console.log("Populating article page with data:", article);

  // Update the title
  document.title = article.title + " - NewSL newscraft";

  // Update the main article content
  $(".position-relative.mb-3 .bg-white.border.border-top-0.p-4 h1").text(
    article.title
  );

  // Update the category and date
  $(".position-relative.mb-3 .badge-primary").text(
    article.category || "Business"
  );
  $(".position-relative.mb-3 .text-body").text(formatDate(article.publishedAt));

  // Update the main image
  $(".position-relative.mb-3 img.img-fluid.w-100").attr(
    "src",
    article.coverImage
  );

  // Update the content paragraphs
  const contentParagraphs = article.content.split("\n\n");

  // Clear existing paragraphs
  $(".position-relative.mb-3 .bg-white.border.border-top-0.p-4 p").remove();

  // Add new paragraphs
  const contentContainer = $(
    ".position-relative.mb-3 .bg-white.border.border-top-0.p-4"
  );
  contentParagraphs.forEach((paragraph) => {
    contentContainer.append(`<p>${paragraph}</p>`);
  });

  // Update author information
  $(".position-relative.mb-3 .d-flex.justify-content-between span:first").text(
    article.reporter
  );

  // Update view count
  $(".position-relative.mb-3 .far.fa-eye")
    .next()
    .text(article.viewCount || 0);
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Initialize the page
$(document).ready(function () {
  loadArticleData();

  // If this is the index page and you want to display articles
  if (
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/"
  ) {
    // Fetch articles and display them
    fetchArticles()
      .then((articles) => {
        displayArticles(articles);
      })
      .catch((error) => {
        console.error("Error loading articles:", error);
      });
  }
});

// Example function to fetch articles
function fetchArticles() {
  // This is a placeholder. In a real application, you would fetch from an API
  return new Promise((resolve, reject) => {
    // For demonstration, we'll use sample data
    const articles = [
      {
        id: "1",
        title: "Global Economic Summit Concludes with New Trade Agreements",
        category: "Economy",
        content:
          "The Global Economic Summit concluded yesterday with the signing of several important trade agreements between major economic powers. These agreements are expected to boost global trade by an estimated 3.5% in the coming year.\n\nLeaders from G20 nations discussed various strategies to address economic inequality and climate change, with a focus on sustainable development. The summit highlighted the importance of digital transformation in fostering economic growth across developing nations.\n\nExperts predict these new agreements will help stabilize markets that have been volatile in recent months. 'This represents a significant step forward in international cooperation,' stated IMF Director Kristalina Georgieva.",
        publishedAt: "2025-04-15T09:30:00",
        reporter: "Sarah Johnson",
        coverImage: "img/news-700x435-1.jpg",
        viewCount: 2345,
      },
      {
        id: "2",
        title: "Breakthrough in Renewable Energy Storage Announced",
        category: "Technology",
        content:
          "Scientists at MIT have announced a breakthrough in energy storage technology that could revolutionize how renewable energy is stored and distributed. The new battery technology uses abundant, non-toxic materials and can store energy for significantly longer periods than current lithium-ion batteries.\n\nThe research team claims the technology can reduce storage costs by up to 70% while increasing capacity by 300%. This development could be the missing link needed for widespread adoption of solar and wind energy sources.\n\nThe technology is expected to be commercially viable within 3-5 years, pending further testing and scaling of production processes.",
        publishedAt: "2025-04-20T14:15:00",
        reporter: "Michael Chang",
        coverImage: "img/news-700x435-2.jpg",
        viewCount: 1856,
      },
    ];

    // Store articles in localStorage for demo purposes
    localStorage.setItem("articles", JSON.stringify(articles));

    resolve(articles);
  });
}
