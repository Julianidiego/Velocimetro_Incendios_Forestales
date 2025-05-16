// Variables globales
let datosClimaticos = {};
let nivelRiesgoActual = 'bajo';
let isLoading = false;
let usarArchivoLocal = true; // Indica si debe usar el archivo local o el endpoint de la API

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos iniciales
    cargarDatosClimaticos();
    
    // Configurar eventos
    document.getElementById('actualizar-btn').addEventListener('click', actualizarDatosClimaticos);
    document.getElementById('captura-btn').addEventListener('click', capturarVelocimetro);
});

// Función para cargar los datos climáticos
function cargarDatosClimaticos() {
    if (usarArchivoLocal) {
        cargarDatosDesdeArchivoLocal();
    } else {
        obtenerDatosClimaticos();
    }
}

// Función para cargar datos desde el archivo JSON local
async function cargarDatosDesdeArchivoLocal() {
    if (isLoading) return;
    
    isLoading = true;
    mostrarCargando(true);
    
    try {
        // Leer el archivo JSON con los datos del scraping
        // Añadimos un parámetro para evitar el caché del navegador
        const response = await fetch('clima_brandsen.json?' + new Date().getTime());
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const datos = await response.json();
        
        // Procesar los datos para extraer valores numéricos
        procesarDatosNumericos(datos);
        
        // Actualizar la interfaz con los nuevos datos
        actualizarInterfaz(datos);
        
    } catch (error) {
        console.error('Error al cargar datos desde archivo local:', error);
        mostrarError('No se pudieron cargar los datos. Se usarán datos de ejemplo.');
        
        // Usar datos de ejemplo en caso de error
        usarDatosEjemplo();
    } finally {
        isLoading = false;
        mostrarCargando(false);
    }
}

// Función para procesar valores numéricos de los datos
function procesarDatosNumericos(datos) {
    try {
        // Extraer solo el número de la temperatura actual
        const tempMatchRes = datos.temperatura.actual.match(/(\d+\.?\d*)/);
        const tempValue = tempMatchRes ? parseFloat(tempMatchRes[1]) : null;
        datos.temperatura.valorActual = tempValue;
        
        // Extraer solo el número de la humedad actual
        const humMatchRes = datos.humedad.actual.match(/(\d+\.?\d*)/);
        const humValue = humMatchRes ? parseFloat(humMatchRes[1]) : null;
        datos.humedad.valorActual = humValue;
        
        // Extraer solo el número de la velocidad del viento
        const vientoMatchRes = datos.viento.velocidad ? datos.viento.velocidad.match(/(\d+\.?\d*)/) : null;
        const vientoValue = vientoMatchRes ? parseFloat(vientoMatchRes[1]) : null;
        datos.viento.valorActual = vientoValue;
        
        // Calcular el nivel de riesgo según la regla de los 30
        let nivelRiesgo = "Bajo";
        let factoresRiesgo = 0;
        
        if (tempValue >= 30) factoresRiesgo++;
        if (humValue <= 30) factoresRiesgo++;
        if (vientoValue >= 30) factoresRiesgo++;
        
        switch (factoresRiesgo) {
            case 0:
                nivelRiesgo = "Bajo";
                break;
            case 1:
                nivelRiesgo = "Moderado";
                break;
            case 2:
                nivelRiesgo = "Alto";
                break;
            case 3:
                nivelRiesgo = "Extremo";
                break;
            default:
                nivelRiesgo = "Bajo";
        }
        
        // Si la temperatura es muy alta o la humedad muy baja, aumentar el riesgo
        if (tempValue >= 35 && humValue <= 20) {
            nivelRiesgo = "Extremo";
        } else if (tempValue >= 33 && humValue <= 25) {
            if (nivelRiesgo !== "Extremo") nivelRiesgo = "Muy Alto";
        }
        
        datos.nivelRiesgo = nivelRiesgo;
    } catch (error) {
        console.error("Error al procesar datos numéricos:", error);
    }
}

// Función para actualizar los datos
function actualizarDatosClimaticos() {
    mostrarCargando(true);
    
    // Mostramos un mensaje informativo
    const mensajeDiv = document.createElement('div');
    mensajeDiv.textContent = 'Actualizando datos climáticos...';
    mensajeDiv.style.position = 'fixed';
    mensajeDiv.style.top = '10px';
    mensajeDiv.style.left = '50%';
    mensajeDiv.style.transform = 'translateX(-50%)';
    mensajeDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
    mensajeDiv.style.color = 'white';
    mensajeDiv.style.padding = '10px 20px';
    mensajeDiv.style.borderRadius = '5px';
    mensajeDiv.style.zIndex = '9999';
    document.body.appendChild(mensajeDiv);
    
    // Hacer una solicitud al servidor para ejecutar el scraping en tiempo real
    // En un entorno web sin servidor, forzamos una recarga del archivo JSON ignorando la caché
    let timeStamp = new Date().getTime();
    
    fetch(`clima_brandsen.json?t=${timeStamp}`, {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar los datos actualizados');
        }
        return response.json();
    })
    .then(datos => {
        // Procesar los datos para extraer valores numéricos
        procesarDatosNumericos(datos);
        
        // Actualizar la interfaz con los nuevos datos
        actualizarInterfaz(datos);
        
        // Notificar el éxito
        document.body.removeChild(mensajeDiv);
        
        // Notificamos al usuario
        const notificacionDiv = document.createElement('div');
        notificacionDiv.textContent = 'Datos actualizados correctamente';
        notificacionDiv.style.position = 'fixed';
        notificacionDiv.style.top = '10px';
        notificacionDiv.style.left = '50%';
        notificacionDiv.style.transform = 'translateX(-50%)';
        notificacionDiv.style.backgroundColor = 'rgba(0,128,0,0.8)';
        notificacionDiv.style.color = 'white';
        notificacionDiv.style.padding = '10px 20px';
        notificacionDiv.style.borderRadius = '5px';
        notificacionDiv.style.zIndex = '9999';
        document.body.appendChild(notificacionDiv);
        
        setTimeout(() => {
            document.body.removeChild(notificacionDiv);
        }, 3000);
    })
    .catch(error => {
        console.error('Error al actualizar datos:', error);
        document.body.removeChild(mensajeDiv);
        
        // Mostrar mensaje de error
        mostrarError('Error al actualizar los datos. Intente nuevamente.');
        
        // Finalmente, esconder el indicador de carga
        mostrarCargando(false);
    })
    .finally(() => {
        isLoading = false;
    });
}

// Función para obtener datos climáticos del servidor API
async function obtenerDatosClimaticos() {
    if (isLoading) return;
    
    isLoading = true;
    mostrarCargando(true);
    
    try {
        const response = await fetch('/api/clima');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        datosClimaticos = await response.json();
        
        // Actualizar la interfaz con los nuevos datos
        actualizarInterfaz(datosClimaticos);
        
    } catch (error) {
        console.error('Error al obtener datos climáticos desde API:', error);
        mostrarError('No se pudieron cargar los datos desde la API. Intentando con archivo local...');
        
        // Si falla la API, intentar con el archivo local
        cargarDatosDesdeArchivoLocal();
    } finally {
        isLoading = false;
        mostrarCargando(false);
    }
}

// Función para mostrar/ocultar indicador de carga
function mostrarCargando(show) {
    const btnActualizar = document.getElementById('actualizar-btn');
    
    if (show) {
        btnActualizar.disabled = true;
        btnActualizar.innerHTML = '<i class="fas fa-sync fa-spin"></i> Actualizando...';
    } else {
        btnActualizar.disabled = false;
        btnActualizar.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Datos';
    }
}

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
    console.error(mensaje);
    
    // Crear un elemento para mostrar el error de forma más amigable
    const errorDiv = document.createElement('div');
    errorDiv.textContent = mensaje;
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '10px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.backgroundColor = 'rgba(255,0,0,0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px 20px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.zIndex = '9999';
    document.body.appendChild(errorDiv);
    
    // Eliminar el mensaje después de 5 segundos
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
}

// Función para actualizar toda la interfaz con los nuevos datos
function actualizarInterfaz(datos) {
    // Actualizar fecha y hora
    document.getElementById('fecha-actualizacion').textContent = datos.fecha || 'No disponible';
    document.getElementById('hora-actualizacion').textContent = datos.hora || '';
    
    // Actualizar nivel de riesgo y velocímetro
    actualizarNivelRiesgo(datos.nivelRiesgo || 'Bajo');
    
    // Actualizar valores de temperatura, humedad y viento
    actualizarParametro('temperatura', datos.temperatura.actual, datos.temperatura.valorActual >= 30);
    actualizarParametro('humedad', datos.humedad.actual, datos.humedad.valorActual <= 30);
    actualizarParametro('viento', datos.viento.velocidad, datos.viento.valorActual >= 30);
    
    // Actualizar dirección del viento si está disponible
    if (datos.viento && datos.viento.direccion) {
        document.getElementById('direccion-viento').textContent = `Dirección: ${datos.viento.direccion}`;
    }
}

// Función para actualizar cada parámetro meteorológico
function actualizarParametro(tipo, valor, cumpleRegla30) {
    const elementoValor = document.getElementById(`${tipo}-actual`);
    const elementoRegla = document.getElementById(`regla-${tipo}`);
    const elementoFactor = document.getElementById(`factor-${tipo}`);
    
    if (elementoValor) {
        elementoValor.textContent = valor || 'No disponible';
    }
    
    if (elementoRegla) {
        elementoRegla.classList.remove('activo', 'alerta', 'normal');
        
        let mensaje = '';
        if (cumpleRegla30 !== undefined) {
            elementoRegla.classList.add('activo');
            
            if (cumpleRegla30) {
                elementoRegla.classList.add('alerta');
                
                switch (tipo) {
                    case 'temperatura':
                        mensaje = 'Superior a 30°C (Factor de riesgo)';
                        break;
                    case 'humedad':
                        mensaje = 'Inferior a 30% (Factor de riesgo)';
                        break;
                    case 'viento':
                        mensaje = 'Superior a 30 km/h (Factor de riesgo)';
                        break;
                }
            } else {
                elementoRegla.classList.add('normal');
                
                switch (tipo) {
                    case 'temperatura':
                        mensaje = 'Inferior a 30°C (Normal)';
                        break;
                    case 'humedad':
                        mensaje = 'Superior a 30% (Normal)';
                        break;
                    case 'viento':
                        mensaje = 'Inferior a 30 km/h (Normal)';
                        break;
                }
            }
            
            elementoRegla.textContent = mensaje;
        }
    }
    
    // Actualizar el factor de riesgo
    if (elementoFactor) {
        elementoFactor.classList.remove('activo', 'alerta', 'normal');
        elementoFactor.classList.add('activo');
        
        if (cumpleRegla30) {
            elementoFactor.classList.add('alerta');
        } else {
            elementoFactor.classList.add('normal');
        }
    }
}

// Función para actualizar el nivel de riesgo y mover la aguja del velocímetro
function actualizarNivelRiesgo(nivel) {
    nivel = nivel.toLowerCase();
    const elementoNivel = document.getElementById('nivel-riesgo');
    const aguja = document.querySelector('.aguja');
    
    if (elementoNivel) {
        elementoNivel.textContent = nivel.charAt(0).toUpperCase() + nivel.slice(1);
        elementoNivel.className = 'etiqueta-nivel ' + nivel;
    }
    
    // Calcular el ángulo de la aguja según el nivel de riesgo
    let angulo = 0;
    
    switch (nivel) {
        case 'bajo':
            angulo = -80;
            break;
        case 'moderado':
            angulo = -40;
            break;
        case 'alto':
            angulo = 0;
            break;
        case 'muy alto':
        case 'muy-alto':
            angulo = 40;
            break;
        case 'extremo':
            angulo = 80;
            break;
        default:
            angulo = -80; // Por defecto, nivel bajo
    }
    
    if (aguja) {
        aguja.style.transform = `rotate(${angulo}deg)`;
    }
    
    // Almacenar el nivel de riesgo actual
    nivelRiesgoActual = nivel;
}

// Función para capturar el velocímetro y descargar como imagen
async function capturarVelocimetro() {
    const velocimetroSection = document.querySelector('.medidor-container');
    const fechaHora = new Date().toLocaleString('es-AR');
    
    try {
        // Mostrar mensaje de captura
        const capturaMsg = document.createElement('div');
        capturaMsg.textContent = 'Generando captura...';
        capturaMsg.style.position = 'fixed';
        capturaMsg.style.top = '10px';
        capturaMsg.style.left = '50%';
        capturaMsg.style.transform = 'translateX(-50%)';
        capturaMsg.style.backgroundColor = 'rgba(0,0,0,0.8)';
        capturaMsg.style.color = 'white';
        capturaMsg.style.padding = '10px 20px';
        capturaMsg.style.borderRadius = '5px';
        capturaMsg.style.zIndex = '9999';
        document.body.appendChild(capturaMsg);
        
        // Añadir marca temporal al velocímetro para la captura
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'captura-timestamp';
        timestampDiv.innerHTML = `<p><strong>Fecha y hora:</strong> ${fechaHora}</p>
                                  <p><strong>Datos de Brandsen</strong></p>`;
        timestampDiv.style.backgroundColor = 'white';
        timestampDiv.style.padding = '10px';
        timestampDiv.style.marginTop = '10px';
        timestampDiv.style.textAlign = 'center';
        timestampDiv.style.borderRadius = '5px';
        timestampDiv.style.border = '1px solid #ddd';
        velocimetroSection.appendChild(timestampDiv);
        
        // Realizar la captura
        const canvas = await html2canvas(velocimetroSection, {
            backgroundColor: null,
            scale: 2, // Mayor calidad
            logging: false
        });
        
        // Convertir a imagen
        const imagen = canvas.toDataURL('image/png');
        
        // Crear un enlace para descargar la imagen
        const enlace = document.createElement('a');
        enlace.href = imagen;
        enlace.download = `riesgo-incendios-${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
        
        // Eliminar el timestamp después de la captura
        velocimetroSection.removeChild(timestampDiv);
        
        // Eliminar mensaje de captura
        setTimeout(() => {
            document.body.removeChild(capturaMsg);
        }, 1000);
        
    } catch (error) {
        console.error('Error al capturar velocímetro:', error);
        mostrarError('No se pudo generar la captura.');
    }
}

// Función para formatear la fecha y hora
function formatearFechaHora(fechaStr) {
    if (!fechaStr) return '';
    
    try {
        // Convertir fecha del formato "DD/MM/YY" a un objeto Date
        const partes = fechaStr.split('/');
        if (partes.length !== 3) return fechaStr;
        
        const dia = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // Los meses en JavaScript van de 0 a 11
        let anio = parseInt(partes[2], 10);
        
        // Ajustar el año si es de dos dígitos
        if (anio < 100) {
            anio += 2000;
        }
        
        const fecha = new Date(anio, mes, dia);
        return fecha.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (e) {
        console.error('Error al formatear fecha:', e);
        return fechaStr;
    }
}

// Función para usar datos de ejemplo si hay algún error
function usarDatosEjemplo() {
    const datosEjemplo = {
        "fecha": "16/05/2025",
        "hora": "10:30AM",
        "temperatura": {
            "actual": "28.5°C",
            "valorActual": 28.5,
            "diaria": {
                "minima": "18.2°C",
                "maxima": "29.1°C"
            }
        },
        "humedad": {
            "actual": "35%",
            "valorActual": 35,
            "diaria": {
                "minima": "30%",
                "maxima": "85%"
            }
        },
        "viento": {
            "velocidad": "25 km/h",
            "valorActual": 25,
            "direccion": "NE"
        },
        "nivelRiesgo": "Moderado"
    };
    
    // Actualizar la interfaz con los datos de ejemplo
    actualizarInterfaz(datosEjemplo);
}
