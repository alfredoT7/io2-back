const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.isInitializing = false;
  }

  // Inicializar el cliente de WhatsApp
  async initialize() {
    if (this.isInitializing || this.isReady) {
      return;
    }

    this.isInitializing = true;

    try {
      console.log('🚀 Inicializando WhatsApp Web.js...');
      
      this.client = new Client({
        authStrategy: new LocalAuth({
          name: 'pastillas-session'
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      });

      // Evento cuando se genera el QR
      this.client.on('qr', (qr) => {
        console.log('📱 Escanea este código QR con WhatsApp:');
        qrcode.generate(qr, { small: true });
        console.log('👆 Escanea el código QR con tu WhatsApp para conectar');
      });

      // Evento cuando está listo
      this.client.on('ready', () => {
        console.log('✅ WhatsApp Web.js está listo!');
        this.isReady = true;
        this.isInitializing = false;
      });

      // Evento cuando se autentica
      this.client.on('authenticated', () => {
        console.log('🔐 WhatsApp autenticado correctamente');
      });

      // Evento de desconexión
      this.client.on('disconnected', (reason) => {
        console.log('❌ WhatsApp desconectado:', reason);
        this.isReady = false;
        this.isInitializing = false;
      });

      // Evento de error de autenticación
      this.client.on('auth_failure', (msg) => {
        console.error('❌ Error de autenticación WhatsApp:', msg);
        this.isReady = false;
        this.isInitializing = false;
      });

      // Inicializar el cliente
      await this.client.initialize();

    } catch (error) {
      console.error('❌ Error al inicializar WhatsApp:', error);
      this.isReady = false;
      this.isInitializing = false;
      throw error;
    }
  }

  // Formatear número de teléfono para WhatsApp
  formatPhoneNumber(phone) {
    // Limpiar el número (quitar espacios, guiones, etc.)
    let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Si es un número boliviano sin código de país
    if (cleanPhone.match(/^[6-8]\d{7}$/)) {
      cleanPhone = `591${cleanPhone}`;
    }
    
    // Si ya tiene +591, quitarlo para agregar solo 591
    if (cleanPhone.startsWith('+591')) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    // Si no tiene código de país, asumir Bolivia
    if (!cleanPhone.startsWith('591') && cleanPhone.length === 8) {
      cleanPhone = `591${cleanPhone}`;
    }

    return `${cleanPhone}@c.us`;
  }

  // Enviar mensaje de confirmación de compra
  async enviarMensajeCompra(compra, usuario) {
    try {
      if (!this.isReady) {
        console.log('⚠️ WhatsApp no está listo. Inicializando...');
        await this.initialize();
        
        // Esperar un poco más para asegurar conexión
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        if (!this.isReady) {
          throw new Error('WhatsApp no se pudo inicializar');
        }
      }

      // Formatear número de teléfono del envío
      const phoneNumber = this.formatPhoneNumber(compra.envio.telefono);
      
      // Crear mensaje
      const mensaje = this.crearMensajeCompra(compra, usuario);
      
      // Enviar mensaje
      console.log(`📱 Enviando mensaje a: ${phoneNumber}`);
      await this.client.sendMessage(phoneNumber, mensaje);
      
      console.log('✅ Mensaje de WhatsApp enviado exitosamente');
      return true;

    } catch (error) {
      console.error('❌ Error al enviar mensaje de WhatsApp:', error);
      return false;
    }
  }

  // Crear el contenido del mensaje
  crearMensajeCompra(compra, usuario) {
    const fecha = new Date(compra.fechaCreacion).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Crear lista de productos
    const productosTexto = compra.productos.map(producto => 
      `• *${producto.nombre}* x${producto.cantidad} - Bs. ${producto.subtotal}`
    ).join('\n');

    const mensaje = `🛒 *COMPRA CONFIRMADA*

📋 *Orden:* ${compra.numeroOrden}
👤 *Cliente:* ${usuario.nombreCompleto}
📞 *Teléfono:* ${usuario.numeroCelular}

🛍️ *PRODUCTOS:*
${productosTexto}

💰 *TOTAL: Bs. ${compra.total}*

📍 *DATOS DE ENVÍO:*
📍 ${compra.envio.direccion}
🏙️ ${compra.envio.ciudad}
📮 CP: ${compra.envio.codigoPostal}
📱 Tel: ${compra.envio.telefono}

${compra.notas ? `📝 *Notas:* ${compra.notas}\n` : ''}
✅ *Estado:* ${compra.estado.toUpperCase()}
📅 *Fecha:* ${fecha}

¡Gracias por tu compra! 🙏
Tu pedido será procesado pronto.

_Este es un mensaje automático de confirmación._`;

    return mensaje;
  }

  // Obtener estado del servicio
  getStatus() {
    return {
      isReady: this.isReady,
      isInitializing: this.isInitializing,
      hasClient: !!this.client
    };
  }

  // Cerrar conexión
  async destroy() {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.isReady = false;
      this.isInitializing = false;
      console.log('🔴 WhatsApp Service destruido');
    }
  }
}

// Exportar una instancia singleton
const whatsappService = new WhatsAppService();

module.exports = whatsappService;
