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
      language: config.language || null,
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB
      allowedFileTypes: config.allowedFileTypes || ['image/*', 'application/pdf', '.doc', '.docx'],
      enableGeolocation: config.enableGeolocation !== false,
      enableImageUpload: config.enableImageUpload !== false,
      enableFileUpload: config.enableFileUpload !== false,
      ...config
    };

    this.i18n = new I18n('es');
    this.isOpen = false;
    this.socket = null;
    this.messages = [];
    this.isTyping = false;
    this.uploadingFiles = new Set();

    this.init();
  }

  async init() {
    if (this.config.language) {
      await this.i18n.setLocale(this.config.language);
    } else {
      await this.i18n.detectAndSetLocale();
    }

    this.createWidget();
    this.connectSocket();
    this.bindEvents();

    setTimeout(() => {
      if (this.messages.length === 0) {
        this.addMessage('bot', this.i18n.t('greetings.default'));
        this.showQuickActions();
      }
    }, 3000);
  }

  createWidget() {
    this.container = document.createElement('div');
    this.container.id = 'dysabot-widget';

    this.button = document.createElement('button');
    this.button.className = 'dysabot-button pulsing';
    this.button.innerHTML = '';
    this.button.setAttribute('aria-label', this.i18n.t('aria.openChat'));

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
        <div class="dysabot-input-actions">
          ${this.config.enableImageUpload ? '<button class="dysabot-action-btn" id="dysabot-image-btn" title="Enviar imagen" aria-label="Enviar imagen">📷</button>' : ''}
          ${this.config.enableFileUpload ? '<button class="dysabot-action-btn" id="dysabot-file-btn" title="Enviar archivo" aria-label="Enviar archivo">📎</button>' : ''}
          ${this.config.enableGeolocation ? '<button class="dysabot-action-btn" id="dysabot-location-btn" title="Compartir ubicación" aria-label="Compartir ubicación">📍</button>' : ''}
        </div>
        <textarea
          class="dysabot-input"
          id="dysabot-input"
          placeholder="${this.i18n.t('ui.placeholder')}"
          rows="1"
        ></textarea>
        <button class="dysabot-send" id="dysabot-send" aria-label="${this.i18n.t('aria.sendMessage')}">➤</button>
      </div>
      <input type="file" id="dysabot-image-input" accept="image/*" style="display: none;" />
      <input type="file" id="dysabot-file-input" accept="${this.config.allowedFileTypes.join(',')}" style="display: none;" />
    `;

    this.container.appendChild(this.button);
    this.container.appendChild(this.chat);
    document.body.appendChild(this.container);

    this.messagesContainer = document.getElementById('dysabot-messages');
    this.quickActionsContainer = document.getElementById('dysabot-quick-actions');
    this.input = document.getElementById('dysabot-input');
    this.sendButton = document.getElementById('dysabot-send');
    this.closeButton = this.chat.querySelector('.dysabot-close');

    if (this.config.enableImageUpload) {
      this.imageBtn = document.getElementById('dysabot-image-btn');
      this.imageInput = document.getElementById('dysabot-image-input');
    }

    if (this.config.enableFileUpload) {
      this.fileBtn = document.getElementById('dysabot-file-btn');
      this.fileInput = document.getElementById('dysabot-file-input');
    }

    if (this.config.enableGeolocation) {
      this.locationBtn = document.getElementById('dysabot-location-btn');
    }
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

    this.socket.on('file-upload-progress', (data) => {
      this.updateUploadProgress(data.fileId, data.progress);
    });

    this.socket.on('file-upload-complete', (data) => {
      this.handleUploadComplete(data);
    });

    this.socket.on('file-upload-error', (data) => {
      this.handleUploadError(data);
    });
  }

  bindEvents() {
    this.button.addEventListener('click', () => this.toggleChat());
    this.closeButton.addEventListener('click', () => this.closeChat());
    this.sendButton.addEventListener('click', () => this.sendMessage());

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.input.addEventListener('input', () => this.adjustTextareaHeight());

    // Image upload
    if (this.config.enableImageUpload) {
      this.imageBtn.addEventListener('click', () => this.imageInput.click());
      this.imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
    }

    // File upload
    if (this.config.enableFileUpload) {
      this.fileBtn.addEventListener('click', () => this.fileInput.click());
      this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    // Geolocation
    if (this.config.enableGeolocation) {
      this.locationBtn.addEventListener('click', () => this.shareLocation());
    }

    // Drag & drop
    if (this.config.enableImageUpload || this.config.enableFileUpload) {
      this.messagesContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.messagesContainer.classList.add('drag-over');
      });

      this.messagesContainer.addEventListener('dragleave', () => {
        this.messagesContainer.classList.remove('drag-over');
      });

      this.messagesContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        this.messagesContainer.classList.remove('drag-over');
        this.handleFileDrop(e);
      });
    }

    // Paste images
    if (this.config.enableImageUpload) {
      this.input.addEventListener('paste', (e) => this.handlePaste(e));
    }

    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target)) {
        this.closeChat();
      }
    });
  }

  // ====== IMAGE UPLOAD FUNCTIONALITY ======

  async handleImageSelect(event) {
    const files = Array.from(event.target.files);
    for (const file of files) {
      if (this.validateImage(file)) {
        await this.uploadImage(file);
      }
    }
    event.target.value = '';
  }

  validateImage(file) {
    if (!file.type.startsWith('image/')) {
      this.addMessage('bot', '⚠️ Solo se permiten archivos de imagen.');
      return false;
    }

    if (file.size > this.config.maxFileSize) {
      const maxSizeMB = this.config.maxFileSize / (1024 * 1024);
      this.addMessage('bot', `⚠️ La imagen es muy grande. Tamaño máximo: ${maxSizeMB}MB`);
      return false;
    }

    return true;
  }

  async uploadImage(file) {
    const fileId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.uploadingFiles.add(fileId);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.addImageMessage('user', e.target.result, file.name, fileId);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('restaurantId', this.config.restaurantId);
      formData.append('fileId', fileId);

      const response = await fetch(`${this.config.apiUrl}/api/upload/image`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();

      this.uploadingFiles.delete(fileId);
      this.updateMessageStatus(fileId, 'sent');

      // Send image URL to bot
      if (this.socket && this.socket.connected) {
        this.socket.emit('customer-message', {
          message: `[Imagen enviada: ${file.name}]`,
          imageUrl: data.url,
          restaurantId: this.config.restaurantId,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Image upload error:', error);
      this.uploadingFiles.delete(fileId);
      this.updateMessageStatus(fileId, 'error');
      this.addMessage('bot', '❌ Error al enviar la imagen. Por favor intenta de nuevo.');
    }
  }

  addImageMessage(type, imageUrl, fileName, fileId) {
    const message = document.createElement('div');
    message.className = `dysabot-message ${type}`;
    message.dataset.fileId = fileId;

    const time = new Date().toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit'
    });

    message.innerHTML = `
      <div class="dysabot-message-bubble">
        <div class="dysabot-image-preview">
          <img src="${imageUrl}" alt="${fileName}" />
          <div class="dysabot-upload-status">
            <span class="dysabot-upload-spinner"></span>
          </div>
        </div>
        <span class="dysabot-file-name">${fileName}</span>
      </div>
      <div class="dysabot-message-time">${time}</div>
    `;

    this.messagesContainer.appendChild(message);
    this.scrollToBottom();
  }

  // ====== FILE UPLOAD FUNCTIONALITY ======

  async handleFileSelect(event) {
    const files = Array.from(event.target.files);
    for (const file of files) {
      if (this.validateFile(file)) {
        await this.uploadFile(file);
      }
    }
    event.target.value = '';
  }

  validateFile(file) {
    if (file.size > this.config.maxFileSize) {
      const maxSizeMB = this.config.maxFileSize / (1024 * 1024);
      this.addMessage('bot', `⚠️ El archivo es muy grande. Tamaño máximo: ${maxSizeMB}MB`);
      return false;
    }

    const allowedTypes = this.config.allowedFileTypes;
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    const fileType = file.type;

    const isAllowed = allowedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return fileType.startsWith(baseType);
      }
      return type === fileType || type === fileExt;
    });

    if (!isAllowed) {
      this.addMessage('bot', '⚠️ Tipo de archivo no permitido.');
      return false;
    }

    return true;
  }

  async uploadFile(file) {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.uploadingFiles.add(fileId);

    this.addFileMessage('user', file, fileId);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('restaurantId', this.config.restaurantId);
      formData.append('fileId', fileId);

      const response = await fetch(`${this.config.apiUrl}/api/upload/file`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();

      this.uploadingFiles.delete(fileId);
      this.updateMessageStatus(fileId, 'sent');

      if (this.socket && this.socket.connected) {
        this.socket.emit('customer-message', {
          message: `[Archivo enviado: ${file.name}]`,
          fileUrl: data.url,
          fileName: file.name,
          fileType: file.type,
          restaurantId: this.config.restaurantId,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('File upload error:', error);
      this.uploadingFiles.delete(fileId);
      this.updateMessageStatus(fileId, 'error');
      this.addMessage('bot', '❌ Error al enviar el archivo. Por favor intenta de nuevo.');
    }
  }

  addFileMessage(type, file, fileId) {
    const message = document.createElement('div');
    message.className = `dysabot-message ${type}`;
    message.dataset.fileId = fileId;

    const time = new Date().toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const fileIcon = this.getFileIcon(file.type);
    const fileSize = this.formatFileSize(file.size);

    message.innerHTML = `
      <div class="dysabot-message-bubble">
        <div class="dysabot-file-preview">
          <span class="dysabot-file-icon">${fileIcon}</span>
          <div class="dysabot-file-info">
            <span class="dysabot-file-name">${file.name}</span>
            <span class="dysabot-file-size">${fileSize}</span>
          </div>
          <div class="dysabot-upload-status">
            <span class="dysabot-upload-spinner"></span>
          </div>
        </div>
      </div>
      <div class="dysabot-message-time">${time}</div>
    `;

    this.messagesContainer.appendChild(message);
    this.scrollToBottom();
  }

  getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
    return '📎';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // ====== GEOLOCATION FUNCTIONALITY ======

  shareLocation() {
    if (!navigator.geolocation) {
      this.addMessage('bot', '❌ Tu navegador no soporta geolocalización.');
      return;
    }

    this.addMessage('user', '📍 Solicitando ubicación...');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => this.handleLocationSuccess(position),
      (error) => this.handleLocationError(error),
      options
    );
  }

  handleLocationSuccess(position) {
    const { latitude, longitude, accuracy } = position.coords;

    // Remove "requesting" message
    const lastMessage = this.messagesContainer.lastElementChild;
    if (lastMessage && lastMessage.textContent.includes('Solicitando ubicación')) {
      lastMessage.remove();
    }

    // Add location message
    this.addLocationMessage('user', latitude, longitude, accuracy);

    // Send to bot
    if (this.socket && this.socket.connected) {
      this.socket.emit('customer-message', {
        message: '[Ubicación compartida]',
        location: {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString()
        },
        restaurantId: this.config.restaurantId,
        timestamp: new Date().toISOString()
      });
    }

    this.addMessage('bot', '✅ Ubicación recibida. ¡Gracias por compartirla!');
  }

  handleLocationError(error) {
    const lastMessage = this.messagesContainer.lastElementChild;
    if (lastMessage && lastMessage.textContent.includes('Solicitando ubicación')) {
      lastMessage.remove();
    }

    let errorMessage = '❌ No se pudo obtener tu ubicación. ';

    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += 'Permiso denegado.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += 'Ubicación no disponible.';
        break;
      case error.TIMEOUT:
        errorMessage += 'Tiempo de espera agotado.';
        break;
      default:
        errorMessage += 'Error desconocido.';
    }

    this.addMessage('bot', errorMessage);
  }

  addLocationMessage(type, lat, lon, accuracy) {
    const message = document.createElement('div');
    message.className = `dysabot-message ${type}`;

    const time = new Date().toLocaleTimeString('es', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const mapUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    const accuracyText = accuracy < 100 ? 'Alta precisión' : accuracy < 500 ? 'Media precisión' : 'Baja precisión';

    message.innerHTML = `
      <div class="dysabot-message-bubble">
        <div class="dysabot-location-preview">
          <a href="${mapUrl}" target="_blank" rel="noopener noreferrer">
            <span class="dysabot-location-icon">📍</span>
            <div class="dysabot-location-info">
              <span class="dysabot-location-label">Mi ubicación</span>
              <span class="dysabot-location-accuracy">${accuracyText} (±${Math.round(accuracy)}m)</span>
            </div>
          </a>
        </div>
      </div>
      <div class="dysabot-message-time">${time}</div>
    `;

    this.messagesContainer.appendChild(message);
    this.scrollToBottom();
  }

  // ====== DRAG & DROP AND PASTE ======

  handleFileDrop(event) {
    const files = Array.from(event.dataTransfer.files);

    for (const file of files) {
      if (file.type.startsWith('image/') && this.config.enableImageUpload) {
        if (this.validateImage(file)) {
          this.uploadImage(file);
        }
      } else if (this.config.enableFileUpload) {
        if (this.validateFile(file)) {
          this.uploadFile(file);
        }
      }
    }
  }

  handlePaste(event) {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file && this.validateImage(file)) {
          this.uploadImage(file);
        }
      }
    }
  }

  // ====== UTILITY METHODS ======

  updateMessageStatus(fileId, status) {
    const message = this.messagesContainer.querySelector(`[data-file-id="${fileId}"]`);
    if (!message) return;

    const statusEl = message.querySelector('.dysabot-upload-status');
    if (!statusEl) return;

    if (status === 'sent') {
      statusEl.innerHTML = '<span class="dysabot-check">✓</span>';
      statusEl.classList.add('sent');
    } else if (status === 'error') {
      statusEl.innerHTML = '<span class="dysabot-error">✕</span>';
      statusEl.classList.add('error');
    }
  }

  updateUploadProgress(fileId, progress) {
    const message = this.messagesContainer.querySelector(`[data-file-id="${fileId}"]`);
    if (!message) return;

    const statusEl = message.querySelector('.dysabot-upload-status');
    if (statusEl) {
      statusEl.innerHTML = `<span class="dysabot-progress">${progress}%</span>`;
    }
  }

  handleUploadComplete(data) {
    this.uploadingFiles.delete(data.fileId);
    this.updateMessageStatus(data.fileId, 'sent');
  }

  handleUploadError(data) {
    this.uploadingFiles.delete(data.fileId);
    this.updateMessageStatus(data.fileId, 'error');
    this.addMessage('bot', `❌ Error: ${data.error}`);
  }

  // ====== ORIGINAL METHODS ======

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

    if (this.socket && this.socket.connected) {
      this.showTyping();
      this.socket.emit('customer-message', {
        message: text,
        restaurantId: this.config.restaurantId,
        timestamp: new Date().toISOString()
      });
    } else {
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

    this.messages.push({ type, text, timestamp: new Date() });
  }

  formatMessage(text) {
    text = text.replace(/\n/g, '<br>');
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
    if (typing) typing.remove();
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

// Auto-initialization
document.addEventListener('DOMContentLoaded', async () => {
  const script = document.currentScript || document.querySelector('script[data-dysabot-config]');

  if (script) {
    const config = {};

    const attrs = script.attributes;
    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];
      if (attr.name.startsWith('data-dysabot-')) {
        const key = attr.name.replace('data-dysabot-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        config[key] = attr.value;
      }
    }

    const widget = new DysaBotWidget(config);
    await widget.init();
    window.dysaBotWidget = widget;
  }
});

window.DysaBotWidget = DysaBotWidget;

export default DysaBotWidget;
