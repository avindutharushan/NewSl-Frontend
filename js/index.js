// Document ready function to ensure DOM is fully loaded
$(document).ready(function () {
  // Call loadArticles function when the page loads
  loadArticles();
});

// Function to load articles from API
function loadArticles() {
  let url = "http://localhost:8080/newsl/api/v1/article";

  $.ajax({
    url: url,
    type: "GET",

    dataType: "json",
    success: function (data) {
      displayArticles(data);
    },
    error: function (error) {
      console.error("Error loading articles:", error);
      displayFallbackContent();
    },
  });
}

// Function to display articles in the news section
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
                                <a class="h4 d-block mb-3 text-secondary text-uppercase font-weight-bold" href="">
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
}

// Display fallback content if API fails
function displayFallbackContent() {
  const newsSection = $("#news-section");
  const sectionTitle = newsSection.find(".col-12").first();
  newsSection.empty();
  newsSection.append(sectionTitle);

  // Use the existing template content as fallback
  const fallbackHtml = `
        <div class="col-lg-12">
            <div class="row news-lg mx-0 mb-3">
                <div class="col-md-6 h-100 px-0">
                    <img class="img-fluid h-100" src="img/news-700x435-5.jpg" style="object-fit: cover" />
                </div>
                <div class="col-md-6 d-flex flex-column border bg-white h-100 px-0">
                    <div class="mt-auto p-4">
                        <div class="mb-2">
                            <a class="badge badge-primary text-uppercase font-weight-semi-bold p-2 mr-2" href="">Business</a>
                            <a class="text-body" href=""><small>Jan 01, 2045</small></a>
                        </div>
                        <a class="h4 d-block mb-3 text-secondary text-uppercase font-weight-bold" href="">
                            Lorem ipsum dolor sit amet elit...
                        </a>
                        <p class="m-0">
                            Dolor lorem eos dolor duo et eirmod sea. Dolor sit magna rebum clita rebum dolor stet amet justo
                        </p>
                    </div>
                    <div class="d-flex justify-content-between bg-white border-top mt-auto p-4">
                        <div class="d-flex align-items-center">
                            <img class="rounded-circle mr-2" src="img/user.jpg" width="25" height="25" alt="" />
                            <small>John Doe</small>
                        </div>
                        <div class="d-flex align-items-center">
                            <small class="ml-3"><i class="far fa-eye mr-2"></i>12345</small>
                            <small class="ml-3"><i class="far fa-comment mr-2"></i>123</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  newsSection.append(fallbackHtml);
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return "Jan 01, 2045";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
function siglepage(article) {
  window.location.href = `singlepage.html?articleId=${article.id}`;
}
