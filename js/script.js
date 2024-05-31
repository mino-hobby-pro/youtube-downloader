// Load navbar
fetch('navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar-container').innerHTML = data;
  })
  .catch(error => console.error('Error loading navbar:', error));

const videoFeedContainer = document.getElementById('videoFeed');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const popularBtn = document.getElementById('popularBtn');
const trendingBtn = document.getElementById('trendingBtn');
const trendingType = document.getElementById('trendingType');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

let currentFeed = 'popular';
let currentPage = 1;
let isLoading = false;

function clearVideoFeed() {
  videoFeedContainer.innerHTML = '';
  loadMoreContainer.style.display = 'none';
  currentPage = 1;
}

function fetchVideos(endpoint, params = {}) {
  isLoading = true;
  toggleControls(true);
  showLoadingOverlay(); // show because broken

  const url = `https://vid.puffyan.us/api/v1/${endpoint}?${new URLSearchParams(params)}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      displayVideos(data);
      isLoading = false;
      toggleControls(false);
      hideLoadingOverlay(); // hide after load
    })
    .catch(error => {
      console.error('Error fetching videos:', error);
      isLoading = false;
      toggleControls(false);
      hideLoadingOverlay(); // hide if error
      displayErrorMessage(error);
    });
}

function displayVideos(videos) {
  if (currentPage === 1) {
    clearVideoFeed();
  }

  videos.forEach(video => {
    const card = createVideoCard(video);
    videoFeedContainer.appendChild(card);
  });

  if (videos.length > 0) {
    loadMoreContainer.style.display = 'block';
  }
}

function createVideoCard(item) {
  const card = document.createElement('div');
  card.classList.add('col-md-4', 'mb-1');

  if (currentFeed === 'search') {
    if (item.type === 'video') {
      let thumbnailUrl = '';
      if (Array.isArray(item.videoThumbnails) && item.videoThumbnails.length > 0) {
        thumbnailUrl = item.videoThumbnails[0].url;
      } else {
        thumbnailUrl = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
      }

      card.innerHTML = `
        <a href="viewer?id=${item.videoId}" class="text-decoration-none text-white">
          <div class="member-card p-3 rounded-card tilt-card">
            <div class="row g-4">
              <div class="col-md-12 position-relative">
                <div class="thumbnail-placeholder">
                  <div class="loading-spinner"></div>
                </div>
                <img src="${thumbnailUrl}" class="card-img-top rounded" alt="${item.title}" onload="this.previousElementSibling.style.display = 'none';">
              </div>
              <div class="col-12">
                <div class="card-body">
                  <h5 class="card-title">${item.title}</h5>
                  <p class="card-text mb-1">By: ${item.author}</p>
                  <p class="card-text mb-1">Views: ${item.viewCount}</p>
                  <p class="card-text mb-3">Published: ${item.publishedText}</p>
                </div>
              </div>
            </div>
          </div>
        </a>
      `;
    } else if (item.type === 'playlist') {
      card.innerHTML = `
        <a href="#" class="text-decoration-none text-white">
          <div class="member-card p-3 rounded-card tilt-card">
            <div class="row g-4">
              <div class="col-md-12">
                <img src="${item.playlistThumbnail}" class="card-img-top rounded" alt="${item.title}">
              </div>
              <div class="col-12">
                <div class="card-body">
                  <h5 class="card-title">${item.title}</h5>
                  <p class="card-text mb-1">By: ${item.author}</p>
                  <p class="card-text mb-1">Video Count: ${item.videoCount}</p>
                </div>
              </div>
            </div>
          </div>
        </a>
      `;
    } else if (item.type === 'channel') {
      let thumbnailUrl = '';
      if (Array.isArray(item.authorThumbnails) && item.authorThumbnails.length > 0) {
        thumbnailUrl = item.authorThumbnails[0].url;
      } else {
        thumbnailUrl = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
      }

      card.innerHTML = `
        <a href="/channel?id=${item.authorId}" target="_blank" class="text-decoration-none text-white">
          <div class="member-card p-3 rounded-card tilt-card">
            <div class="row g-4">
              <div class="col-md-7 position-relative">
                <div class="thumbnail-placeholder">
                  <div class="loading-spinner"></div>
                </div>
                <img src="${thumbnailUrl}" class="card-img-top rounded" alt="${item.author}" onload="this.previousElementSibling.style.display = 'none';">
              </div>
              <div class="col-12">
                <div class="card-body">
                  <h5 class="card-title">${item.author}</h5>
                  <p class="card-text mb-1">Subscriber Count: ${item.subCount}</p>
                  <p class="card-text mb-1">Video Count: ${item.videoCount}</p>
                </div>
              </div>
            </div>
          </div>
        </a>
      `;
    }
  } else {
    let thumbnailUrl = '';
    if (Array.isArray(item.videoThumbnails) && item.videoThumbnails.length > 0) {
      thumbnailUrl = item.videoThumbnails[0].url;
    } else {
      thumbnailUrl = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
    }

    card.innerHTML = `
      <a href="viewer?id=${item.videoId}" class="text-decoration-none text-white">
        <div class="member-card p-3 rounded-card tilt-card">
          <div class="row g-4">
            <div class="col-md-12 position-relative">
              <div class="thumbnail-placeholder">
                <div class="loading-spinner"></div>
              </div>
              <img src="${thumbnailUrl}" class="card-img-top rounded" alt="${item.title}" onload="this.previousElementSibling.style.display = 'none';">
            </div>
            <div class="col-12">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text mb-1">By: ${item.author}</p>
                <p class="card-text mb-1">Views: ${item.viewCount}</p>
                <p class="card-text mb-3">Published: ${item.publishedText}</p>
              </div>
            </div>
          </div>
        </div>
      </a>
    `;
  }

  return card;
}


function displayErrorMessage(error) {
  const errorMessage = document.createElement('div');
  errorMessage.classList.add('alert', 'alert-danger', 'text-center');
  errorMessage.textContent = `Error: ${error.message}`;
  videoFeedContainer.appendChild(errorMessage);
}

function toggleControls(disabled) {
  popularBtn.disabled = disabled;
  trendingBtn.disabled = disabled;
  trendingType.disabled = disabled || (currentFeed !== 'trending' && currentFeed !== 'search');
  loadMoreContainer.style.display = currentFeed === 'search' ? 'block' : 'none';
}

function handlePopularClick() {
  currentFeed = 'popular';
  trendingType.disabled = true;
  fetchVideos('popular');
}

function handleTrendingClick() {
  currentFeed = 'trending';
  trendingType.disabled = false;
  fetchMultipleEndpoints();
}

function handleTrendingTypeChange() {
  if (currentFeed === 'trending') {
    const selectedType = trendingType.value;
    if (selectedType === 'everything') {
      fetchMultipleEndpoints();
    } else {
      fetchVideos('trending', { type: selectedType });
    }
  }
}
function fetchMultipleEndpoints() {
  isLoading = true;
  toggleControls(true);
  showLoadingOverlay(); // show loading fix :3

  const endpoints = [
    { url: 'https://vid.puffyan.us/api/v1/trending?type=music', type: 'music' },
    { url: 'https://vid.puffyan.us/api/v1/trending?type=gaming', type: 'gaming' },
    { url: 'https://vid.puffyan.us/api/v1/trending?type=news', type: 'news' },
    { url: 'https://vid.puffyan.us/api/v1/trending?type=movies', type: 'movies' },
    { url: 'https://vid.puffyan.us/api/v1/trending?type=all', type: 'all' }
  ];

  const promises = endpoints.map(endpoint =>
    fetch(endpoint.url)
      .then(response => response.json())
      .then(data => data.map(item => ({ ...item, type: endpoint.type })))
  );

  Promise.all(promises)
    .then(results => {
      const combinedResults = results.flatMap(result => result);
      const uniqueVideos = Array.from(new Map(combinedResults.map(item => [item.videoId, item])).values());
      displayVideos(uniqueVideos);
      isLoading = false;
      toggleControls(false);
      hideLoadingOverlay();
    })
    .catch(error => {
      console.error('Error fetching videos:', error);
      isLoading = false;
      toggleControls(false);
      hideLoadingOverlay();
      displayErrorMessage(error);
    });
}

function handleSearchClick() {
  currentFeed = 'search';
  trendingType.disabled = true;
  const query = searchInput.value.trim();
  if (query) {
    fetchVideos('search', { q: query });
  }
}

// handle when in search feed and 
function handleLoadMoreClick() {
  currentPage++;
  const params = currentFeed === 'search' ? { q: searchInput.value.trim(), page: currentPage } : { page: currentPage };
  fetchVideos(currentFeed, params);
}

// loading overlay 
function showLoadingOverlay() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
  }
}

function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

popularBtn.addEventListener('click', handlePopularClick);
trendingBtn.addEventListener('click', handleTrendingClick);
trendingType.addEventListener('change', handleTrendingTypeChange);
searchBtn.addEventListener('click', handleSearchClick);
loadMoreBtn.addEventListener('click', handleLoadMoreClick);

// Initial load
handlePopularClick();