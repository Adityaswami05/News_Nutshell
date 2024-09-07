let voices = [];
let speechSynthesisUtterance;
let isSpeaking = false;

window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    populateVoiceList();
};

function populateVoiceList() {
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = ''; // Clear existing options
    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

async function translateAndSummarize() {
    const url = document.getElementById('news-url').value;
    const language = document.getElementById('languageSelect').value;

    if (!url) {
        alert("Please enter a URL");
        return;
    }

    try {
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `url=${encodeURIComponent(url)}&language=${encodeURIComponent(language)}`,
        });

        const data = await response.json();

        if (data.error) {
            alert(`Error: ${data.error}`);
        } else {
            document.getElementById('article-title').innerText = data.title;
            document.getElementById('article-summary').innerText = data.summary;
            document.getElementById('article-date').innerText = data.publish_date;

            const imageElement = document.getElementById('article-image');
            const imageLink = document.getElementById('article-image-link');
            
            imageElement.innerText = data.top_image;
            imageLink.href = data.top_image;
            imageLink.style.display = data.top_image ? 'block' : 'none';
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to retrieve article data.");
    }
}

function readAloud() {
    const summaryText = document.getElementById('article-summary').innerText;
    const selectedVoiceIndex = document.getElementById('voiceSelect').value;
    const selectedVoice = voices[selectedVoiceIndex];

    if (!summaryText) {
        alert("No text to read.");
        return;
    }

    if (speechSynthesis.speaking) {
        window.speechSynthesis.cancel(); // Stop any ongoing speech
    }

    speechSynthesisUtterance = new SpeechSynthesisUtterance(summaryText);
    speechSynthesisUtterance.voice = selectedVoice;
    speechSynthesisUtterance.pitch = 1;
    speechSynthesisUtterance.rate = 1;

    window.speechSynthesis.speak(speechSynthesisUtterance);
    isSpeaking = true;
    document.getElementById('pause-resume-btn').innerHTML = '<i class="fas fa-pause icon"></i>';
}

function togglePauseResume() {
    if (isSpeaking) {
        if (speechSynthesis.speaking) {
            if (speechSynthesis.paused) {
                window.speechSynthesis.resume();
                document.getElementById('pause-resume-btn').innerHTML = '<i class="fas fa-pause icon"></i>';
            } else {
                window.speechSynthesis.pause();
                document.getElementById('pause-resume-btn').innerHTML = '<i class="fas fa-play icon"></i>';
            }
        }
    }
}

function stopSpeaking() {
    if (speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        document.getElementById('pause-resume-btn').innerHTML = '<i class="fas fa-play icon"></i>';
    }
}

function downloadSummary() {
    const title = document.getElementById('article-title').innerText;
    const summary = document.getElementById('article-summary').innerText;

    const content = `Title:\n${title}\n\nArticle Summary:\n${summary}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "News_summary_file.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function toggleTheme() {
    document.body.classList.toggle('night-mode');
    document.querySelector('.container').classList.toggle('night-mode');
    const icon = document.getElementById('theme-icon');
    if (document.body.classList.contains('night-mode')) {
        icon.src = 'https://img.icons8.com/ios-filled/50/000000/sun.png';
    } else {
        icon.src = 'https://img.icons8.com/ios-filled/50/000000/moon-symbol.png';
    }
}

// Function to fetch the latest business news
async function fetchLatestBusinessNews() {
    const apiKey = 'pub_52897116c29c557e76296c4af10f3988ddc23'; // Your NewsData API key
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=in&language=en&category=business`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const newsList = document.getElementById('news-list');

        if (data.results && data.results.length > 0) {
            newsList.innerHTML = '';
            data.results.slice(0, 4).forEach(article => { // Limit to 4 articles
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#'; // Prevent opening a new window
                link.textContent = article.title;
                link.dataset.url = article.link; // Store the URL in a data attribute
                link.addEventListener('click', function(event) {
                    event.preventDefault(); // Prevent the default action
                    document.getElementById('news-url').value = this.dataset.url; // Set the URL in the input field
                });
                listItem.appendChild(link);
                newsList.appendChild(listItem);
            });
        } else {
            newsList.innerHTML = '<li>No latest business news available.</li>';
        }

    } catch (error) {
        console.error("Failed to fetch news:", error);
    }
}

// Fetch news when the page loads
window.onload = fetchLatestBusinessNews;