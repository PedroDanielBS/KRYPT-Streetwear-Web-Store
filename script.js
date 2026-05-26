// 3. INICIALIZAÇÃO DO APP E FIREBASE
function initApp() {
    if (window.onSnapshot && window.colRef) {
        // O onSnapshot fica ouvindo o Firebase em tempo real
        window.onSnapshot(window.colRef, (snapshot) => {
            // Limpa o array local e repopula estritamente com o que está no banco de dados
            products = [];
            snapshot.forEach(doc => {
                products.push(doc.data());
            });

            // Cria uma flag para sabermos se o sistema já rodou a primeira vez na vida
            const jaPassouPelaPrimeiraCarga = localStorage.getItem('krypt_firestore_seeded') === 'true';

            // SÓ injeta os produtos padrões se o banco estiver REALMENTE zerado E for a primeira execução histórica
            if (products.length === 0 && !jaPassouPelaPrimeiraCarga) {
                if (typeof DEFAULT_PRODUCTS !== 'undefined' && DEFAULT_PRODUCTS.length > 0) {
                    DEFAULT_PRODUCTS.forEach(p => {
                        window.setDoc(window.doc(window.db, "produtos", p.id), p);
                    });
                }
                localStorage.setItem('krypt_firestore_seeded', 'true');
            } else {
                // Se você apagou os produtos pelo painel admin, ele entra aqui e mantém a tela vazia com sucesso
                localStorage.setItem('krypt_firestore_seeded', 'true');
                
                // Renderiza a interface com os dados atualizados e protegidos da nuvem
                renderCatalog();
                renderFeaturedProduct();
                if (typeof updateAdminTable === 'function') updateAdminTable();
                if (typeof updateMetrics === 'function') updateMetrics();
            }
        });
    } else {
        // Fallback de segurança caso o Firebase falhe ou não carregue os scripts externos
        console.warn("Firebase não detectado. Usando carga de segurança local.");
        products = (typeof DEFAULT_PRODUCTS !== 'undefined') ? DEFAULT_PRODUCTS.slice() : [];
        renderCatalog();
        renderFeaturedProduct();
        if (typeof updateAdminTable === 'function') updateAdminTable();
        if (typeof updateMetrics === 'function') updateMetrics();
    }
}
       // 1. DADOS DE PRODUTOS PADRÃO (MOCKS INICIAIS)
const DEFAULT_PRODUCTS = [
    {
        id: "krypt-p1",
        name: "KRYPT Oversized Tee",
        price: 189.90,
        category: "Oversized",
        description: "Caimento estruturado com algodão premium 260GSM. Desenvolvido com modelagem boxy autoral, cor Raw Charcoal (Cinza Carbono Amaciado).",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1562157873-818bc0726f68?q=80&w=600&auto=format&fit=crop"
        ]
    },
    {
        id: "krypt-p2",
        name: "Cyber Interface Tee",
        price: 199.90,
        category: "Graphic Tees",
        description: "Design minimalista com estampa digital em verde Neon Acid de alto contraste na altura do tórax. Algodão pesado 20.1 penteado.",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop"
        ]
    },
    {
        id: "krypt-p3",
        name: "Minimal Raw Cotton",
        price: 179.90,
        category: "Minimal",
        description: "Visual limpo e orgânico. Confeccionada em algodão cru texturizado, gola grossa de 3.2cm e caimento clássico streetwear.",
        image: "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop"
        ]
    },
    {
        id: "krypt-p4",
        name: "Brutalist Heavy Tee",
        price: 209.90,
        category: "Acid Wash",
        description: "Lavagem industrial estonada de efeito único para cada peça. Costuras robustas contrastantes e visual agressivo e moderno.",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop"
        ]
    }
];

// 2. ESTADOS DA APLICAÇÃO
let products = [];
let cart = [];
let currentFilter = 'all';
let selectedProduct = null;
let selectedSize = 'M';
let isAdminAuthenticated = false;
let whatsappSellerPhone = "5577998025597";
let currentModalImageIndex = 0;
let modalImages = [];
let uploadedImageBase64 = null;

// 3. INICIALIZAÇÃO DO APP E FIREBASE
function initApp() {
    if (window.onSnapshot && window.colRef) {
        window.onSnapshot(window.colRef, (snapshot) => {
            products = [];
            snapshot.forEach(doc => products.push(doc.data()));

            // VEJA A MUDANÇA AQUI:
            // Ele só vai injetar os padrões se o banco estiver vazio E a flag 'krypt_seeded_done' nunca tiver existido
            const jáPassouPelaPrimeiraCarga = localStorage.getItem('krypt_seeded_done') === 'true';

            if (products.length === 0 && !jáPassouPelaPrimeiraCarga) {
                // Primeira execução histórica: popula o banco para não iniciar feio
                DEFAULT_PRODUCTS.forEach(p => {
                    window.setDoc(window.doc(window.db, "produtos", p.id), p);
                });
                localStorage.setItem('krypt_seeded_done', 'true');
            } else {
                // Se o banco estiver vazio porque VOCÊ deletou tudo, ele vai respeitar e renderizar a loja vazia
                // Se tiver itens salvos por você, ele vai renderizar os seus itens normalmente
                localStorage.setItem('krypt_seeded_done', 'true'); // Garante que está marcado como iniciado
                renderCatalog();
                renderFeaturedProduct();
            }
        });
    } else {
        // Fallback local se o firebase falhar por completo
        products = DEFAULT_PRODUCTS.slice();
        renderCatalog();
        renderFeaturedProduct();
    }
}

function updateHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add('bg-brandDark/95', 'py-4', 'shadow-lg');
        header.classList.remove('bg-brandDark/85', 'py-6');
    } else {
        header.classList.add('bg-brandDark/85', 'py-6');
        header.classList.remove('bg-brandDark/95', 'py-4', 'shadow-lg');
    }
}

function initCart() {
    try {
        const savedCart = localStorage.getItem('krypt_cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        cart = [];
    }

    updateCartUI();
}

function saveCart() {
    localStorage.setItem('krypt_cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (!badge) return;
    badge.innerText = totalItems;
    badge.classList.toggle('scale-0', totalItems === 0);
    badge.classList.toggle('scale-100', totalItems > 0);
}

function updateCartTotals() {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-grandtotal');

    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + ((product?.price || 0) * item.quantity);
    }, 0);

    if (subtotalEl) subtotalEl.innerText = formatPrice(subtotal);
    if (totalEl) totalEl.innerText = formatPrice(subtotal);
}

function updateCartUI() {
    renderCart();
    updateCartBadge();
    updateCartTotals();
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;

    container.innerHTML = '';
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-400 py-24">
                <p class="font-medium">Seu carrinho está vazio</p>
                <p class="text-sm mt-2">Adicione produtos para visualizar aqui.</p>
            </div>
        `;
        return;
    }

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const card = document.createElement('div');
        card.className = 'bg-brandDark/80 border border-white/10 rounded-xl p-4 flex items-center gap-4';
        card.innerHTML = `
            <div class="flex-1">
                <p class="text-sm text-gray-400 uppercase tracking-[0.18em] mb-1">${product?.category || 'PRODUTO'}</p>
                <h4 class="text-sm font-bold text-white">${product?.name || 'Item do carrinho'}</h4>
                <p class="text-xs text-gray-500 mt-2">Tamanho: ${item.size} • Quantidade: ${item.quantity}</p>
                <p class="text-sm font-bold text-brandAcid mt-3">${formatPrice(product?.price || 0)}</p>
            </div>
            <button onclick="removeCartItem('${item.id}', '${item.size}')" class="text-gray-400 hover:text-red-400 transition-colors">
                <i data-lucide="trash-2" class="w-5 h-5"></i>
            </button>
        `;

        container.appendChild(card);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function removeCartItem(productId, size) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    saveCart();
    updateCartUI();
    updateMetrics();
    showToast('Item removido do carrinho.', 'success');
}

function openProductModal(productId) {
    selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) return;

    modalImages = selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.image];
    currentModalImageIndex = 0;
    selectedSize = 'M';

    document.getElementById('modal-product-title').innerText = selectedProduct.name || 'Produto';
    document.getElementById('modal-product-price').innerText = formatPrice(selectedProduct.price || 0);
    document.getElementById('modal-product-description').innerText = selectedProduct.description || 'Descrição indisponível.';
    document.getElementById('modal-product-category').innerText = (selectedProduct.category || 'Produto').toUpperCase();

    renderModalThumbnails();
    updateModalImage();

    const modal = document.getElementById('product-modal');
    if (!modal) return;
    modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100');
    modal.querySelector('.transform')?.classList.replace('scale-95', 'scale-100');
    document.body.classList.add('no-scroll');
    selectSize(selectedSize);
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (!modal) return;
    modal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100');
    modal.querySelector('.transform')?.classList.replace('scale-100', 'scale-95');
    document.body.classList.remove('no-scroll');
}

function updateModalImage() {
    const img = document.getElementById('modal-product-img');
    if (!img || modalImages.length === 0) return;
    img.src = modalImages[currentModalImageIndex];
    img.alt = selectedProduct?.name || 'Imagem do produto';

    const thumbnails = document.querySelectorAll('#modal-thumbnails button');
    thumbnails.forEach((btn, index) => {
        if (index === currentModalImageIndex) {
            btn.classList.add('ring-2', 'ring-brandAcid');
        } else {
            btn.classList.remove('ring-2', 'ring-brandAcid');
        }
    });
}

function renderModalThumbnails() {
    const thumbnails = document.getElementById('modal-thumbnails');
    if (!thumbnails) return;
    thumbnails.innerHTML = '';

    modalImages.forEach((image, index) => {
        const button = document.createElement('button');
        button.className = 'w-16 h-16 rounded-xl overflow-hidden border border-white/10 transition-all duration-200';
        button.innerHTML = `<img src="${image}" alt="Miniatura ${index + 1}" class="w-full h-full object-cover">`;
        button.onclick = (event) => {
            event.stopPropagation();
            currentModalImageIndex = index;
            updateModalImage();
        };
        thumbnails.appendChild(button);
    });
}

function prevModalImage(event) {
    event.stopPropagation();
    if (modalImages.length <= 1) return;
    currentModalImageIndex = (currentModalImageIndex - 1 + modalImages.length) % modalImages.length;
    updateModalImage();
}

function nextModalImage(event) {
    event.stopPropagation();
    if (modalImages.length <= 1) return;
    currentModalImageIndex = (currentModalImageIndex + 1) % modalImages.length;
    updateModalImage();
}

function selectSize(size) {
    selectedSize = size;
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(button => {
        button.classList.toggle('bg-brandAcid', button.textContent.trim() === size);
        button.classList.toggle('text-black', button.textContent.trim() === size);
        button.classList.toggle('bg-brandDark', button.textContent.trim() !== size);
        button.classList.toggle('text-white', button.textContent.trim() !== size);
    });
}

function addToCart(productId, size) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast('Produto não encontrado.', 'error');
        return;
    }

    const existing = cart.find(item => item.id === productId && item.size === size);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: productId, size, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showToast('Produto adicionado ao carrinho!', 'success');
}

function addCurrentToCart() {
    if (!selectedProduct) {
        showToast('Selecione um produto primeiro.', 'error');
        return;
    }
    addToCart(selectedProduct.id, selectedSize);
}

function toggleCart() {
    const panel = document.getElementById('cart-panel');
    const overlay = document.getElementById('cart-overlay');
    if (!panel) return;

    const willOpen = panel.classList.contains('translate-x-full');
    panel.classList.toggle('translate-x-full');
    panel.classList.toggle('translate-x-0');

    if (overlay) {
        overlay.classList.toggle('hidden', !willOpen);
    }

    document.body.classList.toggle('no-scroll', willOpen);
    updateCartUI();
}

function toggleAdminModal() {
    const overlay = document.getElementById('admin-modal');
    const authCard = document.getElementById('admin-auth-card');
    const dashboard = document.getElementById('admin-dashboard-card');
    if (!overlay || !authCard) return;

    const opening = overlay.classList.contains('hidden');
    overlay.classList.toggle('hidden');
    overlay.classList.toggle('pointer-events-none', !opening);
    overlay.classList.toggle('opacity-100', opening);
    overlay.classList.toggle('opacity-0', !opening);
    document.body.classList.toggle('no-scroll', opening);

    if (isAdminAuthenticated && dashboard) {
        if (opening) {
            authCard.classList.add('hidden', 'opacity-0', 'pointer-events-none');
            dashboard.classList.remove('hidden');
            dashboard.classList.remove('opacity-0');
            dashboard.classList.remove('pointer-events-none');
            dashboard.querySelector('.transform')?.classList.replace('scale-95', 'scale-100');
        } else {
            dashboard.classList.add('hidden', 'opacity-0', 'pointer-events-none');
        }
        return;
    }

    if (opening) {
        authCard.classList.remove('hidden');
        authCard.classList.remove('opacity-0');
        authCard.classList.remove('pointer-events-none');
        authCard.querySelector('.transform')?.classList.replace('scale-95', 'scale-100');
        if (dashboard) {
            dashboard.classList.add('hidden', 'opacity-0', 'pointer-events-none');
            dashboard.querySelector('.transform')?.classList.replace('scale-100', 'scale-95');
        }
    } else {
        authCard.classList.add('hidden', 'opacity-0', 'pointer-events-none');
        authCard.querySelector('.transform')?.classList.replace('scale-100', 'scale-95');
    }
}

function checkoutCart() {
    if (cart.length === 0) {
        showToast('O carrinho está vazio.', 'error');
        return;
    }

    if (!whatsappSellerPhone) {
        showToast('Telefone do vendedor indisponível.', 'error');
        return;
    }

    const orderLines = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        return `${item.quantity}x ${product?.name || 'Item'} (${item.size}) - ${formatPrice(product?.price || 0)}`;
    }).join('\n');

    const total = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + ((product?.price || 0) * item.quantity);
    }, 0);

    const text = encodeURIComponent(`Olá, gostaria de comprar:\n${orderLines}\n\nTotal: ${formatPrice(total)}`);
    window.open(`https://wa.me/${whatsappSellerPhone}?text=${text}`, '_blank');
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
    updateMetrics();
    showToast('Carrinho limpo com sucesso.', 'success');
}

function handleAdminLogin(event) {
    event.preventDefault();
    const password = document.getElementById('admin-password')?.value.trim();
    if (!password || password.length < 4) {
        showToast('Senha inválida.', 'error');
        return;
    }

    isAdminAuthenticated = true;
    const overlay = document.getElementById('admin-modal');
    const authCard = document.getElementById('admin-auth-card');
    const dashboard = document.getElementById('admin-dashboard-card');
    if (authCard) {
        authCard.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    }
    if (dashboard) {
        dashboard.classList.remove('hidden');
        dashboard.classList.remove('opacity-0');
        dashboard.classList.remove('pointer-events-none');
        dashboard.querySelector('.transform')?.classList.replace('scale-95', 'scale-100');
    }
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.remove('opacity-0');
        overlay.classList.remove('pointer-events-none');
        overlay.classList.add('opacity-100');
    }

    document.body.classList.add('no-scroll');
    updateAdminTable();
    updateMetrics();
    showToast('Acesso liberado ao painel.', 'success');
}

function logoutAdmin() {
    isAdminAuthenticated = false;
    const overlay = document.getElementById('admin-modal');
    const authCard = document.getElementById('admin-auth-card');
    const dashboard = document.getElementById('admin-dashboard-card');
    if (dashboard) {
        dashboard.classList.add('hidden', 'opacity-0', 'pointer-events-none');
        dashboard.querySelector('.transform')?.classList.replace('scale-100', 'scale-95');
    }
    if (authCard) {
        authCard.classList.remove('hidden');
        authCard.classList.remove('opacity-0');
        authCard.classList.remove('pointer-events-none');
        authCard.querySelector('.transform')?.classList.replace('scale-95', 'scale-100');
    }
    if (overlay) {
        overlay.classList.add('pointer-events-none');
        overlay.classList.add('opacity-0');
        overlay.classList.remove('opacity-100');
        overlay.classList.add('hidden');
    }
    document.body.classList.remove('no-scroll');
}

function initConfigs() {
    const phone = localStorage.getItem('krypt_whatsapp_phone');
    if (phone) whatsappSellerPhone = phone;
    const phoneInput = document.getElementById('admin-whatsapp-input');
    if (phoneInput) phoneInput.value = whatsappSellerPhone;
}

function saveStoreConfig() {
    const inputVal = document.getElementById('admin-whatsapp-input').value.trim();
    const cleaned = inputVal.replace(/\D/g, '');
    if (cleaned.length < 10) {
        showToast('Insira um número de WhatsApp válido.', 'error');
        return;
    }
    whatsappSellerPhone = cleaned;
    localStorage.setItem('krypt_whatsapp_phone', whatsappSellerPhone);
    showToast('Configuração atualizada!', 'success');
}

// Sincronização com Firebase
async function saveProductsToStorage() {
    // 1. Salva no localStorage como fallback rápido
    localStorage.setItem('krypt_products', JSON.stringify(products));

    // 2. Sincroniza com o Firebase Firestore de forma segura
    if (window.setDoc && window.doc && window.db) {
        try {
            // Em vez de ler o banco e deletar o que "acha" que sumiu,
            // nós apenas atualizamos ou criamos os produtos que estão na lista ativa.
            const promises = products.map(product => {
                return window.setDoc(
                    window.doc(window.db, "produtos", product.id.toString()), 
                    product
                );
            });
            
            // Aguarda todas as gravações terminarem
            await Promise.all(promises);
        } catch (error) {
            console.error("Erro ao salvar no Firestore: ", error);
        }
    }
}

// 4. RENDERIZAÇÃO
function renderCatalog() {
    const grid = document.getElementById('product-grid');
    const noProducts = document.getElementById('no-products');
    if (!grid) return;

    const filtered = currentFilter === 'all' ? products : products.filter(p => p.category === currentFilter);
    grid.innerHTML = '';

    if (filtered.length === 0) {
        noProducts?.classList.remove('hidden');
        grid.classList.add('hidden');
    } else {
        noProducts?.classList.add('hidden');
        grid.classList.remove('hidden');
        filtered.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = `group bg-brandCard/40 border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between hover:border-brandAcid/30 transition-all duration-300 relative transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] animate-fade-in`;
            card.style.animationDelay = `${index * 100}ms`;
            card.innerHTML = `
                <div class="relative overflow-hidden aspect-square w-full bg-[#121214] flex items-center justify-center p-4">
                    <span class="absolute top-4 left-4 z-10 bg-brandDark/80 backdrop-blur border border-white/10 text-brandAcid text-[10px] font-bold tracking-widest px-2.5 py-1 rounded uppercase">${product.category}</span>
                    <img src="${product.image}" alt="${product.name}" class="max-h-[220px] object-contain group-hover:scale-105 transition-transform duration-500 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.4)]">
                    <div class="absolute inset-0 bg-brandDark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button onclick="openProductModal('${product.id}')" class="px-5 py-2.5 bg-white text-black font-semibold tracking-wider text-xs uppercase hover:bg-brandAcid transition-colors rounded">Visualizar</button>
                    </div>
                </div>
                <div class="p-6 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="font-syne text-sm font-bold text-white uppercase tracking-wider group-hover:text-brandAcid transition-colors mb-1 truncate">${product.name}</h3>
                        <p class="text-xs text-gray-500 font-light line-clamp-2 mb-4">${product.description}</p>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t border-white/5">
                        <span class="font-bold text-white font-mono">${formatPrice(product.price)}</span>
                        <button onclick="addToCart('${product.id}', 'M')" class="p-2 border border-white/10 hover:border-brandAcid hover:bg-brandAcid hover:text-black rounded transition-all duration-300">
                            <i data-lucide="plus" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
        lucide.createIcons();
    }
}

function formatPrice(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `border px-5 py-4 rounded shadow-2xl flex items-center gap-3 animate-slide-up pointer-events-auto min-w-[300px] text-sm text-white ${type === 'success' ? 'bg-[#141416] border-brandAcid/30' : 'bg-[#1D1014] border-red-500/20'}`;
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="${type === 'success' ? 'text-brandAcid' : 'text-red-500'} w-5 h-5 shrink-0"></i><div class="flex-1 font-medium">${message}</div>`;
    container.appendChild(toast);
    lucide.createIcons();
    setTimeout(() => toast.remove(), 4000);
}

function renderCategoryFilters() {
    const categories = ['all', 'Oversized', 'Graphic Tees', 'Acid Wash', 'Minimal'];
    const container = document.getElementById('category-filters');
    if (!container) return;
    container.innerHTML = '';
    categories.forEach(cat => {
        const button = document.createElement('button');
        button.className = `px-5 py-2 text-xs font-semibold tracking-widest uppercase transition-all duration-300 rounded border ${currentFilter === cat ? 'bg-brandAcid text-black' : 'bg-transparent text-gray-400 border-white/10'}`;
        button.innerText = cat === 'all' ? 'TODOS' : cat.toUpperCase();
        button.onclick = () => { currentFilter = cat; renderCategoryFilters(); renderCatalog(); };
        container.appendChild(button);
    });
}

function renderFeaturedProduct() {
    const featured = products.find(p => p.id === 'krypt-p1') || products[0];
    if (!featured) return;
    const titleEl = document.getElementById('featured-product-title');
    const descEl = document.getElementById('featured-product-desc');
    const bannerImgEl = document.getElementById('featured-product-banner-img');
    if (titleEl) titleEl.innerText = featured.name;
    if (descEl) descEl.innerText = featured.description;
    if (bannerImgEl) {
        bannerImgEl.style.backgroundImage = `url('${featured.image}')`;
    }
}

       // 11. SISTEMA CRUD DE PRODUTOS PELO ADMIN
function updateAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const totalBadge = document.getElementById('admin-total-badge');
    if (totalBadge) totalBadge.innerText = `${products.length} itens`;

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-white/5 transition-colors border-b border-white/5';
        tr.innerHTML = `
            <td class="py-4 px-4 flex items-center gap-3">
                <img src="${p.image}" alt="${p.name}" class="w-10 h-10 object-contain bg-brandDark rounded p-1 border border-white/5 shrink-0">
                <div class="truncate max-w-[180px]">
                    <span class="font-bold text-white block truncate uppercase">${p.name}</span>
                    <span class="text-[10px] text-gray-500 font-mono block">${p.id}</span>
                </div>
            </td>
            <td class="py-4 px-4 font-mono font-bold text-white">${formatPrice(p.price)}</td>
            <td class="py-4 px-4">
                <span class="text-[10px] font-bold text-brandAcid bg-brandAcid/10 px-2 py-1 rounded border border-brandAcid/10 uppercase tracking-widest">${p.category}</span>
            </td>
            <td class="py-4 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button onclick="enterEditMode('${p.id}')" class="p-2 border border-white/10 hover:border-brandAcid hover:text-brandAcid rounded transition-all" title="Editar"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
                    <button onclick="deleteProduct('${p.id}')" class="p-2 border border-white/10 hover:border-red-500 hover:text-red-400 rounded transition-all" title="Excluir"><i data-lucide="trash" class="w-3.5 h-3.5"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateMetrics() {
    const totalItemsEl = document.getElementById('metric-total-items');
    const cartItemsEl = document.getElementById('metric-cart-items');
    const revenueEl = document.getElementById('metric-revenue');

    if(totalItemsEl) totalItemsEl.innerText = products.length;
    
    const detailedCart = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        return {
            ...item,
            price: product ? product.price : 0
        };
    });

    const totalQty = detailedCart.reduce((acc, item) => acc + item.quantity, 0);
    if(cartItemsEl) cartItemsEl.innerText = totalQty;

    const totalRevenue = detailedCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if(revenueEl) revenueEl.innerText = formatPrice(totalRevenue);
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageBase64 = e.target.result;
        const imgUrlInput = document.getElementById('form-img-url');
        if (imgUrlInput) {
            imgUrlInput.value = ''; 
            imgUrlInput.disabled = true;
        }
        
        const preview = document.getElementById('image-preview-container');
        if (preview) {
            preview.classList.remove('hidden');
            preview.classList.add('flex');
            document.getElementById('preview-image-name').innerText = file.name;
        }
    };
    reader.readAsDataURL(file);
}

function clearUploadedImage() {
    uploadedImageBase64 = null;
    const fileInput = document.getElementById('form-file-input');
    const imgUrlInput = document.getElementById('form-img-url');
    if (fileInput) fileInput.value = '';
    if (imgUrlInput) imgUrlInput.disabled = false;
    
    const preview = document.getElementById('image-preview-container');
    if (preview) {
        preview.classList.add('hidden');
        preview.classList.remove('flex');
    }
}

function handleProductSubmit(event) {
    event.preventDefault();

    const editId = document.getElementById('edit-product-id').value;
    const name = document.getElementById('form-name').value;
    const price = parseFloat(document.getElementById('form-price').value);
    const category = document.getElementById('form-category').value;
    const desc = document.getElementById('form-desc').value;
    
    let imageUrl = document.getElementById('form-img-url').value;
    if (uploadedImageBase64) {
        imageUrl = uploadedImageBase64;
    } else if (!imageUrl) {
        imageUrl = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop';
    }

    const additionalImgsVal = document.getElementById('form-additional-imgs').value;
    const additionalImages = additionalImgsVal 
        ? additionalImgsVal.split(',').map(url => url.trim()).filter(url => url.length > 0)
        : [];

    const allImages = [imageUrl, ...additionalImages];

    if (editId) {
        const index = products.findIndex(p => p.id === editId);
        if (index > -1) {
            products[index] = {
                ...products[index],
                name,
                price,
                category,
                description: desc,
                image: imageUrl,
                images: allImages
            };
            showToast('Produto atualizado com sucesso!', 'success');
        }
    } else {
        const newProduct = {
            id: 'krypt-' + Date.now(),
            name,
            price,
            category,
            description: desc,
            image: imageUrl,
            images: allImages
        };
        products.push(newProduct);
        showToast('Novo produto cadastrado!', 'success');
    }

    saveProductsToStorage();
    updateAdminTable();
    updateMetrics();
    cancelEditMode();
}

function enterEditMode(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('form-action-title').innerText = 'Editar Produto';
    document.getElementById('submit-btn-text').innerText = 'ATUALIZAR INFORMAÇÕES';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');

    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('form-name').value = product.name;
    document.getElementById('form-price').value = product.price;
    document.getElementById('form-category').value = product.category;
    document.getElementById('form-desc').value = product.description;
    
    const additionalImages = product.images ? product.images.slice(1) : [];
    document.getElementById('form-additional-imgs').value = additionalImages.join(', ');
    
    if (product.image && product.image.startsWith('data:image')) {
        uploadedImageBase64 = product.image;
        document.getElementById('form-img-url').value = '';
        document.getElementById('form-img-url').disabled = true;
        const preview = document.getElementById('image-preview-container');
        preview.classList.remove('hidden');
        preview.classList.add('flex');
        document.getElementById('preview-image-name').innerText = 'Imagem Base64 Salva';
    } else {
        clearUploadedImage();
        document.getElementById('form-img-url').value = product.image || '';
    }
}

function cancelEditMode() {
    document.getElementById('form-action-title').innerText = 'Adicionar Novo Item';
    document.getElementById('submit-btn-text').innerText = 'CADASTRAR PRODUTO';
    document.getElementById('cancel-edit-btn').classList.add('hidden');

    document.getElementById('edit-product-id').value = '';
    document.getElementById('form-additional-imgs').value = '';
    document.getElementById('product-form').reset();
    clearUploadedImage();
}

let productToDeleteId = null;

function deleteProduct(productId) {
    productToDeleteId = productId;
    const modal = document.getElementById('confirm-modal');
    const inner = modal.querySelector('div');
    
    modal.classList.remove('opacity-0', 'pointer-events-none');
    inner.classList.remove('scale-95');
    document.body.classList.add('no-scroll');
    
    document.getElementById('confirm-delete-btn').onclick = async () => {
        if (productToDeleteId) {
            products = products.filter(p => p.id !== productToDeleteId);
            if (window.deleteDoc && window.doc && window.db) {
                await window.deleteDoc(window.doc(window.db, "produtos", productToDeleteId.toString()));
            }
            await saveProductsToStorage();
            updateAdminTable();
            renderCatalog();
            renderFeaturedProduct();
            updateMetrics();
            showToast('Produto removido com sucesso.', 'success');
        }
        closeConfirmModal();
    };
}

function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    const inner = modal.querySelector('div');
    modal.classList.add('opacity-0', 'pointer-events-none');
    inner.classList.add('scale-95');
    document.body.classList.remove('no-scroll');
    productToDeleteId = null;
}

