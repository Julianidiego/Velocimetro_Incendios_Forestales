const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function main(){
    const url = 'http://clima.gestic.com.ar/brandsen/'
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Objeto para almacenar los datos climáticos
    const climaticData = {
        fecha: '',
        hora: '',
        temperatura: {},
        humedad: {},
        puntoRocio: {},
        sensacionTermica: {},
        presionBarometrica: {},
        viento: {},
        lluvia: {}
    };

    // Extraer fecha y hora
    const infoText = $('.alert-info h4').text().trim();
    const fechaMatch = infoText.match(/FECHA: ([\d\/]+)/);
    const horaMatch = infoText.match(/HORA:\s+(\d+:\d+\w)/);
    
    if (fechaMatch && fechaMatch[1]) climaticData.fecha = fechaMatch[1];
    if (horaMatch && horaMatch[1]) climaticData.hora = horaMatch[1];

    // Extraer datos de temperatura
    const temperaturaPanel = $('.panel-primary:contains("TEMPERATURA")').first();
    
    // Extraer temperatura actual
    const tempActual = temperaturaPanel.find('table tr').first().find('td').last().text().trim();
    climaticData.temperatura.actual = tempActual;
    
    // Extraer temperatura diaria mínima y máxima
    const filaDiaria = temperaturaPanel.find('table tr:contains("Diaria")');
    if (filaDiaria.length > 0) {
        climaticData.temperatura.diaria = {
            minima: filaDiaria.find('td').eq(1).text().trim(),
            maxima: filaDiaria.find('td').eq(2).text().trim()
        };
        
        // Extraer horas de mínima y máxima
        const filaHoras = temperaturaPanel.find('table tr:contains("A las")');
        if (filaHoras.length > 0) {
            climaticData.temperatura.horas = {
                minima: filaHoras.find('td').eq(1).text().trim(),
                maxima: filaHoras.find('td').eq(2).text().trim()
            };
        }
    }
    
    // Extraer temperatura mensual mínima y máxima
    const filaMensual = temperaturaPanel.find('table tr:contains("Mensual")');
    if (filaMensual.length > 0) {
        climaticData.temperatura.mensual = {
            minima: filaMensual.find('td').eq(1).text().trim(),
            maxima: filaMensual.find('td').eq(2).text().trim()
        };
    }
    
    // Extraer temperatura anual mínima y máxima
    const filaAnual = temperaturaPanel.find('table tr:contains("Anual")');
    if (filaAnual.length > 0) {
        climaticData.temperatura.anual = {
            minima: filaAnual.find('td').eq(1).text().trim(),
            maxima: filaAnual.find('td').eq(2).text().trim()
        };
    }
    
    // Extraer datos de humedad
    const humedadPanel = $('.panel-primary:contains("HUMEDAD")').first();
    
    // Extraer humedad actual
    const humActual = humedadPanel.find('table tr').first().find('td').last().text().trim();
    climaticData.humedad.actual = humActual;
    
    // Extraer humedad diaria mínima y máxima
    const humFilaDiaria = humedadPanel.find('table tr:contains("Diaria")');
    if (humFilaDiaria.length > 0) {
        climaticData.humedad.diaria = {
            minima: humFilaDiaria.find('td').eq(1).text().trim(),
            maxima: humFilaDiaria.find('td').eq(2).text().trim()
        };
        
        // Extraer horas de mínima y máxima
        const humFilaHoras = humedadPanel.find('table tr:contains("A las")');
        if (humFilaHoras.length > 0) {
            climaticData.humedad.horas = {
                minima: humFilaHoras.find('td').eq(1).text().trim(),
                maxima: humFilaHoras.find('td').eq(2).text().trim()
            };
        }
    }
    
    // Extraer humedad mensual mínima y máxima
    const humFilaMensual = humedadPanel.find('table tr:contains("Mensual")');
    if (humFilaMensual.length > 0) {
        climaticData.humedad.mensual = {
            minima: humFilaMensual.find('td').eq(1).text().trim(),
            maxima: humFilaMensual.find('td').eq(2).text().trim()
        };
    }
    
    // Extraer humedad anual mínima y máxima
    const humFilaAnual = humedadPanel.find('table tr:contains("Anual")');
    if (humFilaAnual.length > 0) {
        climaticData.humedad.anual = {
            minima: humFilaAnual.find('td').eq(1).text().trim(),
            maxima: humFilaAnual.find('td').eq(2).text().trim()
        };
    }
    
    // Extraer punto de rocío
    const rocioPanel = $('.panel-primary:contains("PUNTO DE ROCIO")').first();
    const rocioActual = rocioPanel.find('table tr').first().find('td').last().text().trim();
    climaticData.puntoRocio.actual = rocioActual;
    
    // Extraer sensación térmica
    const sensacionPanel = $('.panel-primary:contains("SENSACION TERMICA")').first();
    
    // Buscar "Temperatura y Viento"
    const sensacionVientoRow = sensacionPanel.find('tr:contains("Temperatura y Viento")').next();
    if (sensacionVientoRow.length > 0) {
        climaticData.sensacionTermica.viento = sensacionVientoRow.find('td').last().text().trim();
    }
    
    // Buscar "Temperatura y Humedad"
    const sensacionHumedadRow = sensacionPanel.find('tr:contains("Temperatura y Humedad")').next();
    if (sensacionHumedadRow.length > 0) {
        climaticData.sensacionTermica.humedad = sensacionHumedadRow.find('td').last().text().trim();
    }
    
    // Extraer presión barométrica
    const presionPanel = $('.panel-primary:contains("PRESION BAROMETRICA")').first();
    const presionActual = presionPanel.find('table tr').first().find('td').last().text().trim();
    climaticData.presionBarometrica.actual = presionActual;
    
    // Extraer datos de viento - necesitamos identificar correctamente el panel de viento
    let vientoPanel;
    
    // Buscar todos los paneles y recorrerlos para encontrar el que realmente contiene "VIENTO"
    $('.panel-primary').each(function(i, panel) {
        const panelTitle = $(panel).find('.panel-title').text().trim();
        if (panelTitle === 'VIENTO') {
            vientoPanel = $(panel);
        }
    });
    
    // Si encontramos el panel de viento, extraemos los datos
    if (vientoPanel && vientoPanel.length > 0) {
        const vientoTable = vientoPanel.find('table').first();
        
        // Extraer velocidad - fila que contiene "Velocidad"
        vientoTable.find('tr').each(function(i, row) {
            const firstCell = $(row).find('td').first().text().trim();
            const lastCell = $(row).find('td').last().text().trim();
            
            if (firstCell.includes('Velocidad')) {
                climaticData.viento.velocidad = lastCell;
            } else if (firstCell.includes('Del Sector')) {
                climaticData.viento.direccion = lastCell;
            } else if (firstCell.includes('Diaria')) {
                if (!climaticData.viento.maximas) climaticData.viento.maximas = {};
                climaticData.viento.maximas.diaria = lastCell;
            } else if (firstCell.includes('A las')) {
                if (!climaticData.viento.maximas) climaticData.viento.maximas = {};
                climaticData.viento.maximas.hora = lastCell;
            } else if (firstCell.includes('Mensual')) {
                if (!climaticData.viento.maximas) climaticData.viento.maximas = {};
                climaticData.viento.maximas.mensual = lastCell;
            } else if (firstCell.includes('Anual')) {
                if (!climaticData.viento.maximas) climaticData.viento.maximas = {};
                climaticData.viento.maximas.anual = lastCell;
            }
        });
    } else {
        console.log("No se pudo encontrar el panel de viento");
    }
    
    // Extraer datos de lluvia
    const lluviaPanel = $('.panel-primary:contains("LLUVIA")').first();
    
    // Extraer lluvia diaria
    const lluviaDiariaRow = lluviaPanel.find('tr:contains("Diaria")').first();
    if (lluviaDiariaRow.length > 0) {
        climaticData.lluvia.diaria = lluviaDiariaRow.find('td').last().text().trim();
    }
    
    // Extraer intensidad de lluvia
    const lluviaIntensidadRow = lluviaPanel.find('tr:contains("Intensidad")');
    if (lluviaIntensidadRow.length > 0) {
        climaticData.lluvia.intensidad = lluviaIntensidadRow.find('td').last().text().trim();
    }
    
    // Extraer lluvia mensual
    const lluviaMensualRow = lluviaPanel.find('tr:contains("Mensual")');
    if (lluviaMensualRow.length > 0) {
        climaticData.lluvia.mensual = lluviaMensualRow.find('td').last().text().trim();
    }
    
    // Extraer lluvia anual
    const lluviaAnualRow = lluviaPanel.find('tr:contains("Anual")');
    if (lluviaAnualRow.length > 0) {
        climaticData.lluvia.anual = lluviaAnualRow.find('td').last().text().trim();
    }
    
    // Imprimir los datos extraídos en formato JSON
    console.log(JSON.stringify(climaticData, null, 2));
    
    // Guardar datos en un archivo JSON
    fs.writeFileSync('clima_brandsen.json', JSON.stringify(climaticData, null, 2));
    
    console.log('Datos climáticos extraídos y guardados en clima_brandsen.json');
}

main().catch(error => {
    console.error('Error al obtener los datos:', error);
});