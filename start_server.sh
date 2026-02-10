#!/bin/bash

# Script para levantar un servidor HTTP en el puerto 8080 con index.html por defecto
# Compatible con sistemas de hosting gratuito (GitHub Pages, Vercel, Netlify, etc.)

# Cambiar al directorio del script
cd "$(dirname "$0")"

# Verificar que index.html existe
if [ ! -f "index.html" ]; then
    echo "Error: index.html no encontrado en $(pwd)"
    exit 1
fi

# Verificar que productos.json existe
if [ ! -f "productos.json" ]; then
    echo "Advertencia: productos.json no encontrado"
fi

echo "========================================="
echo "  Servidor de Papaty - Venta Única"
echo "========================================="
echo ""
echo "Directorio: $(pwd)"
echo "Archivo principal: index.html"
echo "Puerto: 8080"
echo ""
echo "Métodos de despliegue disponibles:"

# Mostrar opciones disponibles
echo ""
echo "OPCIONES DE SERVIDOR LOCAL:"
echo "1. Python 3 (Recomendado)"
echo "2. Node.js (serve)"
echo "3. PHP"
echo "4. Ruby"
echo ""
echo "OPCIONES DE HOSTING GRATUITO:"
echo "• GitHub Pages: Subir a repositorio y activar Pages"
echo "• Vercel: vercel --prod"
echo "• Netlify: netlify deploy --prod"
echo "• Render: Subir como Static Site"
echo ""
read -p "Selecciona opción de servidor local (1-4) o presiona Enter para Python 3: " choice

case "$choice" in
    1|"")
        echo "Usando Python 3..."
        python3 -m http.server 8080
        ;;
    2)
        echo "Usando Node.js..."
        # Verificar si serve está instalado
        if command -v npx &> /dev/null; then
            npx serve . -l 8080
        else
            echo "Error: Node.js/npx no encontrado. Instala Node.js o selecciona otra opción."
            echo "Instalar Node.js: https://nodejs.org/"
            exit 1
        fi
        ;;
    3)
        echo "Usando PHP..."
        if command -v php &> /dev/null; then
            php -S localhost:8080
        else
            echo "Error: PHP no encontrado. Instala PHP o selecciona otra opción."
            exit 1
        fi
        ;;
    4)
        echo "Usando Ruby..."
        if command -v ruby &> /dev/null; then
            ruby -run -ehttpd . -p8080
        else
            echo "Error: Ruby no encontrado. Instala Ruby o selecciona otra opción."
            exit 1
        fi
        ;;
    *)
        echo "Opción inválida. Usando Python 3 por defecto..."
        python3 -m http.server 8080
        ;;
esac