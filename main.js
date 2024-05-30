// Load navbar
fetch('navbar.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('navbar-container').innerHTML = data;
  })
  .catch(error => console.error('Error loading navbar:', error));

const videoContainer = document.getElementById('video-container');
const categorySelect = document.getElementById('category-select');
const filterButtons = document.querySelectorAll('[data-filter]');
const searchResults = document.getElementById('search-results');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
let loadMoreButton = document.getElementById('load-more-button');

let currentFilter = 'popular';
let isLoading = false;
let currentPage = 1;
let searchQuery = '';

function fetchVideos(filter = 'popular', category = '') {
  const apiUrl = filter === 'popular'
    ? 'https://yewtu.be/api/v1/popular'
    : `https://yewtu.be/api/v1/trending?${category ? `type=${category}` : ''}`;

  isLoading = true;
  toggleLoadingState(true);
  loadMoreButton.disabled = true;

  if (currentFilter === 'popular'){
    categorySelect.disabled = true;
  };
  if (currentFilter === 'trending'){
    categorySelect.disabled = false;
  };
  if (currentFilter === 'search'){
    categorySelect.disabled = true;
  };
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      videoContainer.innerHTML = '';
      const fragment = document.createDocumentFragment();
      data.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.classList.add('col');

        videoElement.innerHTML = `
          <a href="viewer.html?id=${video.videoId}" class="text-decoration-none text-white">
            <div class="member-card p-3 rounded-card">
              <div class="row g-4">
                <div class="col-12">
                  <img src="${video.videoThumbnails[0].url}" alt="${video.title}" class="img-fluid rounded mb-3">
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

        fragment.appendChild(videoElement);
      });
      videoContainer.appendChild(fragment);
      isLoading = false;
      toggleLoadingState(false);
    })
    .catch(error => {
      console.error('Error fetching the data:', error);
      isLoading = false;
      toggleLoadingState(false);
    });
}

function searchVideos(query, page = 1) {
    const searchUrl = `https://yewtu.be/api/v1/search?q=${encodeURIComponent(query)}&page=${page}&type=video`;
    loadMoreButton.disabled = false;
  
    isLoading = true;
    toggleLoadingState(true);
  
    fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        const fragment = document.createDocumentFragment();
        data.forEach(video => {
          const videoElement = document.createElement('div');
          videoElement.classList.add('col');
  
          videoElement.innerHTML = `
            <a href="viewer.html?id=${video.videoId}" class="text-decoration-none text-white">
              <div class="member-card p-3 rounded-card">
                <div class="row g-4">
                  <div class="col-12">
                    <img src="${video.videoThumbnails[0].url}" alt="${video.title}" class="img-fluid rounded mb-3">
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
  
          fragment.appendChild(videoElement);
        });
  
        // fuckin stupid ahh line
        if (page === 1) {
          videoContainer.innerHTML = '';
        }
  
        videoContainer.appendChild(fragment);
  
        if (videoContainer.innerHTML === '') {
          videoContainer.innerHTML = '<p class="text-center">No results found.</p>';
        }
  
        isLoading = false;
        toggleLoadingState(false);
  
        if (data.length > 0) {
          if (!loadMoreButton) {
            loadMoreButton = document.createElement('button');
            loadMoreButton.id = 'load-more-button';
            loadMoreButton.className = 'btn btn-primary mt-3';
            loadMoreButton.innerText = 'Load More';
            videoContainer.parentNode.insertBefore(loadMoreButton, videoContainer.nextSibling);
  
            loadMoreButton.addEventListener('click', function() {
              currentPage++;
              searchVideos(searchQuery, currentPage);
            });
          }
          loadMoreButton.style.display = 'block';
        } else if (loadMoreButton) {
          loadMoreButton.style.display = 'none';
        }
      })
      .catch(error => {
        console.error('Error fetching the data:', error);
        isLoading = false;
        toggleLoadingState(false);
      });
  }
// update filter
function updateFilter(filter) {
    currentFilter = filter;
    filterButtons.forEach(button => {
      button.classList.remove('active');
      if (button.dataset.filter === filter && filter !== 'search') {
        button.classList.add('active');
      }
    });
    categorySelect.disabled = filter === 'popular';
    fetchVideos(filter);
  }
// spin wheel
function toggleLoadingState(isLoading) {
    filterButtons.forEach(button => {
      button.disabled = isLoading;
    });
    categorySelect.disabled = isLoading;
  
    if (isLoading) {
      const loadingElement = document.createElement('div');
      loadingElement.classList.add('col', 'text-center');
      loadingElement.innerHTML = `
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      `;
      videoContainer.appendChild(loadingElement);
    } else {
      const loadingElements = videoContainer.querySelectorAll('.spinner-border');
      loadingElements.forEach(element => {
        element.parentNode.remove();
      });
    }
  }
  

fetchVideos();

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (!isLoading) {
      updateFilter(button.dataset.filter);
    }
  });
});

categorySelect.addEventListener('change', () => {
  const selectedCategory = categorySelect.value;
  fetchVideos(currentFilter, selectedCategory);
});

searchButton.addEventListener('click', function() {
    videoContainer.innerHTML = '';
  
    filterButtons.forEach(button => {
      updateFilter('search')
    });

    filterButtons[0].classList.remove('active'); 
  
    categorySelect.disabled = true;
  
    searchQuery = searchInput.value.trim();
    if (searchQuery !== '') {
      currentPage = 1;
      searchVideos(searchQuery, currentPage);
    }
  });
  
  searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
      videoContainer.innerHTML = '';
  
      filterButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('active');
      });
      filterButtons[0].classList.remove('active');
  
      categorySelect.disabled = false;
  
      searchQuery = searchInput.value.trim();
      if (searchQuery !== '') {
        currentPage = 1;
        searchVideos(searchQuery, currentPage);
      }
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    if (loadMoreButton) {
      loadMoreButton.addEventListener('click', function() {
        const currentQuery = searchInput.value.trim();
        if (currentQuery !== '') {
          searchQuery = currentQuery;
          currentPage++;
          searchVideos(searchQuery, currentPage, false); 
        }
      });
    } else {
      console.error('Element with ID "load-more-button" not found.');
    }
  });