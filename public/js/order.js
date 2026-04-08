const API_URL = '/api/orders';

async function fetchOrders() {
    const res = await fetch(`${API_URL}/getAllOrders`);
    const data = await res.json();
    const tbody = document.getElementById('order-table-body');
    tbody.innerHTML = '';
    data.forEach(order => {
        tbody.innerHTML += `
            <tr>
                <td>${order._id.substring(0, 8)}...</td>
                <td>${order.deliveryAddress || 'Tại cửa hàng'}</td>
                <td><b style="color: #d81b60">${order.status}</b></td>
                <td>
                    <button class="btn btn-edit" onclick="updateStatus('${order._id}')">Đổi trạng thái</button>
                    <button class="btn btn-delete" onclick="deleteOrder('${order._id}')">Xóa</button>
                </td>
            </tr>`;
    });
}

async function updateStatus(id) {
    const newStatus = prompt("Nhập trạng thái (Mới nhận, Đang cắm, Đang giao, Hoàn thành):");
    if (newStatus) {
        await fetch(`${API_URL}/updateOrder/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        fetchOrders();
    }
}

async function deleteOrder(id) {
    if (confirm('Xóa đơn này nha má?')) {
        await fetch(`${API_URL}/deleteOrder/${id}`, { method: 'DELETE' });
        fetchOrders();
    }
}
fetchOrders();