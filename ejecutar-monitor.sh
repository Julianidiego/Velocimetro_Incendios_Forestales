#!/bin/bash

# Script para ejecutar el scraping y luego abrir la aplicación web

echo "Ejecutando scraper para obtener datos climáticos actualizados..."
node index.js

echo "Datos climáticos actualizados correctamente."

# Intenta copiar el archivo JSON a la carpeta pública para acceso directo
echo "Copiando datos a la carpeta pública..."
cp clima_brandsen.json public/

# Detectar el sistema operativo para abrir el navegador adecuadamente
echo "Abriendo la aplicación web en el navegador..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open &> /dev/null; then
        xdg-open "public/index.html"
    else
        echo "No se pudo abrir el navegador automáticamente. Por favor, abre manualmente el archivo 'public/index.html'"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "public/index.html"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    start "public/index.html"
else
    echo "Sistema operativo no reconocido. Por favor, abre manualmente el archivo 'public/index.html'"
fi

echo "Monitor de riesgo de incendios abierto con datos reales del scraping."
echo "Para actualizar los datos, haz clic en el botón 'Actualizar Datos' en la aplicación."
