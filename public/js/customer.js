async function loadCustomers() {
    try {
        const res = await fetch('/api/customers/getAllCustomers');
        const data = await res.json();
        const tbody = document.getElementById('customer-table-body');
        
        if (!tbody) return;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Chưa có khách hàng nào</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(c => `
            <tr>
                <td style="text-align: left; padding-left: 30px;"><b>${c.customerName}</b></td>
                <td>${c.phone}</td>
                <td><span style="background: #eee; padding: 2px 8px; border-radius: 10px;">${c.orderCount}</span></td>
                <td><b style="color:#27ae60;">${Number(c.totalSpent).toLocaleString()}đ</b></td>
                <td><span class="badge rank-${c.rank}">${c.rank}</span></td>
                <td>
                    <button class="btn-action-delete" onclick="deleteCust('${c._id}')" title="Xóa khách hàng">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Lỗi tải danh sách khách hàng:", err);
    }
}

async function deleteCust(id) {
    if (confirm("Xóa khách này là mất hết lịch sử tích lũy đó bà Hằng! Chắc chưa?")) {
        try {
            const res = await fetch(`/api/customers/deleteCustomer/${id}`, { method: 'DELETE' });
            if (res.ok) {
                loadCustomers();
            }
        } catch (err) {
            alert("Không xóa được khách rồi bà ơi!");
        }
    }
}

document.addEventListener('DOMContentLoaded', loadCustomers);