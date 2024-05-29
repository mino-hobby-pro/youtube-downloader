function embedVideo(videoId) {
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
  const videoContainer = document.getElementById('video-container');
  videoContainer.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center;">
      <div style="position: relative; padding-bottom: 56.25%; width: 100%; max-width: 1280px;">
        <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  `;

  fetch(`https://vid.puffyan.us/api/v1/videos/${videoId}`)
    .then(response => response.json())
    .then(data => {
      const videoDetails = document.getElementById('video-details');
      const descriptionLines = data.description.split('\n');
      const formattedDescription = descriptionLines.map(line => `<p>${line}</p>`).join('');

      videoDetails.innerHTML = `
      <div class="video-details-card p-4">
          <div class="video-details-header mb-4">
          <h3 class="video-title mb-1">${data.title}</h3>
          <div class="video-published text-muted mb-2">📅 ${new Date(data.published * 1000).toLocaleString()}</div>
          <div class="separator mb-3"></div>
          </div>
          <div class="video-description mb-4">
          ${formattedDescription}
          </div>
          <div class="separator mb-3"></div>
          <div class="video-stats d-flex align-items-center">
          <div class="view-count me-4">
              <span class="view-count-icon">👁️‍🗨️</span>
              <span class="view-count-value">${data.viewCount.toLocaleString()}</span>
          </div>
          <div class="like-count me-4">
              <span class="like-count-icon">👍</span>
              <span class="like-count-value">${data.likeCount}</span>
          </div>
          <div class="dislike-count">
              <span class="dislike-count-icon">👎</span>
              <span class="dislike-count-value">${data.dislikeCount}</span>
          </div>
          </div>
      </div>
      `;

      fetchAndRenderComments(videoId);
    })
    .catch(error => console.error('Error fetching video details:', error));
}

function fetchAndRenderComments(videoId, sortBy = 'top', source = 'youtube', continuation = null, page = 1) {
  const url = `https://vid.puffyan.us/api/v1/comments/${videoId}?sort_by=${sortBy}&source=${source}${continuation ? `&continuation=${continuation}` : ''}`;

  // Check if the buttons exist before trying to disable them
  const topCommentsButton = document.querySelector('#top-comments-button');
  const newCommentsButton = document.querySelector('#new-comments-button');

  if (topCommentsButton && newCommentsButton) {
    topCommentsButton.disabled = true;
    newCommentsButton.disabled = true;
  }

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const commentSection = document.getElementById('comment-section');
      const comments = data.comments;

      commentSection.innerHTML = '';
      const commentBox = document.createElement('div');
      commentBox.classList.add('comment-box', 'mb-4');

      const commentMenu = document.createElement('div');
      commentMenu.classList.add('comment-menu', 'mb-2');

      const topCommentsButton = document.createElement('button');
      topCommentsButton.id = 'top-comments-button';
      topCommentsButton.classList.add('btn', 'btn-outline-light', 'me-2');
      topCommentsButton.textContent = 'Top Comments';
      topCommentsButton.addEventListener('click', () => {
        fetchAndRenderComments(videoId, 'top', source, null, 1);
      });

      const newCommentsButton = document.createElement('button');
      newCommentsButton.id = 'new-comments-button';
      newCommentsButton.classList.add('btn', 'btn-outline-light');
      newCommentsButton.textContent = 'New Comments';
      newCommentsButton.addEventListener('click', () => {
        fetchAndRenderComments(videoId, 'new', source, null, 1);
      });

      commentMenu.appendChild(topCommentsButton);
      commentMenu.appendChild(newCommentsButton);

      // Highlight the active button
      if (sortBy === 'top') {
        topCommentsButton.classList.add('active');
        newCommentsButton.classList.remove('active');
      } else {
        topCommentsButton.classList.remove('active');
        newCommentsButton.classList.add('active');
      }

      // Comment list
      const commentList = document.createElement('div');
      commentList.classList.add('comment-list');
      commentList.style.maxHeight = '300px';
      commentList.style.overflowY = 'auto'; // scroll if comments exceed 300px

      // Render comments
      comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment', 'mb-3');

        const authorThumbnail = comment.authorThumbnails[0];
        const authorThumbnailElement = document.createElement('img');
        authorThumbnailElement.src = authorThumbnail.url;
        authorThumbnailElement.width = 24; // Profile picture size
        authorThumbnailElement.height = 24;
        authorThumbnailElement.classList.add('author-thumbnail', 'rounded-circle', 'me-2');

        const authorNameElement = document.createElement('span');
        authorNameElement.classList.add('author-name', 'fw-bold');
        authorNameElement.textContent = comment.author;

        const commentContentElement = document.createElement('div');
        commentContentElement.classList.add('comment-content');
        commentContentElement.innerHTML = comment.contentHtml;

        const publishedElement = document.createElement('small');
        publishedElement.classList.add('text-muted');
        publishedElement.textContent = comment.publishedText;

        const commentHeaderElement = document.createElement('div');
        commentHeaderElement.classList.add('comment-header', 'mb-2');
        commentHeaderElement.appendChild(authorThumbnailElement);
        commentHeaderElement.appendChild(authorNameElement);

        commentElement.appendChild(commentHeaderElement);
        commentElement.appendChild(commentContentElement);
        commentElement.appendChild(publishedElement);

        commentList.appendChild(commentElement);
      });

      commentBox.appendChild(commentMenu);
      commentBox.appendChild(commentList);

      if (data.continuation) {
        const loadMoreButton = document.createElement('button');
        loadMoreButton.classList.add('btn', 'btn-outline-light', 'mt-2');
        loadMoreButton.textContent = `Load More Comments (you are on page ${page})`;

        loadMoreButton.disabled = true;
        loadMoreButton.style.opacity = 0.5;

        loadMoreButton.addEventListener('click', () => {
          loadMoreButton.disabled = true;
          loadMoreButton.style.opacity = 0.5;

          fetchAndRenderComments(videoId, sortBy, source, data.continuation, page + 1);
        });

        commentBox.appendChild(loadMoreButton);
        loadMoreButton.disabled = false;
        loadMoreButton.style.opacity = 1;
      }

      commentSection.appendChild(commentBox);

      // Re-enable buttons after loading
      if (topCommentsButton && newCommentsButton) {
        topCommentsButton.disabled = false;
        newCommentsButton.disabled = false;
      }
    })
    .catch(error => console.error('Error fetching comments:', error));
}

window.onload = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('id');
  if (videoId) {
    embedVideo(videoId);
  }
};

document.getElementById('fetch-video').addEventListener('click', function() {
  const videoId = document.getElementById('youtube-id').value;
  if (videoId) {
    embedVideo(videoId);
  } else {
    alert('Please enter a valid YouTube ID.');
  }
});
