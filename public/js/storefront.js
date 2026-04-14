const FLOWER_API = '/api/flowers';
const ORDER_API = '/api/orders';
const CART_KEY = 'flower_shop_cart';

const flowerGrid = document.getElementById('flower-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const orderForm = document.getElementById('order-form');
const orderResult = document.getElementById('order-result');
const cartTable = document.getElementById('cart-table');
const cartTableBody = document.getElementById('cart-table-body');
const cartEmpty = document.getElementById('cart-empty');
const cartTotal = document.getElementById('cart-total');

let cart = [];
let currentFlowers = [];

function toggleAdminLinks(user) {
    const adminLinks = document.querySelectorAll('.admin-only');
    const isAdmin = user?.role === 'admin';
    adminLinks.forEach((link) => {
        link.style.display = isAdmin ? 'inline-block' : 'none';
    });
}

function buildQuery() {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) {
        params.set('search', searchInput.value.trim());
    }
    if (categoryFilter.value) {
        params.set('category', categoryFilter.value);
    }
    return params.toString();
}

function readCart() {
    try {
        cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        if (!Array.isArray(cart)) cart = [];
    } catch (_error) {
        cart = [];
    }
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCartById(flowerId, checkoutNow = false) {
    const flower = currentFlowers.find((item) => item._id === flowerId);
    if (!flower) return;

    const qtyInput = document.getElementById(`qty-${flowerId}`);
    const qtyToAdd = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

    if (qtyToAdd < 1) {
        alert('Số lượng không hợp lệ!');
        return;
    }

    const existing = cart.find((item) => item.flowerId === flower._id);
    const currentQty = existing ? existing.quantity : 0;
    
    if (currentQty + qtyToAdd > flower.stock) {
        alert('Số lượng vượt quá tồn kho (Còn lại: ' + (flower.stock - currentQty) + ')');
        return;
    }
    
    if (existing) {
        existing.quantity += qtyToAdd;
    } else {
        cart.push({
            flowerId: flower._id,
            name: flower.name,
            price: Number(flower.price),
            image: flower.image,
            quantity: qtyToAdd
        });
    }

    saveCart();
    renderCart();
    
    if (checkoutNow) {
        toggleCartView(true);
    } else {
        alert(`Đã thêm ${qtyToAdd} sản phẩm vào giỏ hàng!`);
    }
}

function removeFromCart(flowerId) {
    cart = cart.filter((item) => item.flowerId !== flowerId);
    saveCart();
    renderCart();
}

function changeQuantity(flowerId, delta) {
    const item = cart.find((entry) => entry.flowerId === flowerId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(flowerId);
        return;
    }
    saveCart();
    renderCart();
}

function renderCart() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        countEl.innerText = totalItems;
    }

    cartTableBody.innerHTML = '';

    if (cart.length === 0) {
        cartTable.style.display = 'none';
        cartEmpty.style.display = 'block';
        cartTotal.innerText = '';
        return;
    }

    cartTable.style.display = 'table';
    cartEmpty.style.display = 'none';

    let total = 0;
    cart.forEach((item) => {
        const subTotal = item.price * item.quantity;
        total += subTotal;
        cartTableBody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.price.toLocaleString('vi-VN')}đ</td>
                <td>
                    <button class="btn btn-edit" onclick="changeQuantity('${item.flowerId}', -1)">-</button>
                    <span style="margin: 0 8px;">${item.quantity}</span>
                    <button class="btn btn-edit" onclick="changeQuantity('${item.flowerId}', 1)">+</button>
                </td>
                <td>${subTotal.toLocaleString('vi-VN')}đ</td>
                <td><button class="btn btn-delete" onclick="removeFromCart('${item.flowerId}')">Xóa</button></td>
            </tr>
        `;
    });

    cartTotal.innerText = `Tổng cộng: ${total.toLocaleString('vi-VN')}đ`;
}

function toggleCartView(toCart = false) {
    const storefront = document.getElementById('storefront-view');
    const checkout = document.getElementById('checkout-view');
    if (toCart) {
        storefront.style.display = 'none';
        checkout.style.display = 'block';
        renderCart(); 
        window.scrollTo(0, 0);
    } else {
        storefront.style.display = 'block';
        checkout.style.display = 'none';
        window.scrollTo(0, 0);
    }
}

function flowerCardTemplate(flower) {
    return `
        <div class="flower-card">
            <img src="${flower.image}" alt="${flower.name}" class="flower-image">
            <h3>${flower.name}</h3>
            <p>Chủ đề: ${flower.category}</p>
            <p>Giá: ${Number(flower.price).toLocaleString('vi-VN')}đ</p>
            <p>Tồn kho: ${flower.stock}</p>
            <div style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                <label style="font-size: 14px; font-weight: bold;">Số lượng:</label>
                <input type="number" id="qty-${flower._id}" value="1" min="1" max="${flower.stock}" style="width: 70px; padding: 6px; margin: 0; box-sizing: border-box;">
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-add" style="flex: 1; padding: 10px 5px; font-size: 13px; margin: 0; white-space: nowrap;" onclick="addToCartById('${flower._id}', false)">Thêm vào giỏ</button>
                <button class="btn btn-edit" style="flex: 1; background-color: #ff9800; padding: 10px 5px; font-size: 13px; margin: 0; white-space: nowrap;" onclick="addToCartById('${flower._id}', true)">Mua Ngay</button>
            </div>
        </div>
    `;
}

async function loadFlowers() {
    try {
        const query = buildQuery();
        const endpoint = query ? `${FLOWER_API}/getAllFlowers?${query}` : `${FLOWER_API}/getAllFlowers`;
        const res = await fetchWithAuth(endpoint);
        const flowers = await res.json();
        currentFlowers = Array.isArray(flowers) ? flowers : [];

        flowerGrid.innerHTML = '';
        if (!Array.isArray(flowers) || flowers.length === 0) {
            flowerGrid.innerHTML = '<p>Không tìm thấy mẫu hoa phù hợp.</p>';
            return;
        }

        flowers.forEach((flower) => {
            flowerGrid.innerHTML += flowerCardTemplate(flower);
        });
    } catch (error) {
        flowerGrid.innerHTML = '<p>Lỗi tải danh sách hoa. Vui lòng thử lại.</p>';
    }
}

async function submitOrder(event) {
    event.preventDefault();

    if (cart.length === 0) {
        orderResult.innerText = 'Giỏ hàng đang trống, vui lòng thêm sản phẩm trước khi đặt.';
        return;
    }

    const payload = {
        items: cart.map((item) => ({
            flowerId: item.flowerId,
            quantity: item.quantity
        })),
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        deliveryTime: document.getElementById('deliveryTime').value || null,
        cardMessage: document.getElementById('cardMessage').value.trim()
    };

    try {
        const res = await fetchWithAuth(`${ORDER_API}/addOrder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const responseData = await res.json();

        if (!res.ok) {
            orderResult.innerText = responseData.message || 'Đặt hoa thất bại.';
            return;
        }

        orderResult.innerText = 'Đặt hoa thành công! Đơn của bạn đã gửi đến shop.';
        orderForm.reset();
        cart = [];
        saveCart();
        renderCart();
        loadFlowers();
    } catch (error) {
        orderResult.innerText = 'Có lỗi xảy ra khi đặt hoa. Vui lòng thử lại.';
    }
}

function logout() {
    clearAuth();
    window.location.href = 'login.html';
}

document.getElementById('search-btn').addEventListener('click', loadFlowers);
document.getElementById('filter-btn').addEventListener('click', loadFlowers);
document.getElementById('reset-btn').addEventListener('click', () => {
    searchInput.value = '';
    categoryFilter.value = '';
    loadFlowers();
});
orderForm.addEventListener('submit', submitOrder);

window.logout = logout;

(async () => {
    const user = await requireRole(['customer', 'admin']);
    if (!user) return;
    toggleAdminLinks(user);
    readCart();
    renderCart();
    loadFlowers();
})();

window.addToCart = addToCart;
window.addToCartById = addToCartById;
window.removeFromCart = removeFromCart;
window.changeQuantity = changeQuantity;
window.toggleCartView = toggleCartView;
