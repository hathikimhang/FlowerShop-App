const API_URL = '/api/flowers';
const DEFAULT_IMAGE = '/assets/images/product-placeholder.svg';
let currentFlowerId = null;
let allFlowersData = []; // Biến lưu danh sách gốc để dùng khi lọc không cần gọi lại API

// ==========================================
// 1. LOAD DANH SÁCH HOA
// ==========================================
async function loadFlowers() {
    try {
        console.log("Đang lấy dữ liệu từ server...");
        const res = await fetchWithAuth(`${API_URL}/getAllFlowers`);
        if (!res.ok) throw new Error("Lỗi lấy dữ liệu");
        
        allFlowersData = await res.json();
        renderFlowerTable(allFlowersData); // Đổ dữ liệu ra bảng
    } catch (err) { 
        console.error("Lỗi:", err); 
    }
}

// ==========================================
// 2. RENDER BẢNG (Dùng chung cho cả lúc mới load và lúc lọc)
// ==========================================
function renderFlowerTable(data) {
    const tbody = document.getElementById('flower-table-body');
    const countSpan = document.getElementById('flowerCount');
    if (!tbody) return;

    tbody.innerHTML = data.map(flower => {
        const imageSrc = flower.image || DEFAULT_IMAGE;
        return `
            <tr>
                <td><b>${flower.name}</b></td>
                <td><img src="${imageSrc}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; border: 1px solid #eee;"></td>
                <td><span class="badge badge-check">${flower.category}</span></td>
                <td><b style="color: #e91e63;">${Number(flower.price).toLocaleString()}đ</b></td>
                <td>${flower.stock}</td>
                <td>
                    <button class="btn btn-edit" onclick="openEditModal('${flower._id}', '${flower.name}', '${flower.category}', ${flower.price}, ${flower.stock})">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-delete" onclick="deleteFlower('${flower._id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </td>
            </tr>`;
    }).join('');

    // Cập nhật số lượng mẫu hoa đang hiển thị
    if (countSpan) {
        countSpan.innerText = `Đang hiển thị: ${data.length} mẫu`;
    }
}

// ==========================================
// 3. LOGIC BỘ LỌC DANH MỤC
// ==========================================
function filterFlowerTable() {
    const selectedCategory = document.getElementById('filterCategory').value;
    
    if (selectedCategory === 'all') {
        renderFlowerTable(allFlowersData); // Hiện tất cả
    } else {
        const filtered = allFlowersData.filter(flower => flower.category === selectedCategory);
        renderFlowerTable(filtered); // Hiện theo lọc
    }
}

// ==========================================
// 4. THÊM HOA MỚI
// ==========================================
async function createFlower() {
    const name = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;
    const imgFile = document.getElementById('imageFile').files[0];

    if (!name || !price || !imgFile) return alert("Bà nhập đủ Tên, Giá và chọn Ảnh nhé!");

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('image', imgFile);

    try {
        const res = await fetchWithAuth(`${API_URL}/addFlower`, {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            alert("Đã thêm thành công rùi nè bà!");
            // Reset form sau khi thêm
            document.getElementById('name').value = '';
            document.getElementById('price').value = '';
            document.getElementById('stock').value = '';
            document.getElementById('imageFile').value = '';
            loadFlowers(); // Load lại danh sách mới
        } else {
            const result = await res.json();
            alert("Lỗi: " + result.message);
        }
    } catch (err) { console.error(err); }
}

// ==========================================
// 5. MODAL CẬP NHẬT
// ==========================================
function openEditModal(id, name, category, price, stock) {
    currentFlowerId = id.trim();
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-category').value = category; 
    document.getElementById('edit-price').value = price;
    document.getElementById('edit-stock').value = stock;
    document.getElementById('editModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function saveUpdate() {
    if (!currentFlowerId) return alert("Không tìm thấy ID hoa!");

    const formData = new FormData();
    formData.append('name', document.getElementById('edit-name').value);
    formData.append('category', document.getElementById('edit-category').value);
    formData.append('price', document.getElementById('edit-price').value);
    formData.append('stock', document.getElementById('edit-stock').value);

    const fileInput = document.getElementById('edit-image');
    if (fileInput.files[0]) formData.append('image', fileInput.files[0]);

    try {
        const res = await fetchWithAuth(`${API_URL}/updateFlower/${currentFlowerId}`, {
            method: 'PUT',
            body: formData
        });
        if (res.ok) {
            alert("Cập nhật thành công!");
            closeModal();
            loadFlowers();
        } else {
            const result = await res.json();
            alert("Lỗi cập nhật: " + result.message);
        }
    } catch (err) { console.error(err); }
}

// ==========================================
// 6. XÓA HOA
// ==========================================
async function deleteFlower(id) {
    if (!confirm("Xóa thiệt hả bà? Mất luôn đó nha!")) return;
    try {
        const res = await fetchWithAuth(`${API_URL}/deleteFlower/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert("Đã xóa xong!");
            loadFlowers();
        } else {
            const result = await res.json();
            alert("Xóa thất bại: " + result.message);
        }
    } catch (err) { console.error(err); }
}

// ==========================================
// 7. KHỞI CHẠY & SỰ KIỆN
// ==========================================
document.addEventListener('DOMContentLoaded', loadFlowers);

// Đóng modal khi click ra ngoài vùng trắng
window.onclick = (e) => { 
    const modal = document.getElementById('editModal');
    if (e.target == modal) closeModal(); 
};