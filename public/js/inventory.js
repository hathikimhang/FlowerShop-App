const API_URL = '/api/inventory';

async function fetchInventory() {
    const res = await fetchWithAuth(`${API_URL}/getAllInventory`);
    if (!res.ok) return;
    const data = await res.json();
    const tbody = document.getElementById('inventory-table-body');
    tbody.innerHTML = '';
    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>ID Hoa: ${item.flowerId}</td>
                <td>${item.remainingQuantity}</td>
                <td>
                    <select onchange="updateInventoryStatus('${item._id}', this.value)" style="padding: 6px; border-radius: 4px; border: 1px solid #ddd; outline: none; background: #fafafa;">
                        <option value="Còn mới" ${item.status === 'Còn mới' ? 'selected' : ''}>Mới bảo quản</option>
                        <option value="Sắp héo" ${item.status === 'Sắp héo' ? 'selected' : ''}>Sắp hỏng</option>
                        <option value="Đã xuất hủy" ${item.status === 'Đã xuất hủy' ? 'selected' : ''}>Thanh lý / Đã xuất hủy</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-delete" onclick="wasteInventory('${item._id}')">Báo Héo/Xóa</button>
                </td>
            </tr>`;
    });
}

async function wasteInventory(id) {
    if (confirm('Hoa héo rồi bỏ nha?')) {
        await fetchWithAuth(`${API_URL}/deleteInventory/${id}`, { method: 'DELETE' });
        fetchInventory();
    }
}

async function updateInventoryStatus(id, newStatus) {
    if (newStatus) {
        await fetchWithAuth(`${API_URL}/updateInventory/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        fetchInventory();
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
    fetchInventory();
})();