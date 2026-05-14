document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Logic
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }

    let cart = JSON.parse(localStorage.getItem('artist_cart')) || [];

    function saveCart() {
        localStorage.setItem('artist_cart', JSON.stringify(cart));
        updateCartUI();
    }

    function updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        cartCount.textContent = cart.length;

        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total-price');
        
        if (cartItems) {
            cartItems.innerHTML = '';
            let total = 0;
            cart.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.title}</td>
                    <td>${item.size}</td>
                    <td>$${item.price}</td>
                    <td><button class="remove-item" data-index="${index}">Remove</button></td>
                `;
                cartItems.appendChild(tr);
                total += item.price;
            });
            cartTotal.textContent = `$${total.toFixed(2)}`;

            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.target.dataset.index;
                    cart.splice(idx, 1);
                    saveCart();
                });
            });
        }
    }

    function renderGallery() {
        const currentPage = PAGE_CONTEXT.currentPage;
        
        if (currentPage === "Detail") {
            handleDetailPage();
            return;
        }

        const hidePrices = PAGE_CONTEXT.hidePrices;
        const hideLabels = currentPage.toLowerCase() === 'prints';

        galleryData.gallery.forEach(item => {
            if (item.category.toLowerCase() !== currentPage.toLowerCase()) return;

            const gridId = `${item.category.toLowerCase()}-grid`;
            const grid = document.getElementById(gridId);
            if (grid) {
                const card = document.createElement('div');
                card.className = 'card';
                
                let html = `
                    <a href="item_${item.id}.html">
                        <img src="${item.image}" alt="${item.title}">
                    </a>
                `;

                if (!hideLabels) {
                    html += `<h3>${item.title}</h3>`;
                }

                if (!hidePrices && !hideLabels) {
                    let selectedOption = item.options[0];
                    html += `
                        <div class="price-options">
                            ${item.options.map((opt, i) => `
                                <button class="price-btn ${i === 0 ? 'active' : ''}" data-size="${opt.size}" data-price="${opt.price}">
                                    ${opt.size} ($${opt.price})
                                </button>
                            `).join('')}
                        </div>
                        <button class="add-to-cart">Add to Cart</button>
                    `;
                }

                card.innerHTML = html;

                if (!hidePrices && !hideLabels) {
                    const priceBtns = card.querySelectorAll('.price-btn');
                    priceBtns.forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            priceBtns.forEach(b => b.classList.remove('active'));
                            btn.classList.add('active');
                            selectedOption = {
                                size: btn.dataset.size,
                                price: parseInt(btn.dataset.price)
                            };
                        });
                    });

                    card.querySelector('.add-to-cart').addEventListener('click', (e) => {
                        e.preventDefault();
                        cart.push({
                            id: item.id,
                            title: item.title,
                            size: selectedOption.size,
                            price: selectedOption.price
                        });
                        saveCart();
                        alert(`${item.title} (${selectedOption.size}) added to cart.`);
                    });
                }

                grid.appendChild(card);
            }
        });
    }

    function handleDetailPage() {
        const item = galleryData.gallery.find(i => i.id === PAGE_CONTEXT.itemId);
        if (!item) return;

        const addBtn = document.getElementById('add-to-cart-btn');
        if (addBtn) {
            let selectedOption = item.options[0];
            const priceBtns = document.querySelectorAll('.price-btn-large');
            
            // Set first as active
            if (priceBtns.length > 0) priceBtns[0].classList.add('active');

            priceBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    priceBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedOption = {
                        size: btn.dataset.size,
                        price: parseInt(btn.dataset.price)
                    };
                });
            });

            addBtn.addEventListener('click', () => {
                cart.push({
                    id: item.id,
                    title: item.title,
                    size: selectedOption.size,
                    price: selectedOption.price
                });
                saveCart();
                alert(`${item.title} (${selectedOption.size}) added to cart.`);
            });
        }
    }

    const sendOrderBtn = document.getElementById('send-order');
    if (sendOrderBtn) {
        sendOrderBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            let orderDetails = "Order Request - Nosamudianaede Ahekobuwa Gallery\n\nItems:\n";
            let total = 0;
            cart.forEach(item => {
                orderDetails += `- ${item.title} (${item.size}): $${item.price}\n`;
                total += item.price;
            });
            orderDetails += `\nTotal: $${total.toFixed(2)}`;

            const subject = encodeURIComponent("Order Request - Nosamudianaede Ahekobuwa Gallery");
            const body = encodeURIComponent(orderDetails);
            const mailtoLink = `mailto:nosamudianaedeahekobuwa@gmail.com?subject=${subject}&body=${body}`;

            window.location.href = mailtoLink;
        });
    }

    renderGallery();
    updateCartUI();
});
