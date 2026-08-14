/**
 * AI UI & Particle Button System — Vanilla JS Implementation
 * Converted directly from React (particle-button.tsx, button.tsx & demo.tsx)
 * No dependencies or framework required.
 */

(function (window, document) {
  'use strict';

  // ==========================================================================
  // 1. Particle Generator Engine (Converted from particle-button.tsx)
  // ==========================================================================

  /**
   * Spawns floating particles around a given button element
   * @param {HTMLElement} buttonRef - The target DOM button element
   * @param {Object} options - Custom configuration options
   */
  function spawnParticles(buttonRef, options) {
    if (!buttonRef) return;

    const opts = Object.assign({
      particleCount: 6,
      duration: 600,
      color: '#c99d66',
      successDuration: 1000,
      onSuccess: null
    }, options);

    const rect = buttonRef.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Apply active pressed scale class
    buttonRef.classList.add('is-active');
    setTimeout(function () {
      buttonRef.classList.remove('is-active');
    }, 150);

    // Create particles
    for (let i = 0; i < opts.particleCount; i++) {
      const dot = document.createElement('div');
      dot.className = 'ui-particle-dot';

      if (opts.color) {
        dot.style.backgroundColor = opts.color;
        dot.style.boxShadow = '0 0 8px ' + opts.color;
      }

      dot.style.left = centerX + 'px';
      dot.style.top = centerY + 'px';

      document.body.appendChild(dot);

      // Trajectory calculation (mirrors React framer-motion logic)
      const direction = (i % 2 === 1) ? 1 : -1;
      const targetX = direction * (Math.random() * 50 + 20);
      const targetY = -Math.random() * 50 - 20;

      // Animate with Web Animations API
      const animation = dot.animate([
        { transform: 'translate(-50%, -50%) scale(0) translate(0px, 0px)', opacity: 0 },
        { transform: 'translate(-50%, -50%) scale(1) translate(' + (targetX * 0.5) + 'px, ' + (targetY * 0.5) + 'px)', opacity: 1, offset: 0.5 },
        { transform: 'translate(-50%, -50%) scale(0) translate(' + targetX + 'px, ' + targetY + 'px)', opacity: 0 }
      ], {
        duration: opts.duration,
        delay: i * 80,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        fill: 'forwards'
      });

      // Cleanup particle element on animation end
      animation.onfinish = function () {
        if (dot.parentNode) {
          dot.parentNode.removeChild(dot);
        }
      };
    }

    // Trigger onSuccess callback if specified
    if (typeof opts.onSuccess === 'function') {
      setTimeout(function () {
        opts.onSuccess();
      }, opts.successDuration);
    }
  }

  /**
   * Initializes all DOM buttons containing `data-particle-button` or `.particle-btn`
   */
  function initParticleButtons() {
    const buttons = document.querySelectorAll('[data-particle-button], .particle-btn');
    buttons.forEach(function (btn) {
      if (btn._particleBound) return;
      btn._particleBound = true;

      btn.addEventListener('click', function (e) {
        const countAttr = btn.getAttribute('data-particle-count');
        const colorAttr = btn.getAttribute('data-particle-color');
        const durationAttr = btn.getAttribute('data-particle-duration');

        spawnParticles(btn, {
          particleCount: countAttr ? parseInt(countAttr, 10) : 6,
          color: colorAttr || null,
          duration: durationAttr ? parseInt(durationAttr, 10) : 600
        });
      });
    });
  }

  // ==========================================================================
  // 2. AI Assistant Chat Engine (Calls Java Servlet Backend AIServlet)
  // ==========================================================================

  // Custom response handler hook (allows overriding or custom testing)
  let customResponseHandler = null;

  // Optional client fallback for static/Live Server mode. Leave empty so the
  // key stays on the servlet (config.properties / GEMINI_API_KEY env var).
  const FALLBACK_GEMINI_KEY = "";
  const FALLBACK_MODEL = "gemini-2.5-flash";

  /**
   * Direct Gemini API fallback when Tomcat servlet is unavailable
   */
  async function callGeminiDirectFallback(prompt) {
    if (!FALLBACK_GEMINI_KEY) {
      throw new Error("Direct Gemini fallback is disabled. Start Tomcat so AiChatServlet can handle chat.");
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${FALLBACK_MODEL}:generateContent?key=${FALLBACK_GEMINI_KEY}`;
    const payload = {
      system_instruction: {
        parts: [{
          text: "You are Velvet AI Barista, an intelligent coffee assistant for The Velvet Roast.\n" +
                "STORE ANALYTICS CONTEXT:\n" +
                "☕ Menu: Velvet Signature Espresso ($3.50), Vanilla Cloud Cold Brew ($5.25), Caramel Velvet Latte ($5.50), Artisan Drip ($3.00), Mocha Velvet ($5.75).\n" +
                "🔥 #1 Bestselling Coffee (Highest Sales): Vanilla Cloud Cold Brew ($5.25).\n" +
                "🎉 Active Promos: 10% Off First Online Order (Promo Code: VELVET10).\n" +
                "⭐ Top Rated: Caramel Velvet Latte (4.9/5 Stars).\n\n" +
                "RULES: If asked for best coffee or top seller, recommend #1 Vanilla Cloud Cold Brew. If asked for deals, mention VELVET10 code. Keep answers warm, concise, and helpful."
        }]
      },
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gemini API Error ${res.status}`);
    }

    const data = await res.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return replyText || "Hello! Welcome to Velvet Roast. How can I help you today?";
  }

  /**
   * Sends user message to Java AiChatServlet backend (or falls back to direct API if Tomcat is offline)
   * @param {string} userText - User input prompt
   * @returns {Promise<string>}
   */
  async function getAIResponse(userText) {
    const prompt = userText.trim();
    if (!prompt) return "Please enter a message.";

    // 1. Call custom handler if registered
    if (typeof customResponseHandler === 'function') {
      return await customResponseHandler(prompt);
    }

    // 2. Determine relative URL for Java AiChatServlet backend (POST /AiChatServlet)
    let servletUrl = 'AiChatServlet';
    const pathName = window.location.pathname;
    if (pathName.includes('/pages/')) {
      const depth = pathName.split('/pages/')[1].split('/').length;
      servletUrl = '../'.repeat(depth) + 'AiChatServlet';
    }

    try {
      const response = await fetch(servletUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({ prompt: prompt })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          return "⚠️ " + data.error;
        }
        return data.reply || "No response received from AI Barista.";
      }

      // If Tomcat returned 404 (e.g. running on static VS Code Live Server), use direct fallback
      if (response.status === 404) {
        console.warn("AiChatServlet endpoint 404 (Tomcat offline/static mode). Using direct Gemini API fallback...");
        try {
          return await callGeminiDirectFallback(prompt);
        } catch (fallbackErr) {
          return "⚠️ HTTP 404: Java AiChatServlet not found on Tomcat server, and direct AI fallback failed: " + fallbackErr.message;
        }
      }

      const errText = await response.text();
      try {
        const errJson = JSON.parse(errText);
        return "⚠️ " + (errJson.error || ("Server HTTP Error " + response.status));
      } catch (e) {
        return "⚠️ Server HTTP Error " + response.status;
      }

    } catch (error) {
      console.warn("AiChatServlet connection failed. Attempting direct Gemini API fallback...", error);
      try {
        return await callGeminiDirectFallback(prompt);
      } catch (fallbackErr) {
        return "⚠️ Unable to connect to Velvet AI service: " + fallbackErr.message;
      }
    }
  }

  /**
   * Initializes the AI Assistant UI Chat Window & Widget
   */
  function initAIWidget() {
    const toggleBtn = document.getElementById('ai-widget-toggle');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-close');
    const sendBtn = document.getElementById('ai-send-btn');
    const chatInput = document.getElementById('ai-chat-input');
    const messagesContainer = document.getElementById('ai-chat-messages');

    if (!toggleBtn || !chatWindow) return;

    // Toggle Chat Window
    function toggleChat() {
      const isOpen = chatWindow.classList.toggle('is-open');
      if (isOpen && chatInput) {
        setTimeout(function() { chatInput.focus(); }, 200);
      }
    }

    toggleBtn.addEventListener('click', function (e) {
      spawnParticles(toggleBtn, { particleCount: 8, color: '#c99d66' });
      toggleChat();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', toggleChat);
    }

    // Append Message to Chat
    function appendMessage(text, sender) {
      if (!messagesContainer) return;

      const msgDiv = document.createElement('div');
      msgDiv.className = 'ai-msg ai-msg-' + sender;

      const contentDiv = document.createElement('div');
      contentDiv.className = 'ai-msg-content';
      
      // Basic markdown formatting (bold & lines)
      let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

      contentDiv.innerHTML = formattedText;
      msgDiv.appendChild(contentDiv);
      messagesContainer.appendChild(msgDiv);

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Show Typing Indicator
    function showTypingIndicator() {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'ai-msg ai-msg-assistant';
      typingDiv.id = 'ai-typing-indicator';
      typingDiv.innerHTML = `
        <div class="ai-msg-content">
          <div class="ai-typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      `;
      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
      const indicator = document.getElementById('ai-typing-indicator');
      if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }

    // Send Message Handler
    function handleSend() {
      if (!chatInput) return;
      const text = chatInput.value.trim();
      if (!text) return;

      // User Message
      appendMessage(text, 'user');
      chatInput.value = '';

      // Particle explosion on send button
      if (sendBtn) {
        spawnParticles(sendBtn, { particleCount: 5, color: '#c99d66' });
      }

      // Simulate AI thinking delay
      showTypingIndicator();
      setTimeout(async function () {
        try {
          const reply = await Promise.resolve(getAIResponse(text));
          removeTypingIndicator();
          appendMessage(reply || "I'm sorry, I couldn't generate a response.", 'assistant');
        } catch (err) {
          removeTypingIndicator();
          appendMessage("An error occurred while generating a response.", 'assistant');
        }
      }, 500);
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', handleSend);
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSend();
        }
      });
    }

    // Suggestion Pill Chips
    const chips = document.querySelectorAll('.ai-chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        const text = chip.textContent.trim();
        if (chatInput) {
          chatInput.value = text;
          handleSend();
        }
      });
    });
  }

  // ==========================================================================
  // 3. Auto Initialization
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    initParticleButtons();
    initAIWidget();
  });

  // Expose global methods for developer convenience
  window.ParticleButton = {
    spawn: spawnParticles,
    init: initParticleButtons
  };

  window.AIUI = {
    init: initAIWidget,
    setResponseHandler: function (fn) {
      customResponseHandler = fn;
    }
  };

})(window, document);
