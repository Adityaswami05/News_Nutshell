let voices = [];
let speechSynthesisUtterance;

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
}

function pauseSpeaking() {
    if (speechSynthesis.speaking) {
        window.speechSynthesis.pause();
    }
}

function resumeSpeaking() {
    if (speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
}

function stopSpeaking() {
    if (speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
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
}