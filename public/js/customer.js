const API_URL = '/api/customers';

async function fetchCustomers() {
    const res = await fetchWithAuth(`${API_URL}/getAllCustomers`);
    if (!res.ok) return;
    const data = await res.json();
    const tbody = document.getElementById('customer-table-body');
    tbody.innerHTML = '';
    data.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td><b>${c.fullName}</b><br><small>${c.email}</small></td>
                <td>${c.phone || 'Chưa cung cấp'}</td>
                <td>${(c.totalSpent || 0).toLocaleString()}đ</td>
                <td>
                    <select onchange="upgradeVIP('${c._id}', this.value)" style="padding: 6px; border-radius: 4px; border: 1px solid #ddd; outline: none; background: #fce4ec; color: #d81b60; font-weight: bold;">
                        <option value="Thường" ${c.memberTier === 'Thường' ? 'selected' : ''}>Thường</option>
                        <option value="Bạc" ${c.memberTier === 'Bạc' ? 'selected' : ''}>Bạc</option>
                        <option value="Vàng" ${c.memberTier === 'Vàng' ? 'selected' : ''}>Vàng</option>
                        <option value="Kim Cương" ${c.memberTier === 'Kim Cương' ? 'selected' : ''}>Kim Cương</option>
                        <option value="VIP" ${c.memberTier === 'VIP' ? 'selected' : ''}>VIP</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-delete" onclick="deleteCust('${c._id}')">Khóa/Xóa</button>
                </td>
            </tr>`;
    });
}

async function upgradeVIP(id, tier) {
    if (tier) {
        await fetch(`${API_URL}/updateCustomer/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify({ memberTier: tier })
        });
        fetchCustomers();
    }
}

async function deleteCust(id) {
    if (confirm('Khách này bom hàng hay gì mà xóa vậy má?')) {
        await fetchWithAuth(`${API_URL}/deleteCustomer/${id}`, { method: 'DELETE' });
        fetchCustomers();
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
    fetchCustomers();
})();