#!/bin/bash

# Detectar el sistema operativo para abrir el navegador adecuadamente
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

echo "El monitor de riesgo de incendios se está abriendo en tu navegador..."
echo "Para ver los datos en tiempo real, sería necesario ejecutar un servidor web."
