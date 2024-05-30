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
    })
    .catch(error => {
      console.error('Error fetching videos:', error);
      isLoading = false;
      toggleControls(false);
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

function createVideoCard(video) {
  const card = document.createElement('div');
  card.classList.add('col-md-4', 'mb-1');

  let thumbnailUrl = '';
  if (Array.isArray(video.videoThumbnails) && video.videoThumbnails.length > 0) {
    thumbnailUrl = video.videoThumbnails[0].url;
  }
  //the code that gave me 100 backaches
  card.innerHTML = `
  <a href="viewer.html?id=${video.videoId}" class="text-decoration-none text-white">
    <div class="member-card p-3 rounded-card tilt-card">
    <div class="row g-4">
        <div class="col-md-12">
          <img src="${video.videoThumbnails[0].url}" class="card-img-top rounded" alt="${video.title}">
        </div>
        <div class="col-12">
          <div class="card-body">
            <h5 class="card-title">${video.title}</h5>
            <p class="card-text mb-1">By: ${video.author}</p>
            <p class="card-text mb-1">Views: ${video.viewCount}</p>
            <p class="card-text mb-3">Published: ${video.publishedText}</p>
          </div>
        </div>
      </div>
    </div>
  </a>
  `;
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
}

function handlePopularClick() {
  currentFeed = 'popular';
  trendingType.disabled = true;
  fetchVideos('popular');
}

function handleTrendingClick() {
  currentFeed = 'trending';
  trendingType.disabled = false;
  fetchVideos('trending', { type: trendingType.value });
}

function handleTrendingTypeChange() {
  if (currentFeed === 'trending') {
    fetchVideos('trending', { type: trendingType.value });
  }
}

function handleSearchClick() {
  currentFeed = 'search';
  trendingType.disabled = true;
  const query = searchInput.value.trim();
  if (query) {
    fetchVideos('search', { q: query });
  }
}

function handleLoadMoreClick() {
  currentPage++;
  const params = currentFeed === 'search' ? { q: searchInput.value.trim(), page: currentPage } : { page: currentPage };
  fetchVideos(currentFeed, params);
}

popularBtn.addEventListener('click', handlePopularClick);
trendingBtn.addEventListener('click', handleTrendingClick);
trendingType.addEventListener('change', handleTrendingTypeChange);
searchBtn.addEventListener('click', handleSearchClick);
loadMoreBtn.addEventListener('click', handleLoadMoreClick);

// Initial load
handlePopularClick();