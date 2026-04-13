const FLOWER_API = '/api/flowers';
const ORDER_API = '/api/orders';

const flowerGrid = document.getElementById('flower-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const flowerIdInput = document.getElementById('flower-id');
const orderForm = document.getElementById('order-form');
const orderResult = document.getElementById('order-result');

let selectedFlowerId = '';

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

function selectFlower(flowerId) {
    selectedFlowerId = flowerId;
    flowerIdInput.value = flowerId;
    orderResult.innerText = 'Da chon mau hoa. Moi ban dien thong tin dat hang.';
}

function flowerCardTemplate(flower) {
    return `
        <div class="flower-card">
            <!-- NOTE: Thay image bang link anh that khi admin cap nhat -->
            <img src="${flower.image}" alt="${flower.name}" class="flower-image">
            <h3>${flower.name}</h3>
            <p>Chu de: ${flower.category}</p>
            <p>Gia: ${Number(flower.price).toLocaleString()}d</p>
            <p>Ton: ${flower.stock}</p>
            <button class="btn btn-add" onclick="selectFlower('${flower._id}')">Chon mau nay</button>
        </div>
    `;
}

async function loadFlowers() {
    try {
        const query = buildQuery();
        const endpoint = query ? `${FLOWER_API}/getAllFlowers?${query}` : `${FLOWER_API}/getAllFlowers`;
        const res = await fetchWithAuth(endpoint);
        const flowers = await res.json();

        flowerGrid.innerHTML = '';
        if (!Array.isArray(flowers) || flowers.length === 0) {
            flowerGrid.innerHTML = '<p>Khong tim thay mau hoa phu hop.</p>';
            return;
        }

        flowers.forEach((flower) => {
            flowerGrid.innerHTML += flowerCardTemplate(flower);
        });
    } catch (error) {
        flowerGrid.innerHTML = '<p>Loi tai danh sach hoa. Vui long thu lai.</p>';
    }
}

async function submitOrder(event) {
    event.preventDefault();

    if (!selectedFlowerId) {
        orderResult.innerText = 'Ban chua chon mau hoa. Vui long bam "Chon mau nay".';
        return;
    }

    const payload = {
        flowerId: selectedFlowerId,
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        quantity: Number(document.getElementById('quantity').value),
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
            orderResult.innerText = responseData.message || 'Dat hoa that bai.';
            return;
        }

        orderResult.innerText = 'Dat hoa thanh cong! Don cua ban da gui den shop.';
        orderForm.reset();
        selectedFlowerId = '';
        flowerIdInput.value = '';
        loadFlowers();
    } catch (error) {
        orderResult.innerText = 'Co loi xay ra khi dat hoa. Vui long thu lai.';
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

window.selectFlower = selectFlower;
window.logout = logout;

(async () => {
    const user = await requireRole(['customer', 'admin']);
    if (!user) return;
    loadFlowers();
})();
