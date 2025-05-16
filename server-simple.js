const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const cheerio = require('cheerio');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock de datos para evitar errores con el scraping
const mockClimaticData = {
    fecha: '16/05/2025',
    hora: '10:30AM',
    temperatura: {
        actual: '28.5°C',
        valorActual: 28.5,
        diaria: {
            minima: '18.2°C',
            maxima: '29.1°C'
        },
        horas: {
            minima: '05:15AM',
            maxima: '02:30PM'
        },
        mensual: {
            minima: '12.0°C',
            maxima: '35.2°C'
        },
        anual: {
            minima: '4.1°C',
            maxima: '39.8°C'
        }
    },
    humedad: {
        actual: '35%',
        valorActual: 35,
        diaria: {
            minima: '30%',
            maxima: '85%'
        },
        horas: {
            minima: '02:30PM',
            maxima: '06:00AM'
        },
        mensual: {
            minima: '22%',
            maxima: '95%'
        },
        anual: {
            minima: '15%',
            maxima: '100%'
        }
    },
    puntoRocio: {
        actual: '12.5°C'
    },
    sensacionTermica: {
        viento: '27.8°C',
        humedad: '30.2°C'
    },
    presionBarometrica: {
        actual: '1012 hPa'
    },
    viento: {
        velocidad: '25 km/h',
        valorActual: 25,
        direccion: 'NE',
        maximas: {
            diaria: '38 km/h',
            hora: '01:15PM',
            mensual: '65 km/h',
            anual: '95 km/h'
        }
    },
    lluvia: {
        diaria: '0.0 mm',
        intensidad: '0.0 mm/h',
        mensual: '45.2 mm',
        anual: '235.8 mm'
    },
    nivelRiesgo: 'Moderado'
};

// Función para obtener datos del archivo local
function obtenerDatosArchivo() {
    try {
        if (fs.existsSync(path.join(__dirname, 'clima_brandsen.json'))) {
            const rawData = fs.readFileSync(path.join(__dirname, 'clima_brandsen.json'), 'utf8');
            const data = JSON.parse(rawData);
            
            // Calcular nivel de riesgo
            let nivelRiesgo = "Bajo";
            let factoresRiesgo = 0;
            
            const tempValue = data.temperatura?.valorActual;
            const humValue = data.humedad?.valorActual;
            const vientoValue = data.viento?.valorActual;
            
            if (tempValue && tempValue >= 30) factoresRiesgo++;
            if (humValue && humValue <= 30) factoresRiesgo++;
            if (vientoValue && vientoValue >= 30) factoresRiesgo++;
            
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
            if (tempValue && humValue && tempValue >= 35 && humValue <= 20) {
                nivelRiesgo = "Extremo";
            } else if (tempValue && humValue && tempValue >= 33 && humValue <= 25) {
                if (nivelRiesgo !== "Extremo") nivelRiesgo = "Muy Alto";
            }
            
            data.nivelRiesgo = nivelRiesgo;
            
            return data;
        }
        return mockClimaticData;
    } catch (error) {
        console.error('Error al leer el archivo de datos climáticos:', error);
        return mockClimaticData;
    }
}

// Endpoint para obtener datos climáticos
app.get('/api/clima', (req, res) => {
    try {
        // Obtener datos del archivo local
        const climaticData = obtenerDatosArchivo();
        res.json(climaticData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Error al obtener datos climáticos',
            data: mockClimaticData 
        });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
    console.log(`Para ver la aplicación, abre un navegador y visita http://localhost:${port}`);
});
