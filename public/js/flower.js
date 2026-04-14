const API_URL = '/api/flowers';
const DEFAULT_IMAGE = '/assets/images/product-placeholder.svg';

// 1. READ: Lấy toàn bộ danh sách hoa đổ vào bảng
async function loadFlowers() {
    try {
        const res = await fetchWithAuth(`${API_URL}/getAllFlowers`);
        if (!res.ok) return;
        const data = await res.json();
        const tbody = document.getElementById('flower-table-body');
        tbody.innerHTML = '';

        data.forEach(flower => {
            tbody.innerHTML += `
                <tr>
                    <td><b>${flower.name}</b></td>
                    <td>
                        <img src="${flower.image || DEFAULT_IMAGE}" alt="${flower.name}" style="width: 90px; height: 70px; object-fit: cover; border-radius: 6px; border: 1px solid #eee;">
                        <div style="margin-top: 8px;">
                            <input type="file" id="replace-image-${flower._id}" accept="image/*">
                        </div>
                    </td>
                    <td>${flower.category}</td>
                    <td>${flower.price.toLocaleString()}đ</td>
                    <td>${flower.stock}</td>
                    <td>
                        <button class="btn btn-edit" onclick="updateFlowerPrice('${flower._id}', ${flower.price})">Sửa Giá</button>
                        <button class="btn btn-edit" onclick="updateFlowerImage('${flower._id}')">Thay Ảnh</button>
                        <button class="btn btn-delete" onclick="deleteFlowerImage('${flower._id}')">Xóa Ảnh</button>
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
    const imageFile = document.getElementById('imageFile').files[0];
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;

    if (!name || !price) return alert("Vui lòng nhập tên và giá hoa!");

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', Number(price));
    formData.append('stock', Number(stock));
    if (imageFile) {
        formData.append('image', imageFile);
    }

    await fetch(`${API_URL}/addFlower`, {
        method: 'POST',
        headers: { ...authHeader() },
        body: formData
    });

    alert("Đã thêm hoa thành công!");
    document.getElementById('imageFile').value = '';
    loadFlowers(); // Refresh lại bảng
}

// 3. UPDATE: Chỉnh sửa giá
async function updateFlowerPrice(id, oldPrice) {
    const newPrice = prompt("Nhập giá mới cho mẫu hoa này:", oldPrice);
    if (newPrice) {
        await fetch(`${API_URL}/updateFlower/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify({ price: Number(newPrice) })
        });
        loadFlowers();
    }
}

// 4. DELETE: Xóa mẫu hoa
async function deleteFlower(id) {
    if (confirm("Xóa mẫu này là mất luôn trong database đó, chịu hông?")) {
        await fetchWithAuth(`${API_URL}/deleteFlower/${id}`, { method: 'DELETE' });
        loadFlowers();
    }
}

async function updateFlowerImage(id) {
    const input = document.getElementById(`replace-image-${id}`);
    const file = input?.files?.[0];
    if (!file) {
        alert('Bạn chưa chọn ảnh để thay.');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/updateFlowerImage/${id}`, {
        method: 'PUT',
        headers: { ...authHeader() },
        body: formData
    });
    const data = await res.json();
    if (!res.ok) {
        alert(data.message || 'Không thể thay ảnh.');
        return;
    }
    alert('Đã thay ảnh thành công!');
    loadFlowers();
}

async function deleteFlowerImage(id) {
    if (!confirm('Xóa ảnh hiện tại và trả về ảnh mặc định?')) {
        return;
    }
    const res = await fetchWithAuth(`${API_URL}/deleteFlowerImage/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
        alert(data.message || 'Không thể xóa ảnh.');
        return;
    }
    alert('Đã xóa ảnh thành công!');
    loadFlowers();
}

function logout() {
    clearAuth();
    window.location.href = 'login.html';
}

window.logout = logout;

// Chạy load dữ liệu ngay khi vào trang
(async () => {
    const user = await requireRole(['admin']);
    if (!user) return;
    loadFlowers();
})();