# Despliegue de Papaty - Venta Única

## Opciones de Hosting Gratuito

### 1. GitHub Pages (Más simple)
**Requisitos:**
- Cuenta de GitHub

**Pasos:**
1. Crear un nuevo repositorio en GitHub
2. Subir todos los archivos del proyecto
3. Ir a Settings > Pages
4. Seleccionar branch `main` y carpeta `/ (root)`
5. Guardar cambios
6. Tu sitio estará disponible en: `https://[usuario].github.io/[repositorio]`

**Nota:** GitHub Pages sirve archivos estáticos perfectamente. El archivo `productos.json` se cargará correctamente.

### 2. Vercel (Recomendado para velocidad)
**Requisitos:**
- Cuenta de Vercel
- Vercel CLI opcional

**Pasos con Vercel CLI:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
vercel --prod  # Para producción
```

**Pasos con interfaz web:**
1. Subir archivos a Vercel via drag & drop
2. O conectar tu repositorio de GitHub

**URL:** `https://[nombre-proyecto].vercel.app`

### 3. Netlify
**Requisitos:**
- Cuenta de Netlify

**Pasos:**
1. Arrastrar la carpeta a Netlify Drop
2. O conectar repositorio de GitHub

**URL:** `https://[nombre-proyecto].netlify.app`

### 4. Render
**Requisitos:**
- Cuenta de Render

**Pasos:**
1. Crear nuevo Static Site
2. Conectar repositorio o subir archivos
3. No requiere configuración especial

**URL:** `https://[nombre-proyecto].onrender.com`

## Configuración Especial

### Para GitHub Pages:
No se requiere configuración especial. Solo asegúrate de que:
- `index.html` esté en la raíz
- Las rutas en `productos.json` sean relativas (`images/archivo.jpeg`)
- No uses rutas absolutas (`/images/archivo.jpeg`)

### Para otros servicios:
Los archivos de configuración ya están incluidos:
- `vercel.json` para Vercel
- `netlify.toml` para Netlify

## Testing Local

Usa el script incluido:
```bash
# Dar permisos de ejecución (solo primera vez)
chmod +x start_server.sh

# Ejecutar
./start_server.sh
```

O manualmente con:
```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve . -l 8080

# PHP
php -S localhost:8080
```

## Estructura de Archivos Requeridos

```
landing_papaty/
├── index.html          # Página principal
├── style.css          # Estilos
├── script.js          # Funcionalidad JavaScript
├── productos.json     # Datos de productos (CRÍTICO)
├── images/            # Carpeta de imágenes
│   ├── tostadora.jpeg
│   ├── tetera electrica.jpeg
│   └── ...
├── start_server.sh    # Script para servidor local
├── vercel.json        # Configuración Vercel
├── netlify.toml       # Configuración Netlify
└── DEPLOY.md          # Este archivo
```

## Solución de Problemas

### 1. Imágenes no se cargan
- Verifica que los nombres en `productos.json` coincidan con los archivos
- Usa rutas relativas: `images/nombre.jpeg`
- Codifica espacios: `images/tetera%20electrica.jpeg`

### 2. JSON no se carga
- Verifica que `productos.json` existe
- Revisa la consola del navegador para errores
- Asegúrate de que el servidor sirva archivos `.json`

### 3. CORS o problemas de red
- GitHub Pages: Sin problemas
- Local: Usa `./start_server.sh` para evitar CORS
- Otros: Verifica que el servidor permita acceso a `*.json`

## Actualización de Productos

Para modificar productos:
1. Edita `productos.json`
2. Agrega imágenes nuevas a la carpeta `images/`
3. Actualiza las rutas en el JSON
4. Sube los cambios al hosting

**Formato del JSON:**
```json
{
  "id": 1,
  "nombre": "Nombre del producto",
  "descripcion": "Descripción",
  "imagenes": ["images/archivo1.jpeg", "images/archivo2.jpeg"],
  "precio_mercado": 10000,
  "descuento": 30,
  "precio_final": 7000
}
```

## Notas Importantes

- **Backup**: Mantén copia local de `productos.json`
- **Imágenes**: Optimiza imágenes grandes para mejor carga
- **Testing**: Siempre prueba local antes de subir a producción
- **Dominio personalizado**: Todos los servicios permiten conectar dominio propio