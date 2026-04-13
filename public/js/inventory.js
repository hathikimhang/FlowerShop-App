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
                <td>${item.status}</td>
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