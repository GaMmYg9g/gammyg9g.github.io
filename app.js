// Datos de todas las consultas disponibles
const consultas = {
    saldo: {
        titulo: "Consultar Saldo",
        descripcion: "Consulta tu saldo actual.",
        icono: "💰",
        codigo: "*222#",
        necesitaInput: false
    },
    datos: {
        titulo: "Planes de Datos",
        descripcion: "Consulta los planes de datos disponibles y tu consumo actual.",
        icono: "📊",
        codigo: "*222*238#",
        necesitaInput: false
    },
    voz: {
        titulo: "Planes de Voz",
        descripcion: "Consulta los minutos restantes de tú Plan de Voz.",
        icono: "📞",
        codigo: "*222*869#",
        necesitaInput: false
    },
    sms: {
        titulo: "Planes SMS",
        descripcion: "Consulta los SMS restantes de su Plan de SMS.",
        icono: "💬",
        codigo: "*222*767#",
        necesitaInput: false
    },
    bonos: {
        titulo: "Consultar Bonos",
        descripcion: "Consulte los bonos vigentes.",
        icono: "🎁",
        codigo: "*222*266#",
        necesitaInput: false
    },
    paquetes: {
        titulo: "Comprar Paquetes",
        descripcion: "Acceda al menú para comprar paquetes de datos, voz o SMS.",
        icono: "🛒",
        codigo: "*133#",
        necesitaInput: false
    },
    cliente: {
        titulo: "Atención al Cliente",
        descripcion: "Contacta con el servicio de atención al cliente.",
        icono: "👨‍💼",
        codigo: "*2266#",
        necesitaInput: false
    },
    buzon: {
        titulo: "Buzón de Voz",
        descripcion: "Accede a tu buzón de voz para escuchar mensajes.",
        icono: "📱",
        codigo: "*123#",
        necesitaInput: false
    },
    transferir: {
        titulo: "Transferir Saldo",
        descripcion: "Transfiere saldo a otro número móvil. (Ejemplo: *234*1*1234567890*1234*10.00#)",
        icono: "🔄",
        necesitaInput: true,
        inputs: [
            {
                id: "numero",
                label: "Número del receptor:",
                placeholder: "1234567890",
                tipo: "tel"
            },
            {
                id: "clave",
                label: "Clave de envío:",
                placeholder: "1234",
                tipo: "number"
            },
            {
                id: "importe",
                label: "Importe a transferir:",
                placeholder: "10.00",
                tipo: "number",
                step: "0.01"
            }
        ],
        generarCodigo: function(inputs) {
            // Formato: *234*1*NUMERO*CLAVE*MONTO#
            return `*234*1*${inputs.numero}*${inputs.clave}*${inputs.importe}#`;
        }
    },
    "plan-amigo": {
        titulo: "Plan Amigo",
        descripcion: "Consulta información sobre tu Plan Amigo.",
        icono: "👥",
        codigo: "*222*264#",
        necesitaInput: false
    }
};

// Variables globales
let consultaActual = 'saldo';
let inputsValues = {};
let temaActual = 'purple';

// Elementos del DOM
const elementos = {
    consultIcon: document.getElementById('consultIcon'),
    consultTitle: document.getElementById('consultTitle'),
    consultDescription: document.getElementById('consultDescription'),
    codeDisplay: document.getElementById('codeDisplay'),
    actionBtn: document.getElementById('actionBtn'),
    copyBtn: document.getElementById('copyBtn'),
    notification: document.getElementById('notification'),
    inputFields: document.getElementById('inputFields'),
    menuToggle: document.getElementById('menuToggle'),
    themeToggleMobile: document.getElementById('themeToggleMobile'),
    sidebar: document.getElementById('sidebar'),
    overlay: document.getElementById('overlay'),
    menuItems: document.querySelectorAll('.menu-item'),
    mainContent: document.getElementById('mainContent'),
    themeOptions: document.querySelectorAll('.theme-option')
};

// Inicialización
function inicializarApp() {
    // Cargar tema guardado
    cargarTemaGuardado();
    
    // Configurar menú lateral
    configurarMenu();
    
    // Configurar selector de temas
    configurarTemas();
    
    // Cargar consulta inicial
    cargarConsulta('saldo');
    
    // Configurar eventos de botones
    elementos.actionBtn.addEventListener('click', ejecutarConsulta);
    elementos.copyBtn.addEventListener('click', copiarCodigo);
    
    // Configurar PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registrado con éxito:', registration.scope);
                })
                .catch(error => {
                    console.log('Error al registrar ServiceWorker:', error);
                });
        });
    }
    
    // Solicitar permiso para instalar la PWA
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Mostrar banner de instalación
        setTimeout(() => {
            mostrarNotificacion('¡Instala esta app para usarla sin conexión!', 'info');
        }, 3000);
    });
    
    // Detectar cambio a modo oscuro del sistema
    if (window.matchMedia) {
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        if (prefersDarkScheme.matches && !localStorage.getItem('tema')) {
            cambiarTema('dark');
        }
    }
}

// Configurar menú lateral
function configurarMenu() {
    // Toggle del menú en móviles
    elementos.menuToggle.addEventListener('click', toggleMenu);
    elementos.themeToggleMobile.addEventListener('click', toggleMenu);
    elementos.overlay.addEventListener('click', toggleMenu);
    
    // Eventos para items del menú
    elementos.menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const consulta = this.getAttribute('data-consult');
            
            // Actualizar estado activo
            elementos.menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Cargar consulta
            cargarConsulta(consulta);
            
            // Cerrar menú en móviles
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
}

// Configurar selector de temas
function configurarTemas() {
    elementos.themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const tema = this.getAttribute('data-theme');
            cambiarTema(tema);
            
            // Actualizar estado activo
            elementos.themeOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Cambiar tema
function cambiarTema(tema) {
    // Remover clases de tema anteriores
    document.body.classList.remove('theme-purple', 'theme-red', 'theme-green', 
                                 'theme-blue', 'theme-dark', 'theme-light');
    
    // Aplicar nuevo tema
    document.body.classList.add(`theme-${tema}`);
    temaActual = tema;
    
    // Actualizar color del tema para PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        // Obtener el color primario del tema
        const colors = {
            purple: '#6a11cb',
            red: '#ff416c',
            green: '#11998e',
            blue: '#36d1dc',
            dark: '#232526',
            light: '#3498db'
        };
        metaThemeColor.setAttribute('content', colors[tema] || '#6a11cb');
    }
    
    // Guardar preferencia
    guardarPreferenciaTema(tema);
    
    // Mostrar notificación
    mostrarNotificacion(`Tema cambiado a ${tema}`, 'success');
}

// Guardar preferencia de tema
function guardarPreferenciaTema(tema) {
    try {
        localStorage.setItem('tema', tema);
    } catch (e) {
        console.log('No se pudo guardar el tema en localStorage');
    }
}

// Cargar tema guardado
function cargarTemaGuardado() {
    try {
        const temaGuardado = localStorage.getItem('tema');
        if (temaGuardado) {
            cambiarTema(temaGuardado);
            
            // Actualizar selector visual
            elementos.themeOptions.forEach(option => {
                if (option.getAttribute('data-theme') === temaGuardado) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        }
    } catch (e) {
        console.log('No se pudo cargar el tema de localStorage');
    }
}

// Toggle del menú lateral
function toggleMenu() {
    elementos.sidebar.classList.toggle('active');
    elementos.overlay.classList.toggle('active');
    
    // Prevenir scroll del body cuando el menú está abierto
    if (elementos.sidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// Cargar una consulta específica
function cargarConsulta(consultaId) {
    consultaActual = consultaId;
    const consulta = consultas[consultaId];
    
    // Actualizar interfaz
    elementos.consultIcon.textContent = consulta.icono;
    elementos.consultTitle.textContent = consulta.titulo;
    elementos.consultDescription.textContent = consulta.descripcion;
    
    // Actualizar botón de acción
    if (consultaId === 'transferir') {
        elementos.actionBtn.textContent = 'Transferir Saldo';
    } else {
        const palabras = consulta.titulo.split(' ');
        const ultimaPalabra = palabras[palabras.length - 1];
        elementos.actionBtn.textContent = `Consultar ${ultimaPalabra}`;
    }
    
    // Limpiar valores de inputs
    inputsValues = {};
    
    // Manejar campos de entrada
    if (consulta.necesitaInput && consulta.inputs) {
        mostrarInputs(consulta.inputs);
        elementos.codeDisplay.textContent = 'Complete los campos arriba';
    } else {
        elementos.inputFields.innerHTML = '';
        elementos.codeDisplay.textContent = consulta.codigo;
    }
    
    // Ocultar notificación
    elementos.notification.style.display = 'none';
}

// Mostrar campos de entrada
function mostrarInputs(inputs) {
    elementos.inputFields.innerHTML = '';
    
    inputs.forEach(input => {
        const div = document.createElement('div');
        div.className = 'input-group';
        
        const label = document.createElement('label');
        label.className = 'input-label';
        label.textContent = input.label;
        label.htmlFor = input.id;
        
        const field = document.createElement('input');
        field.type = input.tipo || 'text';
        field.id = input.id;
        field.className = 'input-field';
        field.placeholder = input.placeholder || '';
        
        if (input.maxlength) field.maxLength = input.maxlength;
        if (input.minlength) field.minLength = input.minlength;
        if (input.step) field.step = input.step;
        
        // Evento para actualizar código en tiempo real
        field.addEventListener('input', function() {
            let value = this.value;
            
            // Validación en tiempo real
            if (input.id === 'numero') {
                // Permitir solo números
                value = value.replace(/\D/g, '');
                this.value = value;
            }
            
            if (input.id === 'clave') {
                // Permitir solo números y limitar a 4 dígitos
                value = value.replace(/\D/g, '').slice(0, 4);
                this.value = value;
            }
            
            if (input.id === 'importe') {
                // Validar formato de moneda
                value = value.replace(/[^0-9.]/g, '');
                // Evitar múltiples puntos decimales
                const parts = value.split('.');
                if (parts.length > 2) {
                    value = parts[0] + '.' + parts.slice(1).join('');
                }
                // Limitar a 2 decimales
                if (parts[1] && parts[1].length > 2) {
                    value = parts[0] + '.' + parts[1].substring(0, 2);
                }
                this.value = value;
            }
            
            inputsValues[input.id] = this.value;
            actualizarCodigoDinamico();
        });
        
        div.appendChild(label);
        div.appendChild(field);
        elementos.inputFields.appendChild(div);
    });
}

// Actualizar código dinámico para consultas con inputs
function actualizarCodigoDinamico() {
    const consulta = consultas[consultaActual];
    
    if (consulta.necesitaInput && consulta.generarCodigo) {
        // Validar que todos los campos tengan valor
        const todosCompletos = consulta.inputs.every(input => {
            return inputsValues[input.id] && inputsValues[input.id].trim() !== '';
        });
        
        if (todosCompletos) {
            elementos.codeDisplay.textContent = consulta.generarCodigo(inputsValues);
        } else {
            elementos.codeDisplay.textContent = 'Complete los campos arriba';
        }
    }
}

// Ejecutar consulta (marcar número)
function ejecutarConsulta() {
    const consulta = consultas[consultaActual];
    let codigo = '';
    
    // Obtener el código a marcar
    if (consulta.necesitaInput && consulta.generarCodigo) {
        // Validar campos
        const todosCompletos = consulta.inputs.every(input => {
            return inputsValues[input.id] && inputsValues[input.id].trim() !== '';
        });
        
        if (!todosCompletos) {
            mostrarNotificacion('Por favor, complete todos los campos.', 'error');
            return;
        }
        
        // Validaciones específicas para transferencia
        if (consultaActual === 'transferir') {
            const importe = parseFloat(inputsValues['importe']);
            if (isNaN(importe) || importe <= 0) {
                mostrarNotificacion('Ingrese un importe válido mayor a 0.', 'error');
                return;
            }
            
            const clave = inputsValues['clave'];
            // Validar que sea numérico y tenga al menos 4 dígitos
            if (!/^\d+$/.test(clave)) {
                mostrarNotificacion('La clave debe contener solo números.', 'error');
                return;
            }
            if (clave.length < 4) {
                mostrarNotificacion('La clave debe tener al menos 4 dígitos.', 'error');
                return;
            }
            
            const numero = inputsValues['numero'].replace(/\D/g, ''); // Remover cualquier carácter no numérico
            if (!/^\d+$/.test(numero)) {
                mostrarNotificacion('El número debe contener solo dígitos.', 'error');
                return;
            }
            if (numero.length < 10) {
                mostrarNotificacion('El número debe tener al menos 10 dígitos.', 'error');
                return;
            }
            
            // Actualizar el valor limpio en inputsValues
            inputsValues['numero'] = numero;
        }
        
        codigo = consulta.generarCodigo(inputsValues);
    } else {
        codigo = consulta.codigo;
    }
    
    // Codificar el # para URI
    const codigoCodificado = codigo.replace('#', '%23');
    
    // Mostrar notificación
    mostrarNotificacion('Redirigiendo a la aplicación de llamadas...', 'success');
    
    // Intentar usar el protocolo tel: para dispositivos móviles
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Es un dispositivo móvil
        const telLink = document.createElement('a');
        telLink.href = `tel:${codigoCodificado}`;
        telLink.click();
    } else {
        // Es un dispositivo de escritorio
        mostrarNotificacion(`En un dispositivo móvil, esto abriría la aplicación de llamadas con:<br><strong>${codigo}</strong><br><br>En escritorio, copia el código y márcalo manualmente en tu teléfono.`, 'info');
    }
    
    // Cambiar texto del botón momentáneamente
    const originalText = elementos.actionBtn.textContent;
    elementos.actionBtn.textContent = 'Marcando...';
    elementos.actionBtn.disabled = true;
    
    // Restaurar botón después de 3 segundos
    setTimeout(() => {
        elementos.actionBtn.textContent = originalText;
        elementos.actionBtn.disabled = false;
    }, 3000);
}

// Copiar código al portapapeles
function copiarCodigo() {
    const consulta = consultas[consultaActual];
    let codigo = '';
    
    // Obtener el código a copiar
    if (consulta.necesitaInput && consulta.generarCodigo) {
        // Validar campos si es necesario
        const todosCompletos = consulta.inputs.every(input => {
            return inputsValues[input.id] && inputsValues[input.id].trim() !== '';
        });
        
        if (!todosCompletos) {
            mostrarNotificacion('Complete los campos antes de copiar el código.', 'error');
            return;
        }
        
        codigo = consulta.generarCodigo(inputsValues);
    } else {
        codigo = consulta.codigo;
    }
    
    // Usar Clipboard API si está disponible
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(codigo)
            .then(() => {
                mostrarNotificacion('Código copiado al portapapeles: ' + codigo, 'success');
            })
            .catch(err => {
                console.error('Error al copiar: ', err);
                copiarFallback(codigo);
            });
    } else {
        copiarFallback(codigo);
    }
}

// Método alternativo para copiar
function copiarFallback(codigo) {
    const textArea = document.createElement('textarea');
    textArea.value = codigo;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        mostrarNotificacion('Código copiado al portapapeles: ' + codigo, 'success');
    } catch (err) {
        console.error('Error al copiar: ', err);
        mostrarNotificacion('No se pudo copiar el código. Puedes seleccionarlo manualmente.', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo) {
    elementos.notification.innerHTML = mensaje;
    elementos.notification.className = `notification ${tipo}`;
    elementos.notification.style.display = 'block';
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        elementos.notification.style.display = 'none';
    }, 5000);
}

// Iniciar la aplicación cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', inicializarApp);

// Detectar cambios de tamaño de ventana
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        // En escritorio, asegurar que el menú esté visible
        elementos.sidebar.classList.remove('active');
        elementos.overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});