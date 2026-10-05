/**
 * EduNavigator Chatbot Widget - chatbot.js
 * Plug-and-play floating widget script dynamically rendering UI, session synchronization, and markdown responses.
 */

(function () {
  if (document.getElementById('edubot-widget-wrapper') || document.getElementById('edubot-container')) return;

  // Session ID Management
  let sessionId = localStorage.getItem('edubot_session_id');
  if (!sessionId) {
    sessionId = 'eb_sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('edubot_session_id', sessionId);
  }

  const inlineTarget = document.getElementById('edubot-inline-container');
  const isInline = !!inlineTarget;

  const containerHTML = `
    <div class="edubot-header">
      <div class="edubot-bot-profile">
        <div class="edubot-avatar">
          <i class="fa-solid fa-graduation-cap"></i>
        </div>
        <div class="edubot-identity">
          <h3>EduBot</h3>
          <div class="edubot-status">
            <div class="edubot-status-dot"></div>
            Admissions Assistant
          </div>
        </div>
      </div>
      <div class="edubot-header-actions">
        ${!isInline ? `
        <button class="edubot-action-btn" id="edubot-close-btn" title="Close Window">
          <i class="fa-solid fa-xmark"></i>
        </button>
        ` : ''}
      </div>
    </div>

    <div class="edubot-chat-history" id="edubot-chat-history">
      <div class="edubot-msg-wrapper bot">
        <div class="edubot-msg-bubble">
          👋 Hi! I'm <strong>EduBot</strong>, your AI Admissions Counselor.
          <br><br>
          Ask me specific questions about universities, degree availability, semester fees, active deadlines, and scholarships in Pakistan!
        </div>
        <div class="edubot-timestamp">System · Just now</div>
      </div>
    </div>

    <div class="edubot-footer">
      <input 
        type="text" 
        class="edubot-input" 
        id="edubot-input" 
        placeholder="Ask a question..." 
        maxlength="500"
        autocomplete="off"
      />
      <button type="button" class="edubot-send-btn" id="edubot-send-btn" title="Send Message">
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>
  `;

  let launcher = null;
  let chatContainer = null;

  if (isInline) {
    chatContainer = document.createElement('div');
    chatContainer.id = 'edubot-container';
    chatContainer.className = 'edubot-container edubot-inline';
    chatContainer.innerHTML = containerHTML;
    inlineTarget.appendChild(chatContainer);
  } else {
    const widgetWrapper = document.createElement('div');
    widgetWrapper.id = 'edubot-widget-wrapper';
    widgetWrapper.innerHTML = `
      <button class="edubot-launcher" id="edubot-launcher" title="Chat with EduBot">
        <i class="fa-solid fa-comments"></i>
      </button>
      <div class="edubot-container" id="edubot-container">
        ${containerHTML}
      </div>
    `;
    document.body.appendChild(widgetWrapper);
    launcher = document.getElementById('edubot-launcher');
  }

  chatContainer = document.getElementById('edubot-container');
  const closeBtn = document.getElementById('edubot-close-btn');
  const chatHistory = document.getElementById('edubot-chat-history');
  const textInput = document.getElementById('edubot-input');
  const sendBtn = document.getElementById('edubot-send-btn');

  if (launcher) {
    launcher.addEventListener('click', () => {
      launcher.classList.toggle('active');
      chatContainer.classList.toggle('active');
      if (chatContainer.classList.contains('active')) {
        textInput.focus();
        scrollToBottom();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (launcher) launcher.classList.remove('active');
      chatContainer.classList.remove('active');
    });
  }

  sendBtn.addEventListener('click', submitMessage);
  textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitMessage();
    }
  });

  function formatTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  function formatMarkdown(text) {
    if (!text) return '';
    let escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const lines = escaped.split('\n');
    const processed = [];
    let inTable = false;
    let inList = false;

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (inList) { processed.push('</ul>'); inList = false; }
        if (trimmed.includes('---')) continue;
        const cells = trimmed.split('|').slice(1, -1).map(c => c.trim());
        if (!inTable) {
          processed.push('<table class="chat-table"><thead><tr>');
          cells.forEach(c => processed.push(`<th>${c}</th>`));
          processed.push('</tr></thead><tbody>');
          inTable = true;
        } else {
          processed.push('<tr>');
          cells.forEach(c => processed.push(`<td>${c}</td>`));
          processed.push('</tr>');
        }
        continue;
      } else {
        if (inTable) { processed.push('</tbody></table>'); inTable = false; }
      }

      if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        const content = trimmed.substring(2);
        if (!inList) { processed.push('<ul style="padding-left:18px;margin:4px 0;">'); inList = true; }
        processed.push(`<li>${content}</li>`);
        continue;
      } else {
        if (inList) { processed.push('</ul>'); inList = false; }
      }

      processed.push(line);
    }

    if (inTable) processed.push('</tbody></table>');
    if (inList) processed.push('</ul>');

    let html = processed.join('\n');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function appendMessage(sender, text, isMarkdown = false) {
    const msgWrapper = document.createElement('div');
    msgWrapper.className = `edubot-msg-wrapper ${sender}`;
    const formattedContent = isMarkdown ? formatMarkdown(text) : text;

    msgWrapper.innerHTML = `
      <div class="edubot-msg-bubble">${formattedContent}</div>
      <div class="edubot-timestamp">${sender === 'user' ? 'You' : 'EduBot'} · ${formatTime()}</div>
    `;

    chatHistory.appendChild(msgWrapper);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'edubot-typing-bubble';
    indicator.id = 'edubot-typing-indicator';
    indicator.innerHTML = `<div class="edubot-dot"></div><div class="edubot-dot"></div><div class="edubot-dot"></div>`;
    chatHistory.appendChild(indicator);
    scrollToBottom();
    return indicator;
  }

  async function submitMessage() {
    const queryText = textInput.value.trim();
    if (!queryText) return;

    textInput.value = '';
    appendMessage('user', queryText);
    const indicator = showTypingIndicator();

    try {
      const baseUrl = typeof API_BASE !== 'undefined' ? API_BASE : 'http://localhost:5000/api';
      const endpoint = baseUrl.endsWith('/api') ? `${baseUrl}/chat` : `${baseUrl}/api/chat`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({ message: queryText, sessionId })
      });

      if (indicator) indicator.remove();

      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      const reply = data.answer || "I couldn't find this information in the EduNavigator database.";
      appendMessage('bot', reply, true);
    } catch (err) {
      if (indicator) indicator.remove();
      appendMessage('bot', '⚠️ Connection failed. Please ensure the backend server is running.');
    }
  }
})();
