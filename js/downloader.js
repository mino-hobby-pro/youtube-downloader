// fetch video url from the api and json reader yadayada
const fetchVideo = () => {
    const youtubeUrl = document.getElementById('youtube-url').value;
    const videoId = youtubeUrl.split('v=')[1];
    if (videoId) {
      const downloadFormat = document.querySelector('.btn-group .btn.active').id.includes('mp4') ? 'mp4' : 'mp3';
      const quality = document.getElementById('quality-select').value; // Get selected quality
      const cobaltApiUrl = `https://api.cobalt.tools/api/json`;

      const requestBody = {
        url: `https://youtube.com/watch?v=${videoId}`,
        vQuality: quality, // Include selected quality
        aFormat: downloadFormat === 'mp3' ? 'mp3' : 'best',
        isAudioOnly: downloadFormat === 'mp3'
      };

      fetch(cobaltApiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
        .then(response => response.json())
        .then(data => {
          const videoDetails = document.getElementById('video-details');
          const downloadButton = document.getElementById('download-button');

          if (data.status === 'success') {
            videoDetails.innerHTML = `<h3>${data.text}</h3>`;
            downloadButton.innerHTML = `<a href="${data.url}" class="btn btn-outline-light btn-curveddd" download>Download ${downloadFormat.toUpperCase()}</a>`;
          } else if (data.status === 'error') {
            videoDetails.innerHTML = `<p>Error: ${data.text}</p>`;
            downloadButton.innerHTML = '';
          } else if (data.status === 'stream') {
            window.open(data.url, '_blank');
          } else {
            videoDetails.innerHTML = `<p>Unexpected response from the API: ${data.text}</p>`;
            downloadButton.innerHTML = '';
          }
        })
        .catch(error => {
            const videoDetails = document.getElementById('video-details');
            const downloadButton = document.getElementById('download-button');
            videoDetails.innerHTML = `<p>Error: ${error.message}</p>`;
            downloadButton.innerHTML = '';
            console.error('Error fetching video details:', error);
          });
    } else {
      alert('Please enter a valid YouTube URL.');
    }
  };

  document.getElementById('fetch-video').addEventListener('click', fetchVideo);

  const pasteButton = document.getElementById('paste-button');
  pasteButton.addEventListener('click', async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      const youtubeUrlInput = document.getElementById('youtube-url');
      youtubeUrlInput.value = clipText;
      youtubeUrlInput.focus();
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  });

  document.querySelectorAll('.btn-group .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-group .btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  // skibidi bop bop bop regex :3
  const getUrlParameter = (name) => {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  const populateVideoId = () => {
    const videoId = getUrlParameter('id');
    document.getElementById('youtube-url').value = `https://www.youtube.com/watch?v=${videoId}`;
  };

  window.onload = populateVideoId;