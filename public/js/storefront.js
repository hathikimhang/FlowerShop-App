const API_URL = '/api/flowers';
let allFlowers = []; // Biến gốc lưu dữ liệu để lọc cho mượt

// ==========================================
// 1. LOAD DỮ LIỆU TỪ SERVER
// ==========================================
async function loadStorefront() {
    try {
        console.log("Đang tải danh sách hoa cửa hàng...");
        const res = await fetch(`${API_URL}/getAllFlowers`); 
        
        if (!res.ok) throw new Error("Lỗi kết nối server");

        allFlowers = await res.json();
        renderFlowers(allFlowers); // Lúc mới mở trang thì hiện tất cả

    } catch (err) {
        console.error("Lỗi rồi bà Hằng ơi:", err);
        const grid = document.getElementById('flower-grid');
        if (grid) grid.innerHTML = `<p style="text-align:center; grid-column:1/-1; color:red;">Lỗi kết nối API rồi bà!</p>`;
    }
}

// ==========================================
// 2. VẼ GIAO DIỆN (RENDER)
// ==========================================
function renderFlowers(data) {
    const grid = document.getElementById('flower-grid');
    const countSpan = document.getElementById('storeflowerCount'); // Chỗ hiển thị "Đang hiển thị... mẫu"
    
    if (!grid) return;

    if (data.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 50px;">Hết hoa này rồi bà ơi! Chọn cái khác đi.</p>';
    } else {
        grid.innerHTML = data.map(flower => `
            <div class="flower-card">
                <img src="${flower.image || './assets/images/placeholder.svg'}" alt="${flower.name}">
                
                <div class="flower-info">
                    <h3 style="margin: 10px 0; font-size: 18px;">${flower.name}</h3>
                    
                    <span class="badge" style="background:#e3f2fd; color:#1976d2; padding: 4px 10px; border-radius: 4px; font-size: 12px; display: inline-block;">
                        ${flower.category}
                    </span>
                    
                    <p style="color:#e91e63; font-weight:bold; font-size:20px; margin: 12px 0;">
                        ${Number(flower.price).toLocaleString()}đ
                    </p>
                    
                    <p style="font-size:13px; color:#666; margin-bottom: 15px;">
                        Tồn kho: <b style="color: #2c3e50;">${flower.stock}</b>
                    </p>
                    
                    <button class="btn-admin-edit" onclick="location.href='flower.html'">
                        <i></i> Quản lý mẫu này
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Cập nhật số lượng đếm mẫu hoa (Đúng gu bà)
    if (countSpan) {
        countSpan.innerText = `Đang hiển thị: ${data.length} mẫu`;
    }
}

// ==========================================
// 3. HÀM LỌC DANH MỤC (ONCHANGE)
// ==========================================
function filterFlowers() {
    const selected = document.getElementById('categoryFilter').value;
    
    console.log("Đang lọc danh mục:", selected);
    
    const filtered = (selected === 'all') 
        ? allFlowers 
        : allFlowers.filter(f => f.category === selected);
        
    renderFlowers(filtered);
}

// ==========================================
// 4. KHỞI CHẠY KHI MỞ TRANG
// ==========================================
document.addEventListener('DOMContentLoaded', loadStorefront);