const API_URL = '/api/flowers';
const DEFAULT_IMAGE = '/assets/images/product-placeholder.svg';
let currentFlowerId = null;

// 1. LOAD DANH SÁCH HOA
async function loadFlowers() {
    try {
        const res = await fetchWithAuth(`${API_URL}/getAllFlowers`);
        const data = await res.json();
        const tbody = document.getElementById('flower-table-body');
        tbody.innerHTML = '';
        
        data.forEach(flower => {
            tbody.innerHTML += `
                <tr>
                    <td>${flower.name}</td>
                    <td><img src="${flower.image || DEFAULT_IMAGE}" style="width:70px"></td>
                    <td>${flower.category}</td>
                    <td>${Number(flower.price).toLocaleString()}đ</td>
                    <td>${flower.stock}</td>
                    <td>
                        <button class="btn btn-edit" onclick="openEditModal('${flower._id}', '${flower.name}', '${flower.category}', ${flower.price}, ${flower.stock})">Sửa</button>
                        <button class="btn btn-delete" onclick="deleteFlower('${flower._id}')">Xóa</button>
                    </td>
                </tr>`;
        });
    } catch (err) {
        console.error("Lỗi khi load danh sách:", err);
    }
}

// 2. MỞ MODAL CẬP NHẬT
function openEditModal(id, name, category, price, stock) {
    currentFlowerId = id.trim(); // Tránh lỗi khoảng trắng ID
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-category').value = category;
    document.getElementById('edit-price').value = price;
    document.getElementById('edit-stock').value = stock;
    document.getElementById('editModal').style.display = 'block';
}

// 3. ĐÓNG MODAL
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// 4. LƯU CẬP NHẬT
async function saveUpdate() {
    if (!currentFlowerId) return alert("Không xác định được ID hoa!");
    
    console.log("--- Đang cập nhật ID:", currentFlowerId);
    
    const formData = new FormData();
    formData.append('name', document.getElementById('edit-name').value);
    formData.append('category', document.getElementById('edit-category').value);
    formData.append('price', document.getElementById('edit-price').value);
    formData.append('stock', document.getElementById('edit-stock').value);

    const fileInput = document.getElementById('edit-image');
    if (fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
    }

    try {
        const res = await fetchWithAuth(`${API_URL}/updateFlower/${currentFlowerId}`, {
            method: 'PUT',
            body: formData
        });

        const result = await res.json();
        if (res.ok) {
            alert("Cập nhật thành công!");
            closeModal();
            loadFlowers();
        } else {
            alert("Lỗi server: " + result.message);
        }
    } catch (err) {
        console.error("Lỗi cập nhật:", err);
    }
}

// 5. HÀM XÓA (ÔN ĐỊNH LẠI CHỖ NÀY)
async function deleteFlower(id) {
    console.log("Đang gọi lệnh xóa cho ID:", id);
    
    if (!id) return alert("ID không hợp lệ!");
    
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa mẫu hoa này không?");
    if (!confirmDelete) return;

    try {
        const res = await fetchWithAuth(`${API_URL}/deleteFlower/${id}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            alert("Đã xóa thành công!");
            loadFlowers(); // Refresh lại bảng
        } else {
            const result = await res.json();
            alert("Xóa thất bại: " + result.message);
        }
    } catch (err) {
        console.error("Lỗi xóa:", err);
        alert("Không thể kết nối đến server để xóa.");
    }
}

// 6. THÊM HOA MỚI (DỰ PHÒNG NẾU ÔNG CẦN)
async function createFlower() {
    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('stock', document.getElementById('stock').value);

    const img = document.getElementById('imageFile');
    if (img.files[0]) formData.append('image', img.files[0]);

    try {
        const res = await fetchWithAuth(`${API_URL}/addFlower`, {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            alert("Đã thêm!");
            loadFlowers();
        }
    } catch (err) {
        console.error(err);
    }
}

// 7. KHỞI CHẠY
(async () => {
    const user = await requireRole(['admin']);
    if (user) loadFlowers();
})();