#!/bin/bash

# Verificamos si el archivo clima_brandsen.json existe
if [ -f clima_brandsen.json ]; then
    echo "Usando datos del archivo clima_brandsen.json existente..."
    # Copiamos el archivo a la carpeta pública
    echo "Copiando datos a la carpeta pública..."
    cp clima_brandsen.json public/
else
    echo "AVISO: No se encontró el archivo clima_brandsen.json con datos de scraping."
    echo "Se utilizarán datos de ejemplo en la aplicación."
fi

# Iniciamos un servidor HTTP simple en Python
echo "Iniciando servidor HTTP simple en el puerto 8000..."
echo "Para ver el sitio, visita: http://localhost:8000"

# Verificamos si está instalado Python
if command -v python3 &> /dev/null; then
    cd public && python3 -m http.server
elif command -v python &> /dev/null; then
    cd public && python -m http.server
else
    echo "Error: No se encontró Python para iniciar el servidor HTTP."
    exit 1
fi
