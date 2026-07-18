// 📦 مصفوفة المنتجات الافتراضية المحدثة بالتصنيفات والأجهزة المستهدفة الجديدة
const defaultProducts = [
    { id: 1, name: "باور بانك أنكر سعة 20,000 مللي أمبير", desc: "شحن سريع متوافق مع iPhone و Samsung بقوة 25 واط.", price: 95.00, stock: 8, category: "powers", badge: "الأكثر مبيعاً 🔥", image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=400&q=80", targetDevices: ["iphone", "samsung"] },
    { id: 2, name: "سماعة رأس لاسلكية Pro P9", desc: "عزل ضوضاء فائق وصوت محيطي نقي جداً.", price: 85.00, stock: 4, category: "audio", badge: "طلب عالي ⚡", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", targetDevices: ["iphone", "macbook", "android"] },
    { id: 3, name: "كفر حماية مغناطيسي لايفون 15 برو", desc: "شفاف مقاوم للصدمات والخدوش ويدعم الماج سيف بالكامل.", price: 35.00, stock: 15, category: "covers", badge: "مقاوم للصدمات 🛡️", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80", targetDevices: ["iphone", "iphone 15"] },
    { id: 4, name: "لعبة GTA V لـ بلايستيشن 5", desc: "النسخة المحسنة والمطورة بالكامل بجودة 4K ديسك أصلي.", price: 140.00, stock: 3, category: "ps5", badge: "متوفر 💿", image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80", targetDevices: ["ps5", "playstation 5"] },
    { id: 5, name: "لعبة سبيس فورس لـ بلايستيشن 4", desc: "ديسك مغلف بالكامل مغامرات وتشويق رائع.", price: 90.00, stock: 5, category: "ps4", badge: "كلاسيك 💿", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80", targetDevices: ["ps4", "playstation 4"] },
    { id: 6, name: "قاعدة ماوس مكتبية RGB حجم عملاق", desc: "مقاومة للماء ومضيئة بالكامل لتجهيز المكاتب الاحترافية.", price: 65.00, stock: 10, category: "office", badge: "مظهر فخم 🗄️", image: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=400&q=80", targetDevices: ["pc", "macbook", "laptop"] },
    { id: 7, name: "مجموعة ستيكرات مقاومة للماء (50 قطعة)", desc: "تشكيلة منوعة رائعة للابتوب، البلايستيشن، والمكتب.", price: 15.00, stock: 40, category: "stickers", badge: "الأكثر طلباً 🎨", image: "https://images.unsplash.com/photo-1572945281861-68b2938ac341?w=400&q=80", targetDevices: ["pc", "macbook", "ps5", "ps4", "iphone"] }
];

let allProducts = [];
let cart = [];
let checkedCompareIds = [];

window.onload = function() {
    const savedTheme = localStorage.getItem('rakan_theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
    }
    initializeStore();
};

function initializeStore() {
    const localProducts = JSON.parse(localStorage.getItem('custom_products')) || [];
    const deletedIds = JSON.parse(localStorage.getItem('deleted_products')) || [];
    
    allProducts = [...defaultProducts, ...localProducts].filter(p => !deletedIds.includes(p.id));
    
    const updatedStocks = JSON.parse(localStorage.getItem('updated_stocks')) || {};
    allProducts.forEach(p => {
        if (updatedStocks[p.id] !== undefined) { p.stock = updatedStocks[p.id]; }
    });

    displayProducts(allProducts);
    updateCartUI();
    
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') { showAdminZone(); }
}

window.addNewProductFromDashboard = function() {
    const name = document.getElementById('new-p-name').value.trim();
    const price = parseFloat(document.getElementById('new-p-price').value);
    const stock = parseInt(document.getElementById('new-p-stock').value) || 0;
    const category = document.getElementById('new-p-category').value;
    const desc = document.getElementById('new-p-desc').value.trim() || "لا يوجد وصف حالي.";
    const targetInput = document.getElementById('new-p-target').value.toLowerCase().trim();
    
    const targetDevices = targetInput ? targetInput.split(',').map(d => d.trim()) : ["general"];
    
    const imageInput = document.getElementById('new-p-image-file');
    const file = imageInput.files[0];

    if (!name || isNaN(price)) {
        alert("الرجاء إدخال اسم المنتج وسعره بشكل صحيح! ❌");
        return;
    }

    const saveProductWithImage = (imageDataUrl) => {
        const newProduct = {
            id: Date.now(),
            name: name,
            desc: desc,
            price: price,
            stock: stock,
            category: category,
            badge: "وصول حديث ✨",
            image: imageDataUrl,
            targetDevices: targetDevices
        };

        const localProducts = JSON.parse(localStorage.getItem('custom_products')) || [];
        localProducts.push(newProduct);
        localStorage.setItem('custom_products', JSON.stringify(localProducts));

        document.getElementById('new-p-name').value = "";
        document.getElementById('new-p-price').value = "";
        document.getElementById('new-p-desc').value = "";
        document.getElementById('new-p-target').value = "";
        imageInput.value = ""; 
        
        alert(`تمت إضافة منتج "${name}" بنجاح وتصنيفه! 🚀`);
        initializeStore();
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) { saveProductWithImage(e.target.result); };
        reader.readAsDataURL(file);
    } else {
        const defaultImg = "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=80";
        saveProductWithImage(defaultImg);
    }
};

window.searchDeviceAccessories = function() {
    const query = document.getElementById('main-search-input').value.toLowerCase().trim();
    const titleElement = document.getElementById('section-title');
    
    if (query === "") {
        titleElement.innerText = "📦 المنتجات المتوفرة فوري";
        displayProducts(allProducts);
        return;
    }

    const matchedAccessories = allProducts.filter(p => {
        const matchesTarget = p.targetDevices && p.targetDevices.some(device => device.includes(query));
        const matchesName = p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query);
        return matchesTarget || matchesName;
    });

    titleElement.innerText = `🔍 الملحقات والكماليات المتوافقة مع "${query}":`;
    displayProducts(matchedAccessories);
};

window.clearSearch = function() {
    document.getElementById('main-search-input').value = "";
    searchDeviceAccessories();
};

window.editDashboardStat = function(statType) {
    if (statType === 'sales') {
        const currentSales = localStorage.getItem('stat_sales') || "620.00";
        const newValue = prompt("أدخل قيمة المبيعات الجديدة بالدينار (د.ل):", currentSales);
        if (newValue !== null && !isNaN(parseFloat(newValue))) { localStorage.setItem('stat_sales', parseFloat(newValue).toFixed(2)); }
    } else if (statType === 'profits') {
        const currentProfits = localStorage.getItem('stat_profits') || "155.00";
        const newValue = prompt("أدخل قيمة الأرباح التقديرية الجديدة بالدينار (د.ل):", currentProfits);
        if (newValue !== null && !isNaN(parseFloat(newValue))) { localStorage.setItem('stat_profits', parseFloat(newValue).toFixed(2)); }
    } else if (statType === 'visitors') {
        const currentVisitors = localStorage.getItem('stat_visitors') || "142";
        const newValue = prompt("أدخل عدد الزوار الجديد:", currentVisitors);
        if (newValue !== null && !isNaN(parseInt(newValue))) { localStorage.setItem('stat_visitors', parseInt(newValue)); }
    }
    showAdminZone();
};

window.changeProductStock = function(id, currentStock) {
    const newStock = prompt("أدخل كمية المخزن الجديدة لهذا المنتج:", currentStock);
    if (newStock !== null && !isNaN(parseInt(newStock))) {
        const updatedStocks = JSON.parse(localStorage.getItem('updated_stocks')) || {};
        updatedStocks[id] = parseInt(newStock);
        localStorage.setItem('updated_stocks', JSON.stringify(updatedStocks));
        alert("تم تحديث جرد الكمية بنجاح! 📦");
        initializeStore();
    }
};

function displayProducts(productsToRender) {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = "";

    const isAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true';

    if (productsToRender.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:30px; color:var(--text-secondary);">عذراً، لم نجد أي كماليات أو منتجات مطابقة للبحث حالياً 🔍</p>`;
        return;
    }

    productsToRender.forEach(p => {
        const isOutOfStock = p.stock <= 0;
        const isChecked = checkedCompareIds.includes(p.id) ? 'checked' : '';
        const card = document.createElement('div');
        card.className = "product-card";
        card.innerHTML = `
            <div class="badge">${isOutOfStock ? 'نفذت ❌' : p.badge}</div>
            <img src="${p.image}" alt="${p.name}">
            <h3 style="margin:10px 0 5px; font-size:1.1rem;">${p.name}</h3>
            <p style="font-size:0.8rem; color:var(--text-secondary); height:40px; overflow:hidden; margin:0 0 10px;">${p.desc}</p>
            <div style="font-size:0.75rem; color:#3b82f6; margin-bottom:8px;">🎯 متوافق مع: ${p.targetDevices ? p.targetDevices.join(', ') : 'عام'}</div>
            <div style="font-weight:bold; color:var(--accent-orange); margin-bottom:12px; font-size:1.1rem;">${p.price.toFixed(2)} د.ل</div>
            <button class="cyber-btn" style="width:100%; ${isOutOfStock ? 'background:#334155; cursor:not-allowed;' : ''}" ${isOutOfStock ? 'disabled' : ''} onclick="addToCart(${p.id})">إضافة للسلة 🛒</button>
            <label style="font-size: 0.8rem; margin-top: 12px; display: flex; align-items: center; gap: 6px; cursor: pointer; color: #3b82f6;">
                <input type="checkbox" ${isChecked} onclick="toggleCompareTrack(${p.id}, this)"> قارن المنتج ⇄
            </label>
            <div style="display: ${isAdmin ? 'block' : 'none'}; margin-top:10px; border-top:1px solid var(--border-cyber); padding-top:10px;">
                <button class="cyber-btn" style="background:#ef4444; width:100%; font-size:0.8rem; padding:6px;" onclick="deleteProduct(${p.id})">حذف المنتج من العرض ❌</button>
            </div>`;
        container.appendChild(card);
    });
}

window.filterCategory = function(category, buttonElement) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (buttonElement) buttonElement.classList.add('active');
    const filtered = category === 'all' ? allProducts : allProducts.filter(p => p.category === category);
    document.getElementById('section-title').innerText = "📦 المنتجات المتوفرة فوري";
    displayProducts(filtered);
};

window.toggleStoreTheme = function() {
    const body = document.body;
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme'); body.classList.add('light-theme');
        localStorage.setItem('rakan_theme', 'light');
    } else {
        body.classList.remove('light-theme'); body.classList.add('dark-theme');
        localStorage.setItem('rakan_theme', 'dark');
    }
};

window.checkAdminLogin = function() {
    const user = document.getElementById('admin-user').value.trim();
    const pass = document.getElementById('admin-pass').value.trim();
    if (user === "rakan_admin" && pass === "rakan2026") {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        closeModal('loginModal');
        showAdminZone();
        alert("مرحباً بك يا مشرف راكان، تم فتح النظام بنجاح! 🔓");
    } else {
        alert("خطأ! اسم المستخدم أو كلمة المرور غير صحيحة.");
    }
};

function showAdminZone() {
    document.getElementById('admin-dashboard-zone').style.display = "block";
    document.getElementById('admin-auth-zone').innerHTML = `<button class="cyber-btn" style="background:#ef4444;" onclick="handleAdminLogout()">خروج المشرف ↩️</button>`;
    
    const salesVal = localStorage.getItem('stat_sales') || "620.00";
    const profitsVal = localStorage.getItem('stat_profits') || "155.00";
    const visitorsVal = localStorage.getItem('stat_visitors') || "142";

    document.getElementById('dash-sales').innerHTML = `${salesVal} د.ل <button onclick="editDashboardStat('sales')" style="background:none; border:none; color:#3b82f6; cursor:pointer; font-size:0.9rem; margin-right:5px;">✏️ تعديل</button>`;
    document.getElementById('dash-profits').innerHTML = `${profitsVal} د.ل <button onclick="editDashboardStat('profits')" style="background:none; border:none; color:#3b82f6; cursor:pointer; font-size:0.9rem; margin-right:5px;">✏️ تعديل</button>`;
    document.getElementById('dash-visitors').innerHTML = `${visitorsVal} <button onclick="editDashboardStat('visitors')" style="background:none; border:none; color:#3b82f6; cursor:pointer; font-size:0.9rem; margin-right:5px;">✏️ تعديل</button>`;

    const invStatus = document.getElementById('admin-inventory-status');
    if (invStatus) {
        invStatus.innerHTML = `<h3 style="margin-top:20px; color:#f97316;">📦 جرد كميات المخزن الحالية والتحكم بها:</h3>`;
        allProducts.forEach(p => {
            invStatus.innerHTML += `
                <div style="font-size:0.9rem; padding:10px 0; border-bottom:1px solid var(--border-cyber); display:flex; justify-content:space-between; align-items:center; color: var(--text-main);">
                    <span>📱 ${p.name} -> المتبقي: <b style="color:${p.stock <= 0 ? '#ef4444' : '#10b981'}">${p.stock} قطعة</b></span>
                    <button class="cyber-btn" style="padding:4px 10px; font-size:0.8rem; background:#3b82f6;" onclick="changeProductStock(${p.id}, ${p.stock})">✏️ تعديل الكمية</button>
                </div>`;
        });
    }
    displayProducts(allProducts);
}

window.handleAdminLogout = function() {
    sessionStorage.removeItem('isAdminLoggedIn');
    document.getElementById('admin-dashboard-zone').style.display = "none";
    document.getElementById('admin-auth-zone').innerHTML = `<button class="cyber-btn admin-btn" onclick="openModal('loginModal')">🔐 لوحة المشرف</button>`;
    displayProducts(allProducts);
};

window.deleteProduct = function(id) {
    if (confirm("هل أنت متأكد من إزالة هذا المنتج نهائياً من الواجهة؟")) {
        let deletedIds = JSON.parse(localStorage.getItem('deleted_products')) || [];
        deletedIds.push(id);
        localStorage.setItem('deleted_products', JSON.stringify(deletedIds));
        initializeStore();
    }
};

window.addToCart = function(id) {
    const p = allProducts.find(prod => prod.id === id);
    if (!p || p.stock <= 0) return;
    const inCart = cart.find(item => item.id === id);
    if (inCart) {
        if (inCart.quantity >= p.stock) return;
        inCart.quantity++;
    } else {
        cart.push({ ...p, quantity: 1 });
    }
    updateCartUI();
    toggleCartDrawer(true);
};

window.removeFromCart = function(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
};

window.updateCartUI = function() {
    const list = document.getElementById('cart-items-list');
    const badgeCount = document.getElementById('cart-count-badge');
    if (!list) return;
    list.innerHTML = "";
    
    let totalItems = 0, subtotal = 0;
    cart.forEach(item => {
        totalItems += item.quantity;
        subtotal += item.price * item.quantity;
        list.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-cyber);">
                <div><span style="font-size:0.9rem; font-weight:bold;">${item.name}</span><br><small>${item.quantity} × ${item.price.toFixed(2)} د.ل</small></div>
                <button style="background:none; border:none; color:#ef4444; font-weight:bold; cursor:pointer; font-size:1.1rem;" onclick="removeFromCart(${item.id})">✕</button>
            </div>`;
    });

    if (badgeCount) badgeCount.innerText = totalItems;

    if (cart.length === 0) {
        list.innerHTML = `<p style="text-align:center; padding:20px; color:var(--text-secondary);">السلة فارغة حالياً 🛒</p>`;
        document.getElementById('subtotal-price').innerText = "0.00 د.ل";
        document.getElementById('earned-points-disp').innerText = "0";
        return;
    }

    let deliveryCost = parseFloat(document.getElementById('city-select').value) || 0;
    if (subtotal >= 150) deliveryCost = 0; 
    
    document.getElementById('subtotal-price').innerText = `${(subtotal + deliveryCost).toFixed(2)} د.ل`;
    document.getElementById('earned-points-disp').innerText = Math.floor(subtotal / 10);
};

window.toggleCompareTrack = function(id, element) {
    if (checkedCompareIds.includes(id)) { checkedCompareIds = checkedCompareIds.filter(i => i !== id); } 
    else {
        if (checkedCompareIds.length >= 3) {
            alert("يمكنك مقارنة 3 منتجات كحد أقصى!");
            if (element) element.checked = false;
            return;
        }
        checkedCompareIds.push(id);
    }
    renderComparisonTable();
};

function renderComparisonTable() {
    const tableOutput = document.getElementById('compare-table-output');
    if (!tableOutput) return;
    if (checkedCompareIds.length < 2) { tableOutput.innerHTML = ""; return; }

    const compareProducts = allProducts.filter(p => checkedCompareIds.includes(p.id));
    let tableHtml = `<table style="width:100%; text-align:center; border-collapse:collapse; background:#1e293b; border-radius:8px; overflow:hidden;"><thead><tr style="background:#0f172a; color:white;"><th style="padding:10px;">المواصفات</th>`;
    compareProducts.forEach(p => { tableHtml += `<th style="padding:10px; font-size:0.85rem;">${p.name}</th>`; });
    tableHtml += `</tr></thead><tbody><tr style="border-bottom:1px solid #334155;"><td style="padding:10px;"><b>السعر</b></td>`;
    compareProducts.forEach(p => { tableHtml += `<td style="padding:10px; color:var(--accent-orange); font-weight:bold;">${p.price} د.ل</td>`; });
    tableHtml += `</tr><tr><td style="padding:10px;"><b>التوافق</b></td>`;
    compareProducts.forEach(p => { tableHtml += `<td style="padding:10px; font-size:0.8rem;">${p.targetDevices ? p.targetDevices.join(', ') : 'عام'}</td>`; });
    tableHtml += `</tr></tbody></table>`;
    tableOutput.innerHTML = tableHtml;
}

window.toggleCartDrawer = function(open) {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (open) { drawer.classList.add('open'); overlay.style.display = 'block'; }
    else { drawer.classList.remove('open'); overlay.style.display = 'none'; }
};

window.openModal = function(id) { document.getElementById(id).style.display = 'flex'; };
window.closeModal = function(id) { document.getElementById(id).style.display = 'none'; };

// 💬 دالة إرسال الطلبات مباشرة إلى رقم الواتساب الخاص بك بالكامل
window.sendOrderToWhatsApp = function() {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    if(!name || !phone || !address) { alert("الرجاء تعبئة بيانات التوصيل كاملة لإرسال الطلب!"); return; }
    
    let text = `📦 *طلب شراء جديد من متجر راكان للإلكترونيات*\n\n`;
    text += `👤 *الزبون:* ${name}\n📞 *الهاتف:* ${phone}\n📍 *العنوان:* ${address}\n`;
    text += `-----------------------------------\n`;
    cart.forEach(i => { text += `• ${i.name} (${i.quantity} قطع)\n`; });
    text += `-----------------------------------\n`;
    text += `💰 *الإجمالي الكلي شامل التوصيل:* ${document.getElementById('subtotal-price').innerText}`;
    
    // تم ربطها برقمك مباشرة بصيغة دولية صحيحة
    window.open(`https://wa.me/218934409036?text=${encodeURIComponent(text)}`, '_blank');
};