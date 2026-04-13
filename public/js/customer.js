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
                <td>${c.fullName}</td>
                <td>${c.phone}</td>
                <td><span style="padding: 5px; background: #fce4ec">${c.memberTier}</span></td>
                <td>
                    <button class="btn btn-edit" onclick="upgradeVIP('${c._id}')">Lên VIP</button>
                    <button class="btn btn-delete" onclick="deleteCust('${c._id}')">Xóa</button>
                </td>
            </tr>`;
    });
}

async function upgradeVIP(id) {
    const tier = prompt("Nhập hạng mới (Bạc, Vàng, Kim Cương):");
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