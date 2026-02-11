// Variables globales
let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let productoActual = 0;
let imagenIndices = [];

// DOM Elements
const carousel = document.getElementById('carousel');
const carouselDots = document.getElementById('carouselDots');
const productTitle = document.getElementById('productTitle');
const productDescription = document.getElementById('productDescription');
const marketPrice = document.getElementById('marketPrice');
const discountPercent = document.getElementById('discountPercent');
const finalPrice = document.getElementById('finalPrice');
const addToCartBtn = document.getElementById('addToCart');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Formatear precio en CLP
function formatoPrecio(precio) {
    return '$' + precio.toLocaleString('es-CL');
}

 // Cargar productos desde JSON
async function cargarProductos() {
    try {
        console.log('Cargando productos.json...');
        const response = await fetch('productos.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar productos.json');
        }
        const datos = await response.json();
        console.log(`Se cargaron ${datos.length} productos`);
        
        // Mapear campos del JSON a los nombres usados en el código
        productos = datos.map(producto => ({
            id: producto.id,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            imagenes: producto.imagenes || [producto.imagen || ''],
            precioMercado: producto.precio_mercado,
            descuento: producto.descuento,
            precioFinal: producto.precio_final
        }));

        // Si el carrito está vacío, agregar el primer producto
        if (carrito.length === 0 && productos.length > 0) {
            carrito.push({
                id: productos[0].id,
                cantidad: 1
            });
            console.log('Carrito vacío - agregado primer producto automáticamente');
        }

        // Inicializar la interfaz
        inicializarCarrusel();
        actualizarCarrito();
        configurarEventListeners();
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarNotificacion('Error cargando los productos. Recarga la página.');
        
        // Mostrar mensaje de error en el carrusel
        carousel.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i><p>No se pudieron cargar los productos. Verifica que productos.json exista y tenga el formato correcto.</p></div>';
        carouselDots.innerHTML = '';
        
        // Limpiar información del producto
        productTitle.textContent = 'Error';
        productDescription.textContent = 'No se pudieron cargar los productos.';
        marketPrice.textContent = '$0';
        discountPercent.textContent = '0%';
        finalPrice.textContent = '$0';
        
        // Deshabilitar botones
        addToCartBtn.disabled = true;
        addToCartBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error cargando productos';
        addToCartBtn.classList.add('disabled');
    }
}

 // Inicializar carrusel
function inicializarCarrusel() {
    carousel.innerHTML = '';
    carouselDots.innerHTML = '';
    
    // Inicializar índices de imagen para cada producto (0 para cada uno)
    imagenIndices = productos.map(() => 0);
    
    productos.forEach((producto, index) => {
        // Crear item del carrusel
        const item = document.createElement('div');
        item.className = 'carousel-item';
        item.dataset.productIndex = index;
        
        // Contenedor para imagen y controles
        const imageContainer = document.createElement('div');
        imageContainer.className = 'carousel-image-container';
        
        // Imagen principal
        const img = document.createElement('img');
        img.className = 'carousel-main-image';
        img.dataset.productIndex = index;
        img.alt = producto.nombre;
        
        // Controles de navegación de imágenes (solo si hay más de una imagen)
        if (producto.imagenes.length > 1) {
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'image-controls';
            
            // Botón anterior
            const prevImageBtn = document.createElement('button');
            prevImageBtn.className = 'image-control-btn prev-image';
            prevImageBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevImageBtn.dataset.productIndex = index;
            prevImageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cambiarImagen(index, -1);
            });
            
            // Botón siguiente
            const nextImageBtn = document.createElement('button');
            nextImageBtn.className = 'image-control-btn next-image';
            nextImageBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextImageBtn.dataset.productIndex = index;
            nextImageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cambiarImagen(index, 1);
            });
            
            // Indicador de posición (ej: 1/3)
            const positionIndicator = document.createElement('div');
            positionIndicator.className = 'image-position-indicator';
            positionIndicator.dataset.productIndex = index;
            positionIndicator.textContent = `1/${producto.imagenes.length}`;
            
            controlsContainer.appendChild(prevImageBtn);
            controlsContainer.appendChild(positionIndicator);
            controlsContainer.appendChild(nextImageBtn);
            imageContainer.appendChild(controlsContainer);
        }
        
        imageContainer.appendChild(img);
        item.appendChild(imageContainer);
        carousel.appendChild(item);
        
        // Crear dot
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => irAPosicion(index));
        carouselDots.appendChild(dot);
    });
    
    // Inicializar imágenes
    actualizarImagenesProductos();
    actualizarInfoProducto();
}

// Cambiar imagen de un producto (delta: -1 para anterior, 1 para siguiente)
function cambiarImagen(productIndex, delta) {
    const producto = productos[productIndex];
    if (!producto || producto.imagenes.length <= 1) return;
    
    let newIndex = imagenIndices[productIndex] + delta;
    if (newIndex < 0) newIndex = producto.imagenes.length - 1;
    if (newIndex >= producto.imagenes.length) newIndex = 0;
    
    imagenIndices[productIndex] = newIndex;
    actualizarImagenProducto(productIndex);
}

// Actualizar imagen específica de un producto en el carrusel
function actualizarImagenProducto(productIndex) {
    const producto = productos[productIndex];
    if (!producto) return;
    
    const img = document.querySelector(`.carousel-main-image[data-product-index="${productIndex}"]`);
    const indicator = document.querySelector(`.image-position-indicator[data-product-index="${productIndex}"]`);
    
    if (img) {
        const imagenSrc = encodeURI(producto.imagenes[imagenIndices[productIndex]]);
        img.src = imagenSrc;
        img.onerror = function() {
            console.error(`Error cargando imagen: ${imagenSrc}`);
            this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e1eeff"/><text x="200" y="200" text-anchor="middle" dy=".3em" font-family="Arial" font-size="20" fill="#0077ff">Imagen no disponible</text></svg>';
        };
    }
    
    if (indicator && producto.imagenes.length > 1) {
        indicator.textContent = `${imagenIndices[productIndex] + 1}/${producto.imagenes.length}`;
    }
}

// Actualizar todas las imágenes de productos
function actualizarImagenesProductos() {
    productos.forEach((_, index) => {
        actualizarImagenProducto(index);
    });
}

// Actualizar botón móvil
function actualizarBotonMovil() {
    const mobileInfo = document.getElementById('mobile-product-info');
    if (!mobileInfo) return;
    
    const producto = productos[productoActual];
    if (!producto) return;
    
    const estaEnCarrito = carrito.some(item => item.id === producto.id);
    const mobileFinalPrice = document.getElementById('mobileFinalPrice');
    const mobileAddToCartBtn = document.getElementById('mobileAddToCart');
    
    if (mobileFinalPrice) {
        mobileFinalPrice.textContent = formatoPrecio(producto.precioFinal);
    }
    
    if (mobileAddToCartBtn) {
        if (estaEnCarrito) {
            mobileAddToCartBtn.innerHTML = '<i class="fas fa-check-circle"></i> Artículo seleccionado';
            mobileAddToCartBtn.classList.add('selected');
        } else {
            mobileAddToCartBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Seleccionar artículo';
            mobileAddToCartBtn.classList.remove('selected');
        }
    }
}

// Actualizar información del producto actual
function actualizarInfoProducto() {
    const producto = productos[productoActual];
    actualizarImagenProducto(productoActual);
    productTitle.textContent = producto.nombre;
    productDescription.textContent = producto.descripcion;
    marketPrice.textContent = formatoPrecio(producto.precioMercado);
    discountPercent.textContent = producto.descuento + '%';
    finalPrice.textContent = formatoPrecio(producto.precioFinal);
    
    // Actualizar dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        if (index === productoActual) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // Actualizar estado del botón (seleccionado o no)
    const estaEnCarrito = carrito.some(item => item.id === producto.id);
    if (estaEnCarrito) {
        addToCartBtn.innerHTML = '<i class="fas fa-check-circle"></i> Artículo seleccionado';
        addToCartBtn.classList.add('selected');
    } else {
        addToCartBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Seleccionar artículo';
        addToCartBtn.classList.remove('selected');
    }
    actualizarBotonMovil();
}

// Ir a posición específica del carrusel
function irAPosicion(pos) {
    productoActual = pos;
    carousel.scrollTo({
        left: pos * carousel.offsetWidth,
        behavior: 'smooth'
    });
    actualizarInfoProducto();
}

// Navegación del carrusel
function siguienteProducto() {
    productoActual = (productoActual + 1) % productos.length;
    irAPosicion(productoActual);
}

function anteriorProducto() {
    productoActual = (productoActual - 1 + productos.length) % productos.length;
    irAPosicion(productoActual);
}

// Actualizar carrito en UI
function actualizarCarrito() {
    // Actualizar contador (cada item tiene cantidad 1)
    cartCount.textContent = carrito.length;
    
    // Actualizar lista de items
    cartItems.innerHTML = '';
    
    if (carrito.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Tu carrito está vacío</p>';
        cartTotal.textContent = formatoPrecio(0);
        return;
    }
    
    let total = 0;
    
    carrito.forEach((item, index) => {
        const producto = productos.find(p => p.id === item.id);
        const subtotal = producto.precioFinal; // cantidad siempre 1
        total += subtotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        const imagenSrc = encodeURI(producto.imagenes[0]);
        cartItem.innerHTML = `
            <img src="${imagenSrc}" alt="${producto.nombre}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\" viewBox=\"0 0 100 100\"><rect width=\"100\" height=\"100\" fill=\"#e1eeff\"/><text x=\"50\" y=\"50\" text-anchor=\"middle\" dy=\".3em\" font-family=\"Arial\" font-size=\"10\" fill=\"#0077ff\">Imagen</text></svg>'">
            <div class="cart-item-details">
                <div class="cart-item-title">${producto.nombre}</div>
                <div class="cart-item-price">${formatoPrecio(producto.precioFinal)}</div>
            </div>
            <button class="remove-item" data-index="${index}"><i class="fas fa-trash"></i></button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Agregar event listeners a los botones de quitar
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            eliminarDelCarrito(index);
        });
    });
    
    cartTotal.textContent = formatoPrecio(total);
    
    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    actualizarBotonMovil();
}

// Eliminar item del carrito
function eliminarDelCarrito(index) {
    if (carrito.length === 1) {
        mostrarNotificacion('Debes mantener al menos un artículo en el carrito');
        return;
    }
    const producto = productos.find(p => p.id === carrito[index].id);
    carrito.splice(index, 1);
    actualizarCarrito();
    actualizarInfoProducto(); // Actualizar estado del botón del producto actual
    mostrarNotificacion(`${producto.nombre} eliminado del carrito`);
}

// Agregar o quitar producto actual del carrito (toggle)
function agregarAlCarrito() {
    const producto = productos[productoActual];
    const itemIndex = carrito.findIndex(item => item.id === producto.id);
    
    if (itemIndex !== -1) {
        // Ya está en carrito, quitarlo
        if (carrito.length === 1) {
            mostrarNotificacion('Debes mantener al menos un artículo en el carrito');
            return;
        }
        carrito.splice(itemIndex, 1);
        mostrarNotificacion(`${producto.nombre} removido del carrito`);
    } else {
        // Agregar al carrito
        carrito.push({
            id: producto.id,
            cantidad: 1
        });
        mostrarNotificacion(`${producto.nombre} agregado al carrito`);
        // Abrir el carrito si está cerrado
        if (!cartSidebar.classList.contains('open')) {
            cartSidebar.classList.add('open');
            const overlay = document.querySelector('.cart-sidebar-overlay');
            if (overlay) overlay.style.display = 'block';
        }
    }
    
    actualizarCarrito();
    actualizarInfoProducto(); // Actualizar estado del botón
}

// Mostrar notificación
function mostrarNotificacion(mensaje) {
    notificationText.textContent = mensaje;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Generar PDF
function generarPDF() {
    if (carrito.length === 0) {
        mostrarNotificacion('Tu carrito está vacío');
        return false;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.text('Selección de Artículos - Papaty', 20, 20);
        
        // Fecha
        doc.setFontSize(12);
        const fecha = new Date().toLocaleDateString('es-CL');
        doc.text(`Fecha: ${fecha}`, 20, 35);
        
        // Línea separadora
        doc.line(20, 45, 190, 45);
        
        // Tabla de productos
        let yPos = 60;
        doc.setFontSize(14);
        doc.text('Artículos seleccionados:', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        let totalOrden = 0;
        
        carrito.forEach((item, index) => {
            const producto = productos.find(p => p.id === item.id);
            const subtotal = producto.precioFinal; // cantidad siempre 1
            totalOrden += subtotal;
            
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }
            
            doc.text(`${producto.nombre}`, 20, yPos);
            doc.text(`${formatoPrecio(producto.precioFinal)}`, 180, yPos, { align: 'right' });
            yPos += 10;
        });
        
        // Total
        yPos += 5;
        doc.setFontSize(12);
        doc.text('Total:', 120, yPos);
        doc.text(`${formatoPrecio(totalOrden)}`, 180, yPos, { align: 'right' });
        
        // Nota
        yPos += 20;
        doc.setFontSize(10);
        doc.text('Nota: Esta es una venta única por oportunidad.', 20, yPos);
        doc.text('Los precios incluyen descuentos de 30% a 50%.', 20, yPos + 5);
        doc.text('Contacto: ventas@papaty.cl | +56 9 1234 5678', 20, yPos + 15);
        
        // Guardar PDF
        doc.save(`seleccion_papaty_${fecha.replace(/\//g, '-')}.pdf`);
        
        return true;
    } catch (error) {
        console.error('Error generando PDF:', error);
        mostrarNotificacion('Error al generar el PDF');
        return false;
    }
}

// Configurar event listeners
function configurarEventListeners() {
    prevBtn.addEventListener('click', anteriorProducto);
    nextBtn.addEventListener('click', siguienteProducto);
    
    addToCartBtn.addEventListener('click', agregarAlCarrito);
    
    cartToggle.addEventListener('click', () => {
        cartSidebar.classList.add('open');
        const overlay = document.querySelector('.cart-sidebar-overlay');
        if (overlay) overlay.style.display = 'block';
    });
    
    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('open');
        const overlay = document.querySelector('.cart-sidebar-overlay');
        if (overlay) overlay.style.display = 'none';
    });
    
    checkoutBtn.addEventListener('click', () => {
        const exito = generarPDF();
        if (exito) {
            mostrarNotificacion('Se ha generado el PDF con tu selección.');
            carrito = [];
            actualizarCarrito();
            actualizarInfoProducto(); // Actualizar estado del botón
            cartSidebar.classList.remove('open');
        }
    });
    
    clearCartBtn.addEventListener('click', () => {
        if (carrito.length === 0) {
            mostrarNotificacion('Tu carrito ya está vacío');
            return;
        }
        if (carrito.length === 1) {
            mostrarNotificacion('El carrito ya tiene solo un artículo');
            return;
        }
        // Mantener el primer artículo en el carrito
        const primerArticulo = carrito[0];
        carrito = [primerArticulo];
        actualizarCarrito();
        actualizarInfoProducto(); // Actualizar estado del botón
        mostrarNotificacion('Carrito vaciado (se mantuvo un artículo)');
    });
    
    // Cerrar carrito al hacer clic fuera (solo en pantallas grandes)
    document.addEventListener('click', (e) => {
        if (window.innerWidth > 1100 && 
            !cartSidebar.contains(e.target) && 
            !cartToggle.contains(e.target) && 
            cartSidebar.classList.contains('open')) {
            cartSidebar.classList.remove('open');
        }
    });
    
    // Inicializar elementos móviles y manejar resize
    function inicializarElementosMoviles() {
        const esMovil = window.innerWidth <= 1100;
        console.log('Inicializando elementos móviles, esMovil:', esMovil, 'window.innerWidth:', window.innerWidth);
        
        if (esMovil) {
            // Overlay - insertar como hermano del sidebar
            let overlay = document.querySelector('.cart-sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'cart-sidebar-overlay';
                overlay.addEventListener('click', () => {
                    cartSidebar.classList.remove('open');
                });
                // Insertar después del sidebar para que el selector ~ funcione
                cartSidebar.parentNode.insertBefore(overlay, cartSidebar.nextSibling);
            }
            
            // Botón móvil - crear solo si no existe
            let mobileInfo = document.getElementById('mobile-product-info');
            const sidebarProductInfo = document.querySelector('.sidebar-product-info');
            if (!mobileInfo && sidebarProductInfo) {
                mobileInfo = document.createElement('div');
                mobileInfo.id = 'mobile-product-info';
                mobileInfo.className = 'mobile-product-info';
                mobileInfo.innerHTML = `
                    <div class="mobile-pricing">
                        <div class="mobile-price-row">
                            <span class="mobile-label">Precio final:</span>
                            <span class="mobile-final-price" id="mobileFinalPrice">$0</span>
                        </div>
                        <button class="mobile-add-to-cart-btn" id="mobileAddToCart">
                            <i class="fas fa-plus-circle"></i> Seleccionar artículo
                        </button>
                    </div>
                `;
                document.body.appendChild(mobileInfo);
                
                // Asignar evento al botón móvil
                document.getElementById('mobileAddToCart').addEventListener('click', agregarAlCarrito);
            }
            
            // Actualizar información del botón móvil
            actualizarBotonMovil();
        } else {
            // En escritorio, eliminar elementos móviles si existen
            const overlay = document.querySelector('.cart-sidebar-overlay');
            if (overlay) overlay.remove();
            
            const mobileInfo = document.getElementById('mobile-product-info');
            if (mobileInfo) mobileInfo.remove();
        }
    }
    
    // Llamar inicialización al cargar
    inicializarElementosMoviles();
    
    // Manejar cambios de tamaño de ventana
    let timeoutResize;
    window.addEventListener('resize', () => {
        clearTimeout(timeoutResize);
        timeoutResize = setTimeout(inicializarElementosMoviles, 250);
    });
}

// Inicializar la aplicación
cargarProductos();