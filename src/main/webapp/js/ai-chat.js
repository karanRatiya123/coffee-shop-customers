/**
 * Velvet Barista AI Chat Assistant — Frontend Widget
 * Self-contained dynamic injection of the floating chatbot interface.
 * Connects securely to the Java backend AiServlet.
 */
(function() {
    'use strict';

    // 1. Resolve relative path for API endpoint depending on directory nesting
    const isInSubdir = window.location.pathname.includes('/pages/');
    const apiEndpoint = isInSubdir ? '../../AiServlet' : 'AiServlet';

    // 2. Chat history storage key
    const HISTORY_KEY = 'velvet_roast_chat_history';

    // 3. Check if user is logged in (session guard check)
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        // Chat assistant only available for signed-in customers
        return;
    }

    const userName = sessionStorage.getItem('userName') || 'Customer';

    // 4. Inject Styles into the page
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Floating Chat Button */
        .velvet-ai-chat-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #c99d66 0%, #a4763b 100%);
            border: 1px solid rgba(245, 235, 226, 0.2);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(201, 157, 102, 0.2);
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #120e0c;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            animation: velvet-pulse 2s infinite alternate;
        }

        .velvet-ai-chat-btn:hover {
            transform: scale(1.1) translateY(-4px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 25px rgba(201, 157, 102, 0.4);
        }

        .velvet-ai-chat-btn svg {
            width: 28px;
            height: 28px;
            stroke: #120e0c;
            fill: none;
            transition: transform 0.4s ease;
        }

        .velvet-ai-chat-btn:hover svg {
            transform: rotate(10deg) scale(1.05);
        }

        /* Chat Panel Container */
        .velvet-ai-chat-panel {
            position: fixed;
            bottom: 105px;
            right: 30px;
            width: 380px;
            height: 520px;
            border-radius: 20px;
            background: rgba(26, 20, 17, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(201, 157, 102, 0.25);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
            display: flex;
            flex-direction: column;
            z-index: 9998;
            overflow: hidden;
            transform: translateY(30px) scale(0.95);
            opacity: 0;
            pointer-events: none;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .velvet-ai-chat-panel.open {
            transform: translateY(0) scale(1);
            opacity: 1;
            pointer-events: auto;
        }

        /* Chat Header */
        .velvet-chat-header {
            padding: 1.25rem;
            background: linear-gradient(135deg, rgba(35, 27, 23, 0.9) 0%, rgba(20, 15, 12, 0.9) 100%);
            border-bottom: 1px solid rgba(201, 157, 102, 0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .velvet-chat-brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .velvet-chat-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(201, 157, 102, 0.15);
            border: 1px solid #c99d66;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #c99d66;
        }

        .velvet-chat-avatar svg {
            width: 20px;
            height: 20px;
        }

        .velvet-chat-info h4 {
            font-family: 'Outfit', sans-serif;
            font-size: 0.95rem;
            font-weight: 600;
            color: #f5ebe2;
            margin: 0;
        }

        .velvet-chat-status {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            color: #aa9588;
        }

        .velvet-status-dot {
            width: 6px;
            height: 6px;
            background-color: #72c391;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 8px #72c391;
        }

        .velvet-chat-close {
            background: transparent;
            border: none;
            color: #aa9588;
            cursor: pointer;
            padding: 4px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .velvet-chat-close:hover {
            color: #f5ebe2;
            background: rgba(255, 255, 255, 0.05);
        }

        .velvet-chat-close svg {
            width: 20px;
            height: 20px;
        }

        /* Message Board */
        .velvet-chat-messages {
            flex: 1;
            padding: 1.25rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            scroll-behavior: smooth;
        }

        /* Custom Scrollbar for messages */
        .velvet-chat-messages::-webkit-scrollbar {
            width: 5px;
        }
        .velvet-chat-messages::-webkit-scrollbar-track {
            background: transparent;
        }
        .velvet-chat-messages::-webkit-scrollbar-thumb {
            background: rgba(201, 157, 102, 0.2);
            border-radius: 4px;
        }
        .velvet-chat-messages::-webkit-scrollbar-thumb:hover {
            background: rgba(201, 157, 102, 0.4);
        }

        /* Message Bubbles */
        .velvet-msg {
            display: flex;
            flex-direction: column;
            max-width: 82%;
            animation: velvet-fade-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .velvet-msg.user {
            align-self: flex-end;
        }

        .velvet-msg.assistant {
            align-self: flex-start;
        }

        .velvet-bubble {
            padding: 0.75rem 1rem;
            border-radius: 14px;
            font-size: 0.88rem;
            line-height: 1.5;
            font-family: 'Outfit', sans-serif;
        }

        .velvet-msg.user .velvet-bubble {
            background: #4e3d34;
            color: #f5ebe2;
            border: 1px solid rgba(201, 157, 102, 0.2);
            border-bottom-right-radius: 2px;
        }

        .velvet-msg.assistant .velvet-bubble {
            background: rgba(35, 27, 23, 0.65);
            color: #f5ebe2;
            border: 1px solid rgba(201, 157, 102, 0.15);
            border-bottom-left-radius: 2px;
        }

        .velvet-bubble p {
            margin-bottom: 0.5rem;
        }
        .velvet-bubble p:last-child {
            margin-bottom: 0;
        }

        .velvet-bubble ul, .velvet-bubble ol {
            padding-left: 1.25rem;
            margin-bottom: 0.5rem;
        }

        .velvet-bubble li {
            margin-bottom: 0.25rem;
        }

        .velvet-msg-time {
            font-size: 0.7rem;
            color: #6e5e54;
            margin-top: 4px;
            align-self: flex-end;
        }

        .velvet-msg.assistant .velvet-msg-time {
            align-self: flex-start;
        }

        /* Suggestions Chips */
        .velvet-chat-suggestions {
            display: flex;
            gap: 8px;
            padding: 0 1.25rem 0.75rem 1.25rem;
            overflow-x: auto;
            white-space: nowrap;
        }
        
        .velvet-chat-suggestions::-webkit-scrollbar {
            display: none;
        }

        .velvet-suggestion-chip {
            background: rgba(201, 157, 102, 0.08);
            border: 1px solid rgba(201, 157, 102, 0.2);
            border-radius: 20px;
            padding: 6px 12px;
            color: #c99d66;
            font-family: 'Outfit', sans-serif;
            font-size: 0.78rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .velvet-suggestion-chip:hover {
            background: rgba(201, 157, 102, 0.2);
            color: #dbae77;
            transform: translateY(-2px);
        }

        /* Chat Input Area */
        .velvet-chat-input-area {
            padding: 1rem 1.25rem 1.25rem 1.25rem;
            background: rgba(20, 15, 12, 0.95);
            border-top: 1px solid rgba(201, 157, 102, 0.15);
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .velvet-chat-input {
            flex: 1;
            background: #231b17;
            border: 1px solid #362a24;
            border-radius: 12px;
            padding: 10px 14px;
            color: #f5ebe2;
            font-family: 'Outfit', sans-serif;
            font-size: 0.88rem;
            outline: none;
            transition: all 0.3s ease;
        }

        .velvet-chat-input::placeholder {
            color: #6e5e54;
        }

        .velvet-chat-input:focus {
            border-color: #c99d66;
            box-shadow: 0 0 10px rgba(201, 157, 102, 0.15);
        }

        .velvet-chat-send {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: #c99d66;
            border: none;
            color: #120e0c;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .velvet-chat-send:hover {
            background: #dbae77;
            transform: scale(1.05);
        }

        .velvet-chat-send svg {
            width: 18px;
            height: 18px;
            stroke: #120e0c;
            fill: none;
        }

        /* Typing Indicator */
        .velvet-typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px 16px;
        }

        .velvet-typing-dot {
            width: 6px;
            height: 6px;
            background-color: #aa9588;
            border-radius: 50%;
            animation: velvet-bounce-dot 1.4s infinite ease-in-out both;
        }

        .velvet-typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .velvet-typing-dot:nth-child(2) { animation-delay: -0.16s; }

        /* Keyframes */
        @keyframes velvet-pulse {
            0% {
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 0 0 rgba(201, 157, 102, 0.3);
            }
            100% {
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 0 12px rgba(201, 157, 102, 0);
            }
        }

        @keyframes velvet-bounce-dot {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
        }

        @keyframes velvet-fade-up {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Mobile adaptation */
        @media (max-width: 480px) {
            .velvet-ai-chat-panel {
                bottom: 0;
                right: 0;
                width: 100%;
                height: 100%;
                border-radius: 0;
                border: none;
            }
            .velvet-ai-chat-btn {
                bottom: 20px;
                right: 20px;
            }
        }
    `;
    document.head.appendChild(styleElement);

    // 5. Create DOM Elements
    const chatBtn = document.createElement('button');
    chatBtn.className = 'velvet-ai-chat-btn';
    chatBtn.setAttribute('aria-label', 'Chat with Velvet Barista AI');
    chatBtn.innerHTML = `
        <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
    `;

    const chatPanel = document.createElement('div');
    chatPanel.className = 'velvet-ai-chat-panel';
    chatPanel.innerHTML = `
        <div class="velvet-chat-header">
            <div class="velvet-chat-brand">
                <div class="velvet-chat-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
                        <line x1="6" y1="1" x2="6" y2="4" />
                        <line x1="10" y1="1" x2="10" y2="4" />
                        <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                </div>
                <div class="velvet-chat-info">
                    <h4>Velvet Barista</h4>
                    <span class="velvet-chat-status">
                        <span class="velvet-status-dot"></span>
                        Online Assistant
                    </span>
                </div>
            </div>
            <button class="velvet-chat-close" aria-label="Close Chat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="velvet-chat-messages" id="velvet-chat-messages-container"></div>
        <div class="velvet-chat-suggestions">
            <button class="velvet-suggestion-chip" data-query="What is the best coffee item?">✨ Best Coffee</button>
            <button class="velvet-suggestion-chip" data-query="Any active coupon offers?">🎟️ Offers</button>
            <button class="velvet-suggestion-chip" data-query="Do you have drinks within ₹150?">🪙 Under ₹150</button>
            <button class="velvet-suggestion-chip" data-query="What customizations can I add?">🥛 Milk & Custom</button>
            <button class="velvet-suggestion-chip" data-query="Which items are vegan or dairy-free?">🌱 Vegan options</button>
        </div>
        <div class="velvet-chat-input-area">
            <input type="text" class="velvet-chat-input" id="velvet-chat-text-input" placeholder="Ask about coffee, offers or customization..." autocomplete="off">
            <button class="velvet-chat-send" id="velvet-chat-send-btn" aria-label="Send Message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(chatBtn);
    document.body.appendChild(chatPanel);

    // 6. UI Interaction Logic
    const msgContainer = document.getElementById('velvet-chat-messages-container');
    const inputField = document.getElementById('velvet-chat-text-input');
    const sendBtn = document.getElementById('velvet-chat-send-btn');
    const closeBtn = chatPanel.querySelector('.velvet-chat-close');

    // Conversation history formatting for Gemini: [{"role": "user"|"model", "parts": [{"text": "..."}]}]
    let conversationHistory = [];

    // Load history from session storage
    function loadSavedHistory() {
        const saved = sessionStorage.getItem(HISTORY_KEY);
        if (saved) {
            try {
                conversationHistory = JSON.parse(saved);
                renderAllMessages();
            } catch (e) {
                console.error('[AiChat] Failed to parse saved chat history', e);
                showWelcomeMessage();
            }
        } else {
            showWelcomeMessage();
        }
    }

    // Show initial welcome bubble
    function showWelcomeMessage() {
        conversationHistory = [
            {
                role: 'model',
                parts: [{ text: `Hello ${userName}! ☕ Welcome to **The Velvet Roast**. I am your Velvet Barista assistant. Ask me to recommend coffees, suggest customized milk choices, find drinks inside a budget, check active coupon offers, or detail dietary ingredients. What can I brew for you today?` }]
            }
        ];
        renderAllMessages();
        saveHistory();
    }

    function saveHistory() {
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(conversationHistory));
    }

    // Convert Markdown-like text from LLM to HTML
    function formatMessageText(text) {
        if (!text) return '';
        
        let formatted = text
            // Escape HTML tags to prevent XSS
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Format bold text (**text**)
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Format bullet points (* item or - item)
        // If it starts with * or - followed by space
        const lines = formatted.split('\n');
        let inList = false;
        const resultLines = [];
        
        for (let line of lines) {
            const listMatch = line.match(/^[\s]*[-*+]\s+(.*)/);
            if (listMatch) {
                if (!inList) {
                    resultLines.push('<ul>');
                    inList = true;
                }
                resultLines.push(`<li>${listMatch[1]}</li>`);
            } else {
                if (inList) {
                    resultLines.push('</ul>');
                    inList = false;
                }
                if (line.trim().isEmpty) {
                    resultLines.push('<br>');
                } else {
                    resultLines.push(`<p>${line}</p>`);
                }
            }
        }
        if (inList) {
            resultLines.push('</ul>');
        }

        return resultLines.join('\n');
    }

    // Render single message
    function appendMessageBubble(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `velvet-msg ${role}`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        msgDiv.innerHTML = `
            <div class="velvet-bubble">
                ${formatMessageText(text)}
            </div>
            <span class="velvet-msg-time">${timestamp}</span>
        `;
        
        msgContainer.appendChild(msgDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    // Render all messages in history
    function renderAllMessages() {
        msgContainer.innerHTML = '';
        conversationHistory.forEach(msg => {
            const text = msg.parts && msg.parts[0] ? msg.parts[0].text : '';
            appendMessageBubble(msg.role, text);
        });
    }

    // Toggle Panel
    chatBtn.addEventListener('click', () => {
        const isOpen = chatPanel.classList.toggle('open');
        if (isOpen) {
            inputField.focus();
            msgContainer.scrollTop = msgContainer.scrollHeight;
        }
    });

    closeBtn.addEventListener('click', () => {
        chatPanel.classList.remove('open');
    });

    // Suggestion Chips handler
    document.querySelectorAll('.velvet-suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            if (query) {
                inputField.value = query;
                handleSendMessage();
            }
        });
    });

    // Send logic
    async function handleSendMessage() {
        const text = inputField.value.trim();
        if (!text) return;

        // Reset input immediately
        inputField.value = '';

        // Add user turn
        conversationHistory.push({
            role: 'user',
            parts: [{ text: text }]
        });
        appendMessageBubble('user', text);
        saveHistory();

        // Add typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'velvet-msg assistant';
        typingIndicator.id = 'velvet-chat-typing-indicator';
        typingIndicator.innerHTML = `
            <div class="velvet-bubble">
                <div class="velvet-typing-indicator">
                    <div class="velvet-typing-dot"></div>
                    <div class="velvet-typing-dot"></div>
                    <div class="velvet-typing-dot"></div>
                </div>
            </div>
        `;
        msgContainer.appendChild(typingIndicator);
        msgContainer.scrollTop = msgContainer.scrollHeight;

        // Helper: Probes candidate URLs to find active Java context
        async function executeResilientAiFetch(options) {
            const relativeUrl = isInSubdir ? '../../AiServlet' : 'AiServlet';
            const candidateUrls = [
                relativeUrl,
                `/Custoners_website/AiServlet`,
                `../Custoners_website/AiServlet`,
                `../../Custoners_website/AiServlet`,
                `/POS_Employyes/AiServlet`,
                `../POS_Employyes/AiServlet`,
                `/POS_Employyes_Backup/AiServlet`,
                `../POS_Employyes_Backup/AiServlet`,
                `/Test/AiServlet`,
                `../Test/AiServlet`,
                `http://localhost:8080/Custoners_website/AiServlet`,
                `http://localhost:8080/POS_Employyes/AiServlet`,
                `http://localhost:8080/POS_Employyes_Backup/AiServlet`,
                `http://localhost:8080/Test/AiServlet`,
                `http://localhost:8080/AiServlet`
            ];

            const uniqueUrls = [...new Set(candidateUrls)];
            let lastError = null;

            for (const requestUrl of uniqueUrls) {
                try {
                    const response = await fetch(requestUrl, options);
                    if (response.ok) {
                        return await response.json();
                    } else {
                        const errText = await response.text();
                        console.warn(`[AiChat] Response error for ${requestUrl} (Status ${response.status}):`, errText);
                        try {
                            const parsed = JSON.parse(errText);
                            if (parsed.error) {
                                lastError = new Error(parsed.error);
                                continue;
                            }
                        } catch(e) {}
                        lastError = new Error(`Server returned status ${response.status}`);
                    }
                } catch (err) {
                    console.log(`[AiChat] Fetch failed for URL: ${requestUrl} - ${err.message}`);
                    lastError = err;
                }
            }
            throw lastError || new Error("Unable to connect to AiServlet on Tomcat 8080.");
        }

        try {
            // Call Java AiServlet with history and new message
            const contextHistory = conversationHistory.slice(0, -1).slice(-10);

            const data = await executeResilientAiFetch({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify({
                    message: text,
                    history: contextHistory
                })
            });

            // Remove typing indicator
            const indicatorEl = document.getElementById('velvet-chat-typing-indicator');
            if (indicatorEl) indicatorEl.remove();

            const aiReply = data.reply || "Sorry, I couldn't get a proper response.";
            
            conversationHistory.push({
                role: 'model',
                parts: [{ text: aiReply }]
            });
            appendMessageBubble('model', aiReply);
            saveHistory();

        } catch (error) {
            console.error('[AiChat] Error sending message to AiServlet:', error);
            const indicatorEl = document.getElementById('velvet-chat-typing-indicator');
            if (indicatorEl) indicatorEl.remove();
            
            // Show a friendly thematic error message instead of raw system/API error details
            const messageText = "Our brewing systems are busy. Please try asking again shortly!";
            appendMessageBubble('model', messageText);
        }
    }

    // Click send
    sendBtn.addEventListener('click', handleSendMessage);

    // Enter key press
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Initialize history
    loadSavedHistory();

})();
