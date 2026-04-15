const INV_API = '/api/inventory';
const FLOWER_API = '/api/flowers';
let currentNoteId = null;

// 1. Load hoa vào ô chọn
async function loadFlowerSelect() {
    try {
        const res = await fetchWithAuth(`${FLOWER_API}/getAllFlowers`);
        const flowers = await res.json();
        const select = document.getElementById('flowerSelect');
        if (!select) return;
        select.innerHTML = flowers.map(f => 
            `<option value="${f._id}">${f.name} (Tồn: ${f.stock})</option>`
        ).join('');
    } catch (err) { console.error(err); }
}

// 2. Render lịch sử với Badge màu sắc
async function loadHistory() {
    try {
        const res = await fetchWithAuth(`${INV_API}/history`);
        const data = await res.json();
        const tbody = document.getElementById('inventory-table-body');
        if (!tbody) return;

        tbody.innerHTML = data.map(item => {
            const flowerName = item.flowerId ? item.flowerId.name : 'N/A';
            const date = new Date(item.createdAt).toLocaleString('vi-VN');
            
            // Xử lý Badge theo lý do
            let badgeClass = 'badge-check';
            if (item.reason === 'Nhập hàng') badgeClass = 'badge-import';
            else if (item.reason === 'Hàng lỗi') badgeClass = 'badge-error';
            else if (item.reason === 'Trả hàng') badgeClass = 'badge-return';

            // Xử lý màu số lượng
            const amountColor = item.changeAmount > 0 ? '#27ae60' : '#e74c3c';
            const amountPrefix = item.changeAmount > 0 ? '+' : '';

            return `
                <tr>
                    <td style="font-size: 0.9rem; color: #666;">${date}</td>
                    <td><b style="color: #2c3e50;">${flowerName}</b></td>
                    <td><b style="color: ${amountColor}">${amountPrefix}${item.changeAmount}</b></td>
                    <td><span class="badge ${badgeClass}">${item.reason}</span></td>
                    <td style="color: #7f8c8d; font-style: italic;">${item.note || ''}</td>
                    <td>
                        <button class="btn-edit" onclick="openEditNote('${item._id}', ${item.changeAmount}, '${item.reason}', '${item.note}', '${flowerName}')">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn-delete" onclick="deleteNote('${item._id}')">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) { console.error(err); }
}

// 3. Thêm phiếu mới
async function createInventoryNote() {
    const amount = document.getElementById('changeAmount').value;
    if (!amount || amount == 0) return alert("Bà nhập số lượng giùm cái!");

    const data = {
        flowerId: document.getElementById('flowerSelect').value,
        changeAmount: Number(amount),
        reason: document.getElementById('reason').value,
        note: document.getElementById('note').value
    };

    const res = await fetchWithAuth(`${INV_API}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("Xác nhận nhập/xuất thành công!");
        document.getElementById('changeAmount').value = '';
        document.getElementById('note').value = '';
        loadHistory();
        loadFlowerSelect();
    }
}

// 4. Modal Update
function openEditNote(id, amount, reason, note, flowerName) {
    currentNoteId = id;
    document.getElementById('edit-flower-name').innerText = flowerName;
    document.getElementById('edit-changeAmount').value = amount;
    document.getElementById('edit-reason').value = reason;
    document.getElementById('edit-note').value = note;
    document.getElementById('editInvModal').style.display = 'block';
}

function closeInvModal() {
    document.getElementById('editInvModal').style.display = 'none';
}

async function saveUpdateInv() {
    const data = {
        changeAmount: Number(document.getElementById('edit-changeAmount').value),
        reason: document.getElementById('edit-reason').value,
        note: document.getElementById('edit-note').value
    };

    const res = await fetchWithAuth(`${INV_API}/${currentNoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("Cập nhật thành công!");
        closeInvModal();
        loadHistory();
        loadFlowerSelect();
    }
}

// 5. Delete
async function deleteNote(id) {
    if (!confirm("Bà có chắc chắn muốn xóa phiếu kho này không?")) return;
    const res = await fetchWithAuth(`${INV_API}/${id}`, { method: 'DELETE' });
    if (res.ok) {
        loadHistory();
        loadFlowerSelect();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadFlowerSelect();
    loadHistory();
});

window.onclick = function(event) {
    if (event.target == document.getElementById('editInvModal')) closeInvModal();
};