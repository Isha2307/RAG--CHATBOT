// Initialize Lucide icons
lucide.createIcons();

// DOM Elements
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const clearBtn = document.getElementById('clear-btn');
const toast = document.getElementById('toast');

// API Base URL
const API_URL = 'http://localhost:8000';

// Setup Status
let isReady = false;

// Check initial status by pinging a simple request (if needed) or assuming ready if default pdf loaded
setTimeout(() => {
    setSystemStatus('success', 'System Ready');
}, 1500);

// UI Helpers
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.style.borderLeftColor = type === 'error' ? 'var(--error)' : 'var(--primary)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function setSystemStatus(status, text) {
    statusDot.className = `status-dot ${status}`;
    statusText.textContent = text;
    if (status === 'success') isReady = true;
    else isReady = false;
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendMessage(content, sender = 'bot', isHtml = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    const icon = sender === 'user' ? 'user' : 'bot';
    const avatar = `<div class="avatar"><i data-lucide="${icon}"></i></div>`;
    
    const contentHtml = isHtml ? content : `<p>${content}</p>`;
    
    msgDiv.innerHTML = `
        ${avatar}
        <div class="message-content">
            ${contentHtml}
        </div>
    `;
    
    chatMessages.appendChild(msgDiv);
    lucide.createIcons({ root: msgDiv });
    scrollToBottom();
    return msgDiv;
}

function appendTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message bot`;
    msgDiv.id = 'typing-indicator';
    
    msgDiv.innerHTML = `
        <div class="avatar"><i data-lucide="bot"></i></div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(msgDiv);
    lucide.createIcons({ root: msgDiv });
    scrollToBottom();
    return msgDiv;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Chat Interaction
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const query = chatInput.value.trim();
    if (!query) return;
    
    // Add user message
    appendMessage(query, 'user');
    chatInput.value = '';
    
    // Show typing indicator
    appendTypingIndicator();
    
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
        
        removeTypingIndicator();
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to get answer');
        }
        
        const data = await response.json();
        // The backend returns pre-rendered HTML from Markdown
        appendMessage(data.answer, 'bot', true);
        
    } catch (error) {
        removeTypingIndicator();
        appendMessage(`**Error:** ${error.message}`, 'bot');
        showToast(error.message, 'error');
    }
});

// Clear Memory
clearBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'clear' })
        });
        
        if (response.ok) {
            showToast('Conversation memory cleared');
            chatMessages.innerHTML = '';
            appendMessage('Memory cleared. What would you like to ask?', 'bot');
        }
    } catch (e) {
        showToast('Failed to clear memory', 'error');
    }
});

// File Upload Handling
async function handleFileUpload(file) {
    if (!file || file.type !== 'application/pdf') {
        showToast('Please upload a valid PDF file.', 'error');
        return;
    }
    
    setSystemStatus('loading', 'Uploading & Indexing PDF...');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }
        
        setSystemStatus('success', 'Ready (New Document Indexed)');
        showToast('Document indexed successfully!');
        
        // Add system message
        appendMessage(`I have successfully processed **${file.name}**. What would you like to know about it?`, 'bot');
        
    } catch (error) {
        setSystemStatus('error', 'Indexing Failed');
        showToast(error.message, 'error');
    }
}

fileInput.addEventListener('change', (e) => {
    handleFileUpload(e.target.files[0]);
});

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-active');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-active');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-active');
    
    if (e.dataTransfer.files.length) {
        handleFileUpload(e.dataTransfer.files[0]);
    }
});
