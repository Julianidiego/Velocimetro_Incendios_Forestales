# Velocímetro de Riesgo de Incendios Forestales

Aplicación web interactiva que muestra un velocímetro de riesgo de incendios forestales basado en datos climáticos en tiempo real.

## Características

- Visualización interactiva tipo velocímetro que muestra el nivel de riesgo de incendios
- Implementación de la "Regla del 30" para la evaluación de riesgos:
  - Temperatura > 30°C
  - Humedad < 30%
  - Viento > 30km/h
- Muestra datos climáticos en tiempo real (temperatura, humedad, velocidad del viento)
- Diseño responsive para dispositivos móviles
- Funcionalidad para capturar y descargar la visualización como imagen
- Indicadores visuales que muestran qué factores contribuyen al nivel de riesgo

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Node.js (para scraping web)

## Instalación

1. Clonar este repositorio:
   ```
   git clone https://github.com/Julianidiego/Velocimetro_Incendios_Forestales.git
   ```

2. Navegar a la carpeta del proyecto:
   ```
   cd Velocimetro_Incendios_Forestales
   ```

3. Ejecutar el servidor local:
   ```
   bash iniciar-servidor.sh
   ```

4. Abrir en el navegador:
   ```
   http://localhost:8000
   ```

## Uso

La aplicación mostrará automáticamente los datos climáticos actuales y el nivel de riesgo calculado. Para capturar una imagen del velocímetro, utilice el botón "Descargar imagen" en la interfaz.

## Estructura del proyecto

- `index.js`: Script para web scraping de datos climáticos
- `clima_brandsen.json`: Datos climáticos obtenidos
- `public/`: Carpeta con archivos para el cliente web
  - `index.html`: Estructura principal HTML
  - `css/styles.css`: Estilos CSS
  - `js/script.js`: Lógica del frontend
- `iniciar-servidor.sh`: Script para iniciar el servidor local
- `ejecutar-monitor.sh`: Script para ejecutar la aplicación

## Licencia

[Incluir información de licencia aquí]
