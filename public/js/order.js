const API_URL = '/api/orders';
const FLOWER_API = '/api/flowers';
let allOrders = []; 
let currentOrderId = null; 

// --- 1. KHỞI TẠO TRANG ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadFlowersToSelect(); 
    await loadOrders(); 
});

// --- 2. TẢI DANH SÁCH HOA ---
async function loadFlowersToSelect() {
    try {
        const res = await fetch(`${FLOWER_API}/getAllFlowers`);
        const flowers = await res.json();
        const select = document.getElementById('flowerSelect');
        if (select) {
            select.innerHTML = flowers.map(f => `
                <option value="${f._id}">${f.name} - ${Number(f.price).toLocaleString()}đ</option>
            `).join('');
        }
    } catch (err) {
        console.error("Lỗi tải danh sách hoa:", err);
    }
}

// --- 3. TẠO ĐƠN HÀNG MỚI ---
async function createOrder() {
    const customerName = document.getElementById('customerName').value;
    const phone = document.getElementById('phone').value;
    const flowerId = document.getElementById('flowerSelect').value;
    const quantity = document.getElementById('orderQuantity').value;
    const status = document.getElementById('orderStatus').value;

    if (!customerName || !phone) {
        return alert("Bà nội ơi, nhập Tên với SĐT khách vô giùm cái!");
    }

    const orderData = {
        customerName,
        phone,
        flowerId,
        quantity: parseInt(quantity),
        status,
        address: "Tại cửa hàng" // Thêm cho chắc ăn nếu server đòi
    };

    try {
        const res = await fetch(`${API_URL}/addOrder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (res.ok) {
            alert("Tạo đơn hàng thành công rực rỡ!");
            document.getElementById('customerName').value = '';
            document.getElementById('phone').value = '';
            await loadOrders(); 
        } else {
            const err = await res.json();
            alert("Lỗi: " + err.message);
        }
    } catch (err) {
        console.error("Lỗi kết nối tạo đơn:", err);
    }
}

// --- 4. TẢI DANH SÁCH ĐƠN HÀNG ---
async function loadOrders() {
    try {
        const res = await fetch(`${API_URL}/getAllOrders`);
        allOrders = await res.json();
        renderOrderTable(allOrders);
    } catch (err) {
        console.error("Lỗi tải đơn hàng:", err);
    }
}

function renderOrderTable(data) {
    const tbody = document.getElementById('order-table-body');
    if (!tbody) return;

    tbody.innerHTML = data.map(order => `
        <tr>
            <td>#${order._id ? order._id.substring(18) : '...'}</td>
            <td><b>${order.customerName}</b><br><small>${order.phone}</small></td>
            <td>${order.flowerName} (x${order.quantity})</td>
            <td><b style="color: #e91e63;">${Number(order.totalPrice).toLocaleString()}đ</b></td>
            <td><span class="badge" style="background:${getStatusColor(order.status)}; color:white; padding:5px 10px; border-radius:5px;">${order.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-action-edit" onclick="openOrderModal('${order._id}', '${order.status}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn-action btn-action-delete" onclick="deleteOrder('${order._id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    const countEl = document.getElementById('orderCount');
    if (countEl) countEl.innerText = `Tổng số: ${data.length} đơn hàng`;
}

// --- 5. LOGIC SỬA ĐƠN HÀNG (MODAL) ---
function openOrderModal(id, status) {
    currentOrderId = id;
    const order = allOrders.find(o => o._id === id);
    if (!order) return;

    const nameInp = document.getElementById('edit-cust-name');
    const phoneInp = document.getElementById('edit-cust-phone');
    const flowerInp = document.getElementById('edit-flower-name');
    const statusSel = document.getElementById('edit-status');

    nameInp.value = order.customerName || '';
    phoneInp.value = order.phone || '';
    flowerInp.value = order.flowerName || '';
    statusSel.value = order.status || 'Đang xử lý';
    
    const idDisplay = document.getElementById('edit-order-id');
    if (idDisplay) idDisplay.innerText = id.substring(18);

    // KHÓA THÔNG TIN nếu đã đi giao
    if (status === 'Đang giao' || status === 'Đã giao') {
        nameInp.readOnly = true;
        phoneInp.readOnly = true;
        nameInp.style.backgroundColor = "#eee";
        phoneInp.style.backgroundColor = "#eee";
    } else {
        nameInp.readOnly = false;
        phoneInp.readOnly = false;
        nameInp.style.backgroundColor = "#fff";
        phoneInp.style.backgroundColor = "#fff";
    }

    document.getElementById('orderModal').style.display = 'block';
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

async function updateOrderFull() {
    const updateData = {
        customerName: document.getElementById('edit-cust-name').value,
        phone: document.getElementById('edit-cust-phone').value,
        status: document.getElementById('edit-status').value
    };

    try {
        const res = await fetch(`${API_URL}/updateStatus/${currentOrderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (res.ok) {
            alert("Cập nhật đơn hàng thành công!");
            closeOrderModal();
            await loadOrders();
        } else {
            const err = await res.json();
            alert("Lỗi: " + err.message);
        }
    } catch (err) {
        console.error("Lỗi cập nhật đơn:", err);
    }
}

// --- 6. XÓA ĐƠN HÀNG ---
async function deleteOrder(id) {
    if (!confirm("Xóa đơn này là mất dữ liệu luôn đó bà Hằng, chắc chưa?")) return;
    try {
        const res = await fetch(`${API_URL}/deleteOrder/${id}`, { method: 'DELETE' });
        if (res.ok) {
            await loadOrders();
        }
    } catch (err) {
        console.error("Lỗi xóa đơn:", err);
    }
}

// --- 7. BỘ LỌC TRẠNG THÁI ---
function filterOrderTable() {
    const filterValue = document.getElementById('statusFilter').value;
    if (filterValue === 'all') {
        renderOrderTable(allOrders);
    } else {
        const filtered = allOrders.filter(o => o.status === filterValue);
        renderOrderTable(filtered);
    }
}

// --- UTILS (ĐÃ FIX LỖI CHỮ S) ---
function getStatusColor(status) {
    const colors = {
        'Đang xử lý': '#f39c12',
        'Đang giao': '#3498db',
        'Đã giao': '#27ae60',
        'Đã hủy': '#e74c3c'
    };
    return colors[status] || '#7f8c8d'; // Fix từ color[status] thành colors[status]
}