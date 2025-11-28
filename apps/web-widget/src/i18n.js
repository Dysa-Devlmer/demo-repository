// Simple i18n system for the DysaBot widget

class I18n {
  constructor(defaultLocale = 'es') {
    this.currentLocale = defaultLocale;
    this.translations = {};
    this.loadedLocales = new Set();
  }

  async loadTranslations(locale) {
    if (this.loadedLocales.has(locale)) {
      return;
    }

    try {
      // In a real application, these would be loaded from the server
      // For the widget, we'll embed them directly
      const translations = await this.getTranslationData(locale);
      this.translations[locale] = translations;
      this.loadedLocales.add(locale);
    } catch (error) {
      console.warn(`Failed to load translations for locale: ${locale}`, error);
    }
  }

  async getTranslationData(locale) {
    // This would normally fetch from a server, but for the widget
    // we'll import the translations directly
    const translations = {
      'en': {
        "aria": {
          "openChat": "Open chat",
          "closeChat": "Close chat",
          "sendMessage": "Send message"
        },
        "ui": {
          "title": "ChatBot Dysa",
          "subtitle": "Virtual Assistant",
          "online": "Online",
          "offline": "Offline",
          "placeholder": "Type your message...",
          "typing": "Typing..."
        },
        "greetings": {
          "default": "Hello! How can I help you today?"
        },
        "quickActions": {
          "menu": "View menu",
          "reservation": "Make reservation",
          "info": "Restaurant information",
          "contact": "Contact"
        },
        "fallbackResponses": {
          "menu": "Our menu includes traditional Mexican dishes. Would you like to see our specialties?",
          "reservation": "To make a reservation, you can call us at the restaurant phone number or leave us your details.",
          "schedule": "We are open Monday to Sunday from 11:00 AM to 10:00 PM.",
          "location": "We are located in the city center. Do you need the exact address?",
          "contact": "You can contact us by phone or visit us directly at our restaurant.",
          "default": "Thank you for your message. I cannot connect to our system right now, but we will respond to you soon."
        },
        "orderActions": {
          "order": "I want to order {itemName}"
        }
      },
      'es': {
        "aria": {
          "openChat": "Abrir chat",
          "closeChat": "Cerrar chat",
          "sendMessage": "Enviar mensaje"
        },
        "ui": {
          "title": "ChatBot Dysa",
          "subtitle": "Asistente Virtual",
          "online": "En línea",
          "offline": "Sin conexión",
          "placeholder": "Escribe tu mensaje...",
          "typing": "Escribiendo..."
        },
        "greetings": {
          "default": "¡Hola! ¿En qué puedo ayudarte hoy?"
        },
        "quickActions": {
          "menu": "Ver menú",
          "reservation": "Hacer reserva",
          "info": "Información del restaurante",
          "contact": "Contacto"
        },
        "fallbackResponses": {
          "menu": "Nuestro menú incluye platillos tradicionales mexicanos. ¿Te gustaría ver nuestras especialidades?",
          "reservation": "Para hacer una reserva, puedes llamarnos al teléfono del restaurante o déjanos tus datos.",
          "schedule": "Estamos abiertos de lunes a domingo de 11:00 AM a 10:00 PM.",
          "location": "Nos encontramos en el centro de la ciudad. ¿Necesitas la dirección exacta?",
          "contact": "Puedes contactarnos por teléfono o visitarnos directamente en nuestro restaurante.",
          "default": "Gracias por tu mensaje. En este momento no puedo conectarme con nuestro sistema, pero te responderemos pronto."
        },
        "orderActions": {
          "order": "Quiero ordenar {itemName}"
        }
      },
      'fr': {
        "aria": {
          "openChat": "Ouvrir le chat",
          "closeChat": "Fermer le chat",
          "sendMessage": "Envoyer un message"
        },
        "ui": {
          "title": "ChatBot Dysa",
          "subtitle": "Assistant Virtuel",
          "online": "En ligne",
          "offline": "Hors ligne",
          "placeholder": "Tapez votre message...",
          "typing": "En train d'écrire..."
        },
        "greetings": {
          "default": "Bonjour ! Comment puis-je vous aider aujourd'hui ?"
        },
        "quickActions": {
          "menu": "Voir le menu",
          "reservation": "Faire une réservation",
          "info": "Informations sur le restaurant",
          "contact": "Contact"
        },
        "fallbackResponses": {
          "menu": "Notre menu comprend des plats traditionnels mexicains. Souhaitez-vous voir nos spécialités ?",
          "reservation": "Pour faire une réservation, vous pouvez nous appeler au numéro du restaurant ou nous laisser vos coordonnées.",
          "schedule": "Nous sommes ouverts du lundi au dimanche de 11h00 à 22h00.",
          "location": "Nous sommes situés dans le centre-ville. Avez-vous besoin de l'adresse exacte ?",
          "contact": "Vous pouvez nous contacter par téléphone ou nous rendre visite directement dans notre restaurant.",
          "default": "Merci pour votre message. Je ne peux pas me connecter à notre système en ce moment, mais nous vous répondrons bientôt."
        },
        "orderActions": {
          "order": "Je veux commander {itemName}"
        }
      }
    };

    return translations[locale] || translations['es'];
  }

  async setLocale(locale) {
    await this.loadTranslations(locale);
    this.currentLocale = locale;
  }

  t(key, params = {}) {
    const keys = key.split('.');
    let translation = this.translations[this.currentLocale];
    
    if (!translation) {
      // Fallback to Spanish if current locale not loaded
      translation = this.translations['es'];
    }
    
    if (!translation) {
      return key; // Return key if no translations loaded
    }

    // Navigate through nested keys
    for (const k of keys) {
      translation = translation[k];
      if (translation === undefined) {
        return key; // Return key if translation not found
      }
    }

    // Replace parameters in the translation
    if (typeof translation === 'string' && Object.keys(params).length > 0) {
      return translation.replace(/{([^}]+)}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return translation;
  }

  // Detect browser language and set appropriate locale
  detectAndSetLocale() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // Get language part (e.g., 'en' from 'en-US')
    
    // Check if we support this language
    const supportedLocales = ['en', 'es', 'fr'];
    const locale = supportedLocales.includes(langCode) ? langCode : 'es';
    
    return this.setLocale(locale);
  }

  getCurrentLocale() {
    return this.currentLocale;
  }
}

export default I18n;