// AI Shopping Assistant - Frontend Application Script
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const askAiBtn = document.getElementById('ask-ai-btn');
  const chatBox = document.getElementById('chat-box');
  const typingIndicator = document.getElementById('typing-indicator');
  const errorAlert = document.getElementById('error-alert');
  const errorText = document.getElementById('error-text');
  const dismissErrorBtn = document.getElementById('dismiss-error-btn');
  const clearChatTopBtn = document.getElementById('clear-chat-top-btn');
  const clearChatBottomBtn = document.getElementById('clear-chat-bottom-btn');
  const chipButtons = document.querySelectorAll('.chip-btn');
  const aiStatusBadge = document.getElementById('ai-status-badge');
  const aiStatusText = document.getElementById('ai-status-text');

  // Conversation history for multi-turn conversational context
  let conversationHistory = [];

  // 1. Fetch AI Model Status from Server
  async function checkServerStatus() {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const config = await res.json();
        if (config.mode === 'live') {
          aiStatusBadge.className = 'status-badge live';
          aiStatusText.textContent = `Live AI (${config.provider.toUpperCase()})`;
          aiStatusBadge.title = `Connected to live ${config.model} model`;
        } else {
          aiStatusBadge.className = 'status-badge demo';
          aiStatusText.textContent = `Lab Demo Mode (Offline)`;
          aiStatusBadge.title = 'Running in intelligent local lab simulation mode. Set AI_API_KEY in .env for live API.';
        }
      }
    } catch (e) {
      console.warn('Unable to check AI config:', e);
      aiStatusText.textContent = 'Assistant Ready';
    }
  }

  checkServerStatus();

  // 2. Handle Textarea Keydown (Enter to send, Shift+Enter for newline)
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event('submit'));
    }
  });

  // 3. Quick Chips Handler
  chipButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      if (query) {
        userInput.value = query;
        chatForm.dispatchEvent(new Event('submit'));
      }
    });
  });

  // 4. Clear Chat Handler
  function clearChat() {
    conversationHistory = [];
    hideError();
    // Reset chat box to initial greeting
    chatBox.innerHTML = `
      <div class="message-row assistant-row">
        <div class="avatar assistant-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
          </svg>
        </div>
        <div class="message-content">
          <div class="message-bubble assistant-bubble">
            <p>
              <strong>Welcome! I am your AI Shopping Assistant.</strong><br>
              Share what product you are looking for, your budget, preferred features, or intended use. I will analyze your requirements and recommend the best products for you!
            </p>
          </div>
        </div>
      </div>
    `;
    userInput.value = '';
    userInput.focus();
  }

  clearChatTopBtn.addEventListener('click', clearChat);
  clearChatBottomBtn.addEventListener('click', clearChat);

  // 5. Error Box Helpers
  function showError(message) {
    errorText.textContent = message || "Sorry, I couldn't process your request. Please try again.";
    errorAlert.classList.remove('hidden');
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideError() {
    errorAlert.classList.add('hidden');
  }

  dismissErrorBtn.addEventListener('click', hideError);

  // 6. Handle Form Submission (Send to AI)
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = userInput.value.trim();
    if (!query) return;

    hideError();

    // Render User Message in chat
    renderUserMessage(query);

    // Clear input & disable buttons during request
    userInput.value = '';
    userInput.disabled = true;
    askAiBtn.disabled = true;
    typingIndicator.classList.remove('hidden');
    scrollToBottom();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: conversationHistory
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        // Requirement 11: Display exact error if AI request fails
        const errMessage = data.error || "Sorry, I couldn't process your request. Please try again.";
        showError(errMessage);
        renderAssistantError(errMessage);
        return;
      }

      // Record to conversation history
      conversationHistory.push({ role: 'user', content: query });
      conversationHistory.push({ role: 'assistant', content: data.message || 'Recommendations provided.' });

      // Render Assistant Response & Product Cards
      renderAssistantResponse(data);

    } catch (networkErr) {
      console.error('Fetch error:', networkErr);
      const standardError = "Sorry, I couldn't process your request. Please try again.";
      showError(standardError);
      renderAssistantError(standardError);
    } finally {
      typingIndicator.classList.add('hidden');
      userInput.disabled = false;
      askAiBtn.disabled = false;
      userInput.focus();
      scrollToBottom();
    }
  });

  // 7. Render User Bubble
  function renderUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'message-row user-row';
    row.innerHTML = `
      <div class="message-content">
        <div class="message-bubble user-bubble">
          <p>${escapeHTML(text)}</p>
        </div>
      </div>
      <div class="avatar user-avatar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    `;
    chatBox.appendChild(row);
  }

  // 8. Render Assistant Error Message
  function renderAssistantError(errorMessage) {
    const row = document.createElement('div');
    row.className = 'message-row assistant-row';
    row.innerHTML = `
      <div class="avatar assistant-avatar" style="background:#ef4444;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <div class="message-content">
        <div class="message-bubble assistant-bubble" style="border-color:#fca5a5; color:#991b1b; background:#fef2f2;">
          <p><strong>Error:</strong> ${escapeHTML(errorMessage)}</p>
        </div>
      </div>
    `;
    chatBox.appendChild(row);
    scrollToBottom();
  }

  // 9. Render Assistant Response with Product Cards
  function renderAssistantResponse(data) {
    const { message, identified, recommendations = [], isFollowUp } = data;

    const row = document.createElement('div');
    row.className = 'message-row assistant-row';

    let contentHTML = `
      <div class="avatar assistant-avatar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
        </svg>
      </div>
      <div class="message-content">
    `;

    // Follow-up question highlight or normal message bubble
    if (isFollowUp) {
      contentHTML += `
        <div class="followup-box">
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.35rem; font-weight:700;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Follow-up Question from Assistant:
          </div>
          <p style="font-size:0.95rem; line-height:1.5;">${escapeHTML(message)}</p>
        </div>
      `;
    } else {
      contentHTML += `
        <div class="message-bubble assistant-bubble">
          <p>${escapeHTML(message)}</p>
        </div>
      `;
    }

    // Identified Customer Requirements Box (Workflow requirement)
    if (identified && (identified.category || identified.budget || identified.intendedUse)) {
      const category = identified.category || 'Not specified';
      const budget = identified.budget || 'Not specified';
      const intendedUse = identified.intendedUse || 'General use';
      const featuresStr = Array.isArray(identified.features) && identified.features.length > 0 
        ? identified.features.join(', ') 
        : (identified.features || 'To be specified');

      contentHTML += `
        <div class="analysis-card">
          <div class="analysis-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Customer Requirement Analysis
          </div>
          <div class="analysis-grid">
            <div class="analysis-item">
              <span class="analysis-label">1. Product Category</span>
              <span class="analysis-value">${escapeHTML(category)}</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">2. Budget</span>
              <span class="analysis-value">${escapeHTML(budget)}</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">3. Intended Use</span>
              <span class="analysis-value">${escapeHTML(intendedUse)}</span>
            </div>
            <div class="analysis-item">
              <span class="analysis-label">4. Key Features</span>
              <span class="analysis-value">${escapeHTML(featuresStr)}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Recommendation Cards (Requirement 5)
    if (recommendations && recommendations.length > 0) {
      contentHTML += `<div class="cards-container">`;

      recommendations.forEach((item) => {
        const featuresList = Array.isArray(item.features) 
          ? item.features.map(f => `
              <li>
                <span class="feature-check">&#10003;</span>
                <span>${escapeHTML(f)}</span>
              </li>
            `).join('')
          : `<li><span class="feature-check">&#10003;</span><span>${escapeHTML(String(item.features || ''))}</span></li>`;

        contentHTML += `
          <div class="product-card">
            <div class="card-top">
              <span class="card-category-badge">${escapeHTML(item.category || 'Product')}</span>
              <span class="card-price-badge">${escapeHTML(item.price || 'Best Price')}</span>
            </div>
            
            <h3 class="product-name">${escapeHTML(item.name || 'Recommended Product')}</h3>
            
            <div class="features-block">
              <span class="features-title">Main Features:</span>
              <ul class="features-list">
                ${featuresList}
              </ul>
            </div>
            
            <div class="suitability-block">
              <span class="suitability-label">Why It Is Suitable:</span>
              <span class="suitability-text">${escapeHTML(item.whySuitable || 'Matches customer criteria.')}</span>
            </div>

            <button type="button" class="card-action-btn" onclick="alert('Viewing product details for: ${escapeHTML(item.name || 'product')}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              View In Store
            </button>
          </div>
        `;
      });

      contentHTML += `</div>`;
    }

    contentHTML += `</div>`; // Close .message-content
    row.innerHTML = contentHTML;
    chatBox.appendChild(row);
    scrollToBottom();
  }

  // Smooth scroll to bottom of chat
  function scrollToBottom() {
    setTimeout(() => {
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 50);
  }

  // Basic HTML entity escaping for security
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});
