let media = [];
let filteredMedia = [];
let currentIndex = 0;
let autoScrollInterval = null;
let currentFilter = 'all';

const folderInput = document.getElementById('folderInput');
const currentImage = document.getElementById('currentImage');
const currentVideo = document.getElementById('currentVideo');
const currentAudio = document.getElementById('currentAudio');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const autoScrollBtn = document.getElementById('autoScroll');
const mediaInfo = document.getElementById('mediaInfo');

// Filter buttons
const allBtn = document.getElementById('allBtn');
const imagesBtn = document.getElementById('imagesBtn');
const videosBtn = document.getElementById('videosBtn');
const audioBtn = document.getElementById('audioBtn');

// Add event listeners for video and audio
currentVideo.addEventListener('ended', handleMediaEnd);
currentAudio.addEventListener('ended', handleMediaEnd);

function handleMediaEnd() {
    if (autoScrollInterval) {
        // If auto-scroll is on, go to next media
        if (currentIndex < filteredMedia.length - 1) {
            currentIndex++;
            displayMedia();
            updateButtons();
        } else {
            // If it's the last media item, go back to the first one and then stop auto-scroll
            currentIndex = 0;
            
            // First stop auto-scroll
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
            autoScrollBtn.textContent = 'Auto Scroll';
            autoScrollBtn.classList.remove('active');
            
            // Display the first item without pausing for video/audio
            const firstItem = filteredMedia[0];
            if (firstItem && (firstItem.type.startsWith('video/') || firstItem.type.startsWith('audio/'))) {
                displayMediaWithContinuousPlayback();  // Modified version that doesn't pause
            } else {
                displayMedia();
            }
            updateButtons();
        }
    } else {
        // If auto-scroll is off, loop the current media
        if (this === currentVideo) {
            currentVideo.currentTime = 0;
            currentVideo.play();
        } else if (this === currentAudio) {
            currentAudio.currentTime = 0;
            currentAudio.play();
        }
    }
}

function applyFilter(filter) {
    currentFilter = filter;
    
    // Reset active class on filter buttons
    allBtn.classList.remove('active');
    imagesBtn.classList.remove('active');
    videosBtn.classList.remove('active');
    audioBtn.classList.remove('active');
    
    // Add active class to selected filter button
    if (filter === 'all') {
        allBtn.classList.add('active');
        filteredMedia = [...media];
    } else if (filter === 'images') {
        imagesBtn.classList.add('active');
        filteredMedia = media.filter(file => file.type.startsWith('image/'));
    } else if (filter === 'videos') {
        videosBtn.classList.add('active');
        filteredMedia = media.filter(file => file.type.startsWith('video/'));
    } else if (filter === 'audio') {
        audioBtn.classList.add('active');
        filteredMedia = media.filter(file => file.type.startsWith('audio/'));
    }
    
    // Reset current index and display media if available
    if (filteredMedia.length > 0) {
        currentIndex = 0;
        displayMedia();
        updateButtons();
    } else {
        currentImage.style.display = 'none';
        currentVideo.style.display = 'none';
        currentAudio.style.display = 'none';
        currentVideo.pause();
        currentAudio.pause();
        mediaInfo.textContent = `No ${filter === 'all' ? 'media' : filter} found in the selected folder`;
    }
}

allBtn.addEventListener('click', () => applyFilter('all'));
imagesBtn.addEventListener('click', () => applyFilter('images'));
videosBtn.addEventListener('click', () => applyFilter('videos'));
audioBtn.addEventListener('click', () => applyFilter('audio'));

folderInput.addEventListener('change', (e) => {
    media = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/') || 
        file.type.startsWith('video/') || 
        file.type.startsWith('audio/')
    );
    
    if (media.length > 0) {
        applyFilter(currentFilter);
    } else {
        currentImage.style.display = 'none';
        currentVideo.style.display = 'none';
        currentAudio.style.display = 'none';
        mediaInfo.textContent = 'No media files found in the selected folder';
    }
});

function displayMedia() {
    if (filteredMedia.length > 0) {
        const file = filteredMedia[currentIndex];
        const reader = new FileReader();
        
        // Reset display
        currentImage.style.display = 'none';
        currentVideo.style.display = 'none';
        currentAudio.style.display = 'none';
        currentVideo.pause();
        currentAudio.pause();
        
        // Reset audio background effect
        document.getElementById('mediaContainer').classList.remove('audio-active');
        
        reader.onload = (e) => {
            if (file.type.startsWith('image/')) {
                currentImage.src = e.target.result;
                currentImage.style.display = 'block';
                
                // If auto-scroll is on, set a timer for image
                if (autoScrollInterval) {
                    // Clear any existing auto-advance for images
                    clearTimeout(window.imageTimer);
                    // Set new timer for image auto-advance
                    window.imageTimer = setTimeout(() => {
                        if (currentIndex < filteredMedia.length - 1) {
                            currentIndex++;
                            displayMedia();
                            updateButtons();
                        } else {
                            // If it's the last image, go back to the first one and then stop auto-scroll
                            currentIndex = 0;
                            
                            // First stop auto-scroll
                            clearInterval(autoScrollInterval);
                            autoScrollInterval = null;
                            autoScrollBtn.textContent = 'Auto Scroll';
                            autoScrollBtn.classList.remove('active');
                            
                            // Then display the first item but pause if it's a video or audio
                            const firstItem = filteredMedia[0];
                            if (firstItem && (firstItem.type.startsWith('video/') || firstItem.type.startsWith('audio/'))) {
                                displayMediaWithoutAutoplay();
                            } else {
                                displayMedia();
                            }
                            updateButtons();
                        }
                    }, 5000);
                }
            } else if (file.type.startsWith('video/')) {
                currentVideo.src = e.target.result;
                currentVideo.style.display = 'block';
                
                // Auto-play video regardless of auto-scroll state
                currentVideo.play().catch(e => {
                    console.log("Auto-play prevented by browser. User interaction required.");
                });
                
                // Clear any existing image timer
                clearTimeout(window.imageTimer);
            } else if (file.type.startsWith('audio/')) {
                currentAudio.src = e.target.result;
                currentAudio.style.display = 'block';
                
                // Apply audio background effect
                document.getElementById('mediaContainer').classList.add('audio-active');
                
                // Auto-play audio regardless of auto-scroll state
                currentAudio.play().catch(e => {
                    console.log("Auto-play prevented by browser. User interaction required.");
                });
                
                // Clear any existing image timer
                clearTimeout(window.imageTimer);
            }
            
            let mediaType = 'Media';
            if (file.type.startsWith('image/')) mediaType = 'Image';
            else if (file.type.startsWith('video/')) mediaType = 'Video';
            else if (file.type.startsWith('audio/')) mediaType = 'Audio';
            
            mediaInfo.textContent = `${mediaType} ${currentIndex + 1} of ${filteredMedia.length}: ${file.name}`;
        };
        reader.readAsDataURL(file);
    }
}

function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === filteredMedia.length - 1;
}

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        displayMedia();
        updateButtons();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentIndex < filteredMedia.length - 1) {
        currentIndex++;
        displayMedia();
        updateButtons();
    }
});

autoScrollBtn.addEventListener('click', () => {
    if (autoScrollInterval) {
        // Turning auto-scroll off
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
        autoScrollBtn.textContent = 'Auto Scroll';
        autoScrollBtn.classList.remove('active');
        
        // Clear any pending image timers
        clearTimeout(window.imageTimer);
        
        // If current item is a video, it will loop now due to handleMediaEnd logic
    } else {
        // Turning auto-scroll on
        autoScrollInterval = true; // Just use a flag, we don't need interval timing
        autoScrollBtn.textContent = 'Stop Auto Scroll';
        autoScrollBtn.classList.add('active');
        
        const currentFile = filteredMedia[currentIndex];
        
        // If current media is an image, set timer to advance
        if (currentFile && currentFile.type.startsWith('image/')) {
            window.imageTimer = setTimeout(() => {
                if (currentIndex < filteredMedia.length - 1) {
                    currentIndex++;
                    displayMedia();
                    updateButtons();
                } else {
                    // If it's the last image, go back to the first one and then stop auto-scroll
                    currentIndex = 0;
                    
                    // First stop auto-scroll
                    autoScrollInterval = null;
                    autoScrollBtn.textContent = 'Auto Scroll';
                    autoScrollBtn.classList.remove('active');
                    
                    // Then display the first item but pause if it's a video or audio
                    const firstItem = filteredMedia[0];
                    if (firstItem && (firstItem.type.startsWith('video/') || firstItem.type.startsWith('audio/'))) {
                        displayMediaWithoutAutoplay();
                    } else {
                        displayMedia();
                    }
                    updateButtons();
                }
            }, 5000);
        }
        // If current media is video or audio, it will auto-advance when it ends
        // via the handleMediaEnd function
    }
});

// Function to display media without auto-playing videos or audio
function displayMediaWithoutAutoplay() {
    if (filteredMedia.length > 0) {
        const file = filteredMedia[currentIndex];
        const reader = new FileReader();
        
        // Reset display
        currentImage.style.display = 'none';
        currentVideo.style.display = 'none';
        currentAudio.style.display = 'none';
        currentVideo.pause();
        currentAudio.pause();
        
        // Reset audio background effect
        document.getElementById('mediaContainer').classList.remove('audio-active');
        
        reader.onload = (e) => {
            if (file.type.startsWith('image/')) {
                currentImage.src = e.target.result;
                currentImage.style.display = 'block';
            } else if (file.type.startsWith('video/')) {
                currentVideo.src = e.target.result;
                currentVideo.style.display = 'block';
                // Do NOT auto-play video
            } else if (file.type.startsWith('audio/')) {
                currentAudio.src = e.target.result;
                currentAudio.style.display = 'block';
                // Apply audio background effect
                document.getElementById('mediaContainer').classList.add('audio-active');
                // Do NOT auto-play audio
            }
            
            let mediaType = 'Media';
            if (file.type.startsWith('image/')) mediaType = 'Image';
            else if (file.type.startsWith('video/')) mediaType = 'Video';
            else if (file.type.startsWith('audio/')) mediaType = 'Audio';
            
            mediaInfo.textContent = `${mediaType} ${currentIndex + 1} of ${filteredMedia.length}: ${file.name}`;
        };
        reader.readAsDataURL(file);
    }
}