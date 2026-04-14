const API_AUTH = '/api/auth';
const API_ORDER = '/api/orders';

function logout() {
    clearAuth();
    window.location.href = 'login.html';
}
window.logout = logout;

async function loadProfile() {
    try {
        const res = await fetchWithAuth(`${API_AUTH}/me`);
        if (!res.ok) return;
        const data = await res.json();
        const user = data.user;
        
        document.getElementById('profile-name').value = user.fullName || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-phone').value = user.phone || '';
        document.getElementById('profile-address').value = user.address || '';
        document.getElementById('profile-tier').innerText = user.memberTier || 'Thường';
        document.getElementById('profile-spent').innerText = (user.totalSpent || 0).toLocaleString('vi-VN') + 'đ';

        // Show admin links if needed
        if (user.role === 'admin') {
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-block');
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadMyOrders() {
    try {
        const res = await fetchWithAuth(`${API_ORDER}/myOrders`);
        if (!res.ok) {
            console.error('Failed to fetch orders, status:', res.status);
            return;
        }
        const orders = await res.json();
        
        const tbody = document.getElementById('my-orders-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        if (!Array.isArray(orders) || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Bạn chưa có đơn hàng nào.</td></tr>';
            return;
        }

        orders.forEach(order => {
            let itemsHtml = '';
            if (Array.isArray(order.items)) {
                itemsHtml = order.items.map(item => `${item.flowerId ? item.flowerId.name : 'Hoa đã xóa'} (x${item.quantity})`).join('<br>');
            }
            
            let btnEdit = '';
            if (order.status === 'Mới nhận') {
                btnEdit = `<button class="btn btn-edit" onclick="openEditModal('${order._id || ''}', '${order.recipientName || ''}', '${order.recipientPhone || ''}', '${order.deliveryAddress || ''}')">Sửa giao hàng</button>`;
            } else {
                btnEdit = `<small style="color:#888;">Không thể sửa lúc này</small>`;
            }
            
            const orderIdStr = order._id ? order._id.substring(0,8) : 'Unknown';
            tbody.innerHTML += `
                <tr>
                    <td><b>${orderIdStr}...</b><br>
                        <small style="color: #4caf50;">Tổng: ${(order.totalAmount || 0).toLocaleString()}đ</small>
                    </td>
                    <td>
                        <div style="font-size: 0.9em; margin-bottom: 5px; color: #555;"><i>${itemsHtml}</i></div>
                        Nhận: <b>${order.recipientName || 'Chưa rõ'}</b> - ${order.recipientPhone || 'Chưa rõ'}<br>
                        Đ/c: ${order.deliveryAddress || 'Chưa rõ'}
                    </td>
                    <td><span style="padding: 5px; background: #e0f7fa; border-radius: 4px; font-weight: bold; color: #00bcd4;">${order.status || 'Chưa rõ'}</span></td>
                    <td>${btnEdit}</td>
                </tr>
            `;
        });
    } catch (e) {
        console.error('Fetch errors in profile:', e);
        const tbody = document.getElementById('my-orders-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Lỗi tải dữ liệu. Vui lòng thử lại.</td></tr>';
    }
}

// Update Profile
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = document.getElementById('profile-result');
    result.innerText = 'Đang cập nhật...';
    result.style.color = '#333';
    
    const payload = {
        fullName: document.getElementById('profile-name').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
        address: document.getElementById('profile-address').value.trim()
    };
    
    try {
        const res = await fetchWithAuth(`${API_AUTH}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (res.ok) {
            result.innerText = 'Cập nhật tài khoản thành công!';
            result.style.color = '#4caf50';
            loadProfile();
        } else {
            result.innerText = data.message || 'Lỗi cập nhật';
            result.style.color = '#f44336';
        }
    } catch (e) {
        result.innerText = 'Lỗi máy chủ';
        result.style.color = '#f44336';
    }
});

// Update Password
document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = document.getElementById('password-result');
    result.innerText = 'Đang đổi mật khẩu...';
    result.style.color = '#333';
    
    const payload = {
        oldPassword: document.getElementById('old-pass').value,
        newPassword: document.getElementById('new-pass').value
    };
    
    try {
        const res = await fetchWithAuth(`${API_AUTH}/password`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (res.ok) {
            result.innerText = 'Đổi mật khẩu thành công! Chuyển hướng...';
            result.style.color = '#4caf50';
            setTimeout(() => { logout(); }, 1500);
        } else {
            result.innerText = data.message || 'Lỗi đổi mật khẩu';
            result.style.color = '#f44336';
        }
    } catch (e) {
        result.innerText = 'Lỗi máy chủ';
        result.style.color = '#f44336';
    }
});

// Order Editing
function openEditModal(id, name, phone, address) {
    document.getElementById('edit-order-id').value = id;
    document.getElementById('edit-recipient-name').value = name;
    document.getElementById('edit-recipient-phone').value = phone;
    document.getElementById('edit-delivery-address').value = address;
    document.getElementById('edit-order-result').innerText = '';
    document.getElementById('editOrderModal').style.display = 'flex';
}
window.openEditModal = openEditModal;

document.getElementById('edit-order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = document.getElementById('edit-order-result');
    result.innerText = 'Đang lưu...';
    
    const id = document.getElementById('edit-order-id').value;
    const payload = {
        recipientName: document.getElementById('edit-recipient-name').value.trim(),
        recipientPhone: document.getElementById('edit-recipient-phone').value.trim(),
        deliveryAddress: document.getElementById('edit-delivery-address').value.trim()
    };
    
    try {
        const res = await fetchWithAuth(`${API_ORDER}/updateMyOrder/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
            result.innerText = 'Lưu thành công!';
            result.style.color = '#4caf50';
            setTimeout(() => {
                document.getElementById('editOrderModal').style.display = 'none';
                loadMyOrders();
            }, 1000);
        } else {
            result.innerText = data.message;
            result.style.color = '#f44336';
        }
    } catch (e) {
        result.innerText = 'Lỗi kết nối';
        result.style.color = '#f44336';
    }
});

(async () => {
    const user = await requireAuthWrapper();
    if (!user) return;
    loadProfile();
    loadMyOrders();
})();

async function requireAuthWrapper() {
    const token = localStorage.getItem('flower_shop_token');
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }
    try {
        const res = await fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + token } });
        if (!res.ok) {
            window.location.href = 'login.html';
            return null;
        }
        const data = await res.json();
        return data.user;
    } catch (e) {
        window.location.href = 'login.html';
        return null;
    }
}
