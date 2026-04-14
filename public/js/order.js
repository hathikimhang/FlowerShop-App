const API_URL = '/api/orders';

async function fetchOrders() {
    const res = await fetchWithAuth(`${API_URL}/getAllOrders`);
    if (!res.ok) return;
    const data = await res.json();
    const tbody = document.getElementById('order-table-body');
    tbody.innerHTML = '';
    data.forEach(order => {
        let detailsHtml = '';
        if (order.items && order.items.length > 0) {
            detailsHtml = order.items.map(item => `${item.flowerId ? item.flowerId.name : 'Hoa đã xóa'} (x${item.quantity})`).join('<br>');
        }
        let userEmail = order.userId ? order.userId.email : 'Ẩn danh';
        let buyerName = order.userId ? order.userId.fullName : 'Ẩn danh';
        
        let recipientName = order.recipientName || 'Chưa rõ';
        let recipientPhone = order.recipientPhone || 'Chưa rõ';

        tbody.innerHTML += `
            <tr>
                <td>${order._id.substring(0, 8)}...</td>
                <td>
                  <small>Người mua: ${buyerName} (${userEmail})</small><br>
                  <b>Nhận: ${recipientName}</b> - ${recipientPhone}<br>
                  ${order.deliveryAddress || 'Tại cửa hàng'}
                </td>
                <td>
                  <div style="font-size: 0.9em;">${detailsHtml}</div>
                  <strong style="color: #4caf50;">Tổng: ${(order.totalAmount || 0).toLocaleString()}đ</strong>
                </td>
                <td>
                    <select onchange="updateStatus('${order._id}', this.value)" style="padding: 6px; border-radius: 4px; border: 1px solid #ddd; outline: none; background: #fafafa;">
                        <option value="Mới nhận" ${order.status === 'Mới nhận' ? 'selected' : ''}>Mới nhận</option>
                        <option value="Đang cắm" ${order.status === 'Đang cắm' ? 'selected' : ''}>Đang cắm</option>
                        <option value="Đang giao" ${order.status === 'Đang giao' ? 'selected' : ''}>Đang giao</option>
                        <option value="Hoàn thành" ${order.status === 'Hoàn thành' ? 'selected' : ''}>Hoàn thành</option>
                        <option value="Đã hủy" ${order.status === 'Đã hủy' ? 'selected' : ''}>Đã hủy</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-delete" onclick="deleteOrder('${order._id}')">Xóa</button>
                </td>
            </tr>`;
    });
}

async function updateStatus(id, newStatus) {
    if (newStatus) {
        await fetch(`${API_URL}/updateOrder/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify({ status: newStatus })
        });
        fetchOrders();
    }
}

async function deleteOrder(id) {
    if (confirm('Xóa đơn này nha má?')) {
        await fetchWithAuth(`${API_URL}/deleteOrder/${id}`, { method: 'DELETE' });
        fetchOrders();
    }
}

function logout() {
    clearAuth();
    window.location.href = 'login.html';
}

window.logout = logout;

(async () => {
    const user = await requireRole(['admin']);
    if (!user) return;
    fetchOrders();
})();