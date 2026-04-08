const API_URL = '/api/flowers';

// 1. READ: Lấy toàn bộ danh sách hoa đổ vào bảng
async function loadFlowers() {
    try {
        const res = await fetch(`${API_URL}/getAllFlowers`);
        const data = await res.json();
        const tbody = document.getElementById('flower-table-body');
        tbody.innerHTML = '';

        data.forEach(flower => {
            tbody.innerHTML += `
                <tr>
                    <td><b>${flower.name}</b></td>
                    <td>${flower.category}</td>
                    <td>${flower.price.toLocaleString()}đ</td>
                    <td>${flower.stock}</td>
                    <td>
                        <button class="btn btn-edit" onclick="updateFlowerPrice('${flower._id}', ${flower.price})">Sửa Giá</button>
                        <button class="btn btn-delete" onclick="deleteFlower('${flower._id}')">Xóa</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) { console.error("Lỗi:", err); }
}

// 2. CREATE: Gửi data lên để tạo mới
async function createFlower() {
    const name = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;

    if (!name || !price) return alert("Vui lòng nhập tên và giá hoa!");

    await fetch(`${API_URL}/addFlower`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, price: Number(price), stock: Number(stock) })
    });

    alert("Đã thêm hoa thành công!");
    loadFlowers(); // Refresh lại bảng
}

// 3. UPDATE: Chỉnh sửa giá
async function updateFlowerPrice(id, oldPrice) {
    const newPrice = prompt("Nhập giá mới cho mẫu hoa này:", oldPrice);
    if (newPrice) {
        await fetch(`${API_URL}/updateFlower/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: Number(newPrice) })
        });
        loadFlowers();
    }
}

// 4. DELETE: Xóa mẫu hoa
async function deleteFlower(id) {
    if (confirm("Xóa mẫu này là mất luôn trong database đó, chịu hông?")) {
        await fetch(`${API_URL}/deleteFlower/${id}`, { method: 'DELETE' });
        loadFlowers();
    }
}

// Chạy load dữ liệu ngay khi vào trang
loadFlowers();