import './styles.css';
import io from 'socket.io-client';
import I18n from './i18n.js';

class DysaBotWidget {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || 'http://localhost:8005',
      restaurantId: config.restaurantId || 'demo',
      position: config.position || 'bottom-right',
      theme: config.theme || 'purple',
      language: config.language || null, // null means auto-detect
      ...config
    };
    
    // Initialize i18n
    this.i18n = new I18n('es');
    
    this.isOpen = false;
    this.socket = null;
    this.messages = [];
    this.isTyping = false;
    
    this.init();
  }
  
  async init() {
    // Initialize translations
    if (this.config.language) {
      await this.i18n.setLocale(this.config.language);
    } else {
      await this.i18n.detectAndSetLocale();
    }
    
    this.createWidget();
    this.connectSocket();
    this.bindEvents();
    
    // Auto greeting after 3 seconds
    setTimeout(() => {
      if (this.messages.length === 0) {
        this.addMessage('bot', this.i18n.t('greetings.default'));
        this.showQuickActions();
      }
    }, 3000);
  }
  
  createWidget() {
    // Main container
    this.container = document.createElement('div');
    this.container.id = 'dysabot-widget';
    
    // Floating button
    this.button = document.createElement('button');
    this.button.className = 'dysabot-button pulsing';
    this.button.innerHTML = '';
    this.button.setAttribute('aria-label', this.i18n.t('aria.openChat'));
    
    // Chat window
    this.chat = document.createElement('div');
    this.chat.className = 'dysabot-chat';
    this.chat.innerHTML = `
      <div class="dysabot-header">
        <div class="dysabot-avatar">🤖</div>
        <div class="dysabot-info">
          <h3>${this.i18n.t('ui.title')}</h3>
          <p>${this.i18n.t('ui.subtitle')} <span class="dysabot-status"><span class="dysabot-status-dot"></span>${this.i18n.t('ui.online')}</span></p>
        </div>
        <button class="dysabot-close" aria-label="${this.i18n.t('aria.closeChat')}">✕</button>
      </div>
      <div class="dysabot-messages" id="dysabot-messages"></div>
      <div class="dysabot-quick-actions" id="dysabot-quick-actions"></div>
      <div class="dysabot-input-container">
        <textarea 
          class="dysabot-input" 
          id="dysabot-input" 
          placeholder="${this.i18n.t('ui.placeholder')}"
          rows="1"
        ></textarea>
        <button class="dysabot-send" id="dysabot-send" aria-label="${this.i18n.t('aria.sendMessage')}">➤</button>
      </div>
    `;
    
    this.container.appendChild(this.button);
    this.container.appendChild(this.chat);
    document.body.appendChild(this.container);
    
    // Get references
    this.messagesContainer = document.getElementById('dysabot-messages');
    this.quickActionsContainer = document.getElementById('dysabot-quick-actions');
    this.input = document.getElementById('dysabot-input');
    this.sendButton = document.getElementById('dysabot-send');
    this.closeButton = this.chat.querySelector('.dysabot-close');
  }
  
  connectSocket() {
    this.socket = io(this.config.apiUrl, {
      transports: ['websocket'],
      timeout: 5000
    });
    
    this.socket.on('connect', () => {
      console.log('DysaBot: Connected to server');
      this.updateConnectionStatus(true);
    });
    
    this.socket.on('disconnect', () => {
      console.log('DysaBot: Disconnected from server');
      this.updateConnectionStatus(false);
    });
    
    this.socket.on('bot-response', (data) => {
      this.hideTyping();
      this.addMessage('bot', data.message);
      
      if (data.menuItems && data.menuItems.length > 0) {
        this.showMenuItems(data.menuItems);
      }
      
      if (data.quickActions && data.quickActions.length > 0) {
        this.showQuickActions(data.quickActions);
      }
    });
    
    this.socket.on('bot-typing', () => {
      this.showTyping();
    });
  }
  
  bindEvents() {
    // Toggle chat
    this.button.addEventListener('click', () => {
      this.toggleChat();
    });
    
    // Close chat
    this.closeButton.addEventListener('click', () => {
      this.closeChat();
    });
    
    // Send message
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // Input events
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    this.input.addEventListener('input', () => {
      this.adjustTextareaHeight();
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        this.closeChat();
      }
    });
  }
  
  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }
  
  openChat() {
    this.isOpen = true;
    this.chat.classList.add('open');
    this.button.classList.remove('pulsing');
    this.input.focus();
    
    // Mark as read
    this.markAsRead();
  }
  
  closeChat() {
    this.isOpen = false;
    this.chat.classList.remove('open');
    this.button.classList.add('pulsing');
  }
  
  sendMessage() {
    const text = this.input.value.trim();
    if (!text) return;
    
    this.addMessage('user', text);
    this.input.value = '';
    this.adjustTextareaHeight();
    this.hideQuickActions();
    
    // Send to backend
    if (this.socket && this.socket.connected) {
      this.showTyping();
      this.socket.emit('customer-message', {
        message: text,
        restaurantId: this.config.restaurantId,
        timestamp: new Date().toISOString()
      });
    } else {
      // Fallback when offline
      this.simulateResponse(text);
    }
  }
  
  addMessage(type, text) {
    const message = document.createElement('div');
    message.className = `dysabot-message ${type}`;
    
    const time = new Date().toLocaleTimeString('es', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    message.innerHTML = `
      <div class="dysabot-message-bubble">${this.formatMessage(text)}</div>
      <div class="dysabot-message-time">${time}</div>
    `;
    
    this.messagesContainer.appendChild(message);
    this.scrollToBottom();
    
    // Store message
    this.messages.push({ type, text, timestamp: new Date() });
  }
  
  formatMessage(text) {
    // Convert newlines to <br>
    text = text.replace(/\n/g, '<br>');
    
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    
    return text;
  }
  
  showTyping() {
    if (this.isTyping) return;
    
    this.isTyping = true;
    const typing = document.createElement('div');
    typing.className = 'dysabot-typing';
    typing.id = 'dysabot-typing';
    typing.innerHTML = `
      <div class="dysabot-typing-dot"></div>
      <div class="dysabot-typing-dot"></div>
      <div class="dysabot-typing-dot"></div>
    `;
    
    this.messagesContainer.appendChild(typing);
    this.scrollToBottom();
  }
  
  hideTyping() {
    this.isTyping = false;
    const typing = document.getElementById('dysabot-typing');
    if (typing) {
      typing.remove();
    }
  }
  
  showQuickActions(actions = null) {
    const defaultActions = [
      this.i18n.t('quickActions.menu'),
      this.i18n.t('quickActions.reservation'),
      this.i18n.t('quickActions.info'),
      this.i18n.t('quickActions.contact')
    ];
    
    const quickActions = actions || defaultActions;
    this.quickActionsContainer.innerHTML = '';
    
    quickActions.forEach(action => {
      const button = document.createElement('button');
      button.className = 'dysabot-quick-action';
      button.textContent = action;
      button.addEventListener('click', () => {
        this.input.value = action;
        this.sendMessage();
      });
      this.quickActionsContainer.appendChild(button);
    });
    
    this.quickActionsContainer.style.display = 'flex';
  }
  
  hideQuickActions() {
    this.quickActionsContainer.style.display = 'none';
  }
  
  showMenuItems(items) {
    items.forEach(item => {
      const menuItem = document.createElement('div');
      menuItem.className = 'dysabot-menu-item';
      menuItem.innerHTML = `
        <h4>${item.name}</h4>
        <p>${item.description}</p>
        <div class="price">$${item.price}</div>
      `;
      menuItem.addEventListener('click', () => {
        this.input.value = this.i18n.t('orderActions.order', { itemName: item.name });
        this.sendMessage();
      });
      this.messagesContainer.appendChild(menuItem);
    });
    this.scrollToBottom();
  }
  
  adjustTextareaHeight() {
    this.input.style.height = 'auto';
    this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
  }
  
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
  
  updateConnectionStatus(connected) {
    const statusDot = this.chat.querySelector('.dysabot-status-dot');
    const statusText = statusDot.parentElement;
    
    if (connected) {
      statusDot.classList.remove('disconnected');
      statusText.innerHTML = `<span class="dysabot-status-dot"></span>${this.i18n.t('ui.online')}`;
    } else {
      statusDot.classList.add('disconnected');
      statusText.innerHTML = `<span class="dysabot-status-dot disconnected"></span>${this.i18n.t('ui.offline')}`;
    }
  }
  
  markAsRead() {
    this.button.classList.remove('pulsing');
  }
  
  simulateResponse(userMessage) {
    // Fallback responses when backend is not available
    const responses = {
      'menu': this.i18n.t('fallbackResponses.menu'),
      'reserva': this.i18n.t('fallbackResponses.reservation'),
      'horario': this.i18n.t('fallbackResponses.schedule'),
      'ubicacion': this.i18n.t('fallbackResponses.location'),
      'contacto': this.i18n.t('fallbackResponses.contact'),
      'default': this.i18n.t('fallbackResponses.default')
    };
    
    setTimeout(() => {
      this.hideTyping();
      
      const lowerMessage = userMessage.toLowerCase();
      let response = responses.default;
      
      for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
          response = value;
          break;
        }
      }
      
      this.addMessage('bot', response);
      this.showQuickActions();
    }, 1500);
  }
  
  // Public API
  open() {
    this.openChat();
  }
  
  close() {
    this.closeChat();
  }
  
  sendMessageFromCode(message) {
    this.input.value = message;
    this.sendMessage();
  }
  
  destroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.container) {
      this.container.remove();
    }
  }
}

// Auto-initialization if config is provided via data attributes
document.addEventListener('DOMContentLoaded', async () => {
  const script = document.currentScript || document.querySelector('script[data-dysabot-config]');
  
  if (script) {
    const config = {};
    
    // Get config from data attributes
    const attrs = script.attributes;
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      if (attr.name.startsWith('data-dysabot-')) {
        const key = attr.name.replace('data-dysabot-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        config[key] = attr.value;
      }
    }
    
    // Auto-initialize
    const widget = new DysaBotWidget(config);
    await widget.init();
    window.dysaBotWidget = widget;
  }
});

// Global initialization function
window.DysaBotWidget = DysaBotWidget;

export default DysaBotWidget;