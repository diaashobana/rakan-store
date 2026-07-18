// متجر راكان للإلكترونيات - نظام سحابي آمن متوافق مع معايير GitHub
const GITHUB_USERNAME = "diaashobana"; 
const REPO_NAME = "rakan-store";
const GITHUB_TOKEN = typeof process !== 'undefined' ? process.env.STORE_TOKEN : "";

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

// جلب المنتجات المحدثة مباشرة من GitHub لكي يراها كل الزبائن في نفس الوقت
async function initializeStore() {
    try {
        const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/products.json`, {
            headers: { "Authorization": `token ${GITHUB_TOKEN}` }
        });
        if (res.ok) {
            const data = await res.json();
            const decodedData = decodeURIComponent(escape(atob(data.content)));
            allProducts = JSON.parse(decodedData);
        } else {
            allProducts = [
                { id: 1, name: "باور بانك أنكر ذكي", desc: "شاحن متنقل فائق السرعة متوافق مع كافة الهواتف.", price: 120.00, stock: 15, category: "power", badge: "الأكثر مبيعاً 🔥", image: "https://images.unsplash.com/photo-1609592424083-d0bdf44a956d?w=400&q=80", targetDevices: ["iphone", "samsung"] },
                { id: 2, name: "سماعة بلوتوث رياضية", desc: "تتميز بنقاء صوت استثنائي وعازلة للصوت.", price: 85.00, stock: 8, category: "audio", badge: "وصول حديث ✨", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", targetDevices: ["all"] }
            ];
        }
    } catch (e) {
        console.error("خطأ في جلب البيانات:", e);
    }
    displayProducts(allProducts);
    updateCartUI();
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') { showAdminZone(); }
}

// دالة حفظ وتحديث المنتجات سحابياً في ملف GitHub
async function saveProductsToGitHub(updatedProductsList) {
    try {
        const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/products.json`;
        let sha = "";
        
        const getRes = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        if (getRes.ok) {
            const getData = await getRes.json();
            sha = getData.sha;
        }

        const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(updatedProductsList, null, 2))));
        
        const putRes = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "تحديث قائمة المنتجات من لوحة التحكم 📱",
                content: contentBase64,
                sha: sha
            })
        });

        if (putRes.ok) {
            alert("تم تحديث المتجر ونشره سحابياً لجميع الزبائن بنجاح! 🚀");
            initializeStore();
        } else {
            alert("حدث خطأ أثناء المزامنة، تأكد من صحة رمز التوكن الخاص بك.");
        }
    } catch(err) {
        console.error(err);
    }
}

// إضافة منتج جديد من لوحة التحكم مباشرة
window.addNewProductFromDashboard = async function() {
    const name = document.getElementById('new-p-name').value.trim();
    const price = parseFloat(document.getElementById('new-p-price').value);
    const stock = parseInt(document.getElementById('new-p-stock').value) || 0;
    const category = document.getElementById('new-p-category').value;
    const desc = document.getElementById('new-p-desc').value.trim() || "لا يوجد وصف حالي.";
    const targetInput = document.getElementById('new-p-target').value.toLowerCase().trim();
    
    const targetDevices = targetInput ? targetInput.split(',').map(d => d.trim()) : ["general"];

    if (!name || isNaN(price)) {
        alert("الرجاء إدخال اسم المنتج وسعره بشكل صحيح! ❌");
        return;
    }

    const nextId = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.id)) + 1 : 1;
    const newProduct = {
        id: nextId,
        name: name,
        desc: desc,
        price: price,
        stock: stock,
        category: category,
        badge: "وصول حديث ✨",
        image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=80",
        targetDevices: targetDevices
    };

    allProducts.push(newProduct);
    await saveProductsToGitHub(allProducts);

    // تفريغ الخانات بعد الإضافة
    document.getElementById('new-p-name').value = "";
    document.getElementById('new-p-price').value = "";
    document.getElementById('new-p-desc').value = "";
    document.getElementById('new-p-target').value = "";
};

// حذف منتج نهائياً من الموقع لكل الناس
window.deleteProduct = async function(id) {
    if (confirm("هل أنت متأكد من إزالة هذا المنتج نهائياً من عند كل الزبائن؟")) {
        allProducts = allProducts.filter(p => p.id !== id);
        await saveProductsToGitHub(allProducts);
    }
};

// تعديل كمية جرد المخزن فوراً
window.changeProductStock = async function(id, currentStock) {
    const newStock = prompt("أدخل كمية المخزن الجديدة لهذا المنتج:", currentStock);
    if (newStock !== null && !isNaN(parseInt(newStock))) {
        const product = allProducts.find(p => p.id === id);
        if (product) {
            product.stock = parseInt(newStock);
            await saveProductsToGitHub(allProducts);
        }
    }
};

// دالة عرض المنتجات في الواجهة
function displayProducts(productsToRender) {
    const container = document.getElementById('products-container');
    if (!container) return;
    container.innerHTML = "";
    const isAdmin = sessionStorage.getItem('isAdminLoggedIn') === 'true';

    if (productsToRender.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:30px; color:var(--text-secondary);">لم نجد أي كماليات مطابقة للبحث 🔍</p>`;
        return;
    }

    productsToRender.forEach(p => {
        const isOutOfStock = p.stock <= 0;
        const card = document.createElement('div');
        card.className = "product-card";
        card.innerHTML = `
            <div class="badge">${isOutOfStock ? 'نفذت ❌' : p.badge}</div>
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <div style="font-size:0.75rem; color:#3b82f6; margin-bottom:8px;">🎯 متوافق مع: ${p.targetDevices ? p.targetDevices.join(', ') : 'عام'}</div>
            <div style="font-weight:bold; color:var(--accent-orange); margin-bottom:12px;">${p.price.toFixed(2)} د.ل</div>
            <button class="cyber-btn" style="width:100%; ${isOutOfStock ? 'background:#334155;' : ''}" ${isOutOfStock ? 'disabled' : ''} onclick="addToCart(${p.id})">إضافة للسلة 🛒</button>
            <div style="display: ${isAdmin ? 'block' : 'none'}; margin-top:10px; border-top:1px solid var(--border-cyber); padding-top:10px;">
                <button class="cyber-btn" style="background:#ef4444; width:100%; font-size:0.8rem;" onclick="deleteProduct(${p.id})">حذف المنتج نهائياً ❌</button>
            </div>`;
        container.appendChild(card);
    });
}

// دالة البحث وتصفية الملحقات
window.searchDeviceAccessories = function() {
    const query = document.getElementById('main-search-input').value.toLowerCase().trim();
    if (query === "") {
        displayProducts(allProducts);
        return;
    }
    const matched = allProducts.filter(p => p.name.toLowerCase().includes(query) || (p.targetDevices && p.targetDevices.some(d => d.includes(query))));
    displayProducts(matched);
};

// تسجيل دخول لوحة التحكم
window.checkAdminLogin = function() {
    const user = document.getElementById('admin-user').value.trim();
    const pass = document.getElementById('admin-pass').value.trim();
    if (user === "rakan_admin" && pass === "rakan2026") {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        closeModal('loginModal');
        showAdminZone();
        alert("مرحباً بك يا مشرف راكان، تم فتح النظام السحابي بنجاح! 🔓");
    } else {
        alert("خطأ في البيانات.");
    }
};

function showAdminZone() {
    document.getElementById('admin-dashboard-zone').style.display = "block";
    document.getElementById('admin-auth-zone').innerHTML = `<button class="cyber-btn" style="background:#ef4444;" onclick="handleAdminLogout()">خروج المشرف ↩️</button>`;
    
    const invStatus = document.getElementById('admin-inventory-status');
    if (invStatus) {
        invStatus.innerHTML = `<h3 style="margin-top:20px; color:#f97316;">📦 جرد كميات المخزن والتحكم بها:</h3>`;
        allProducts.forEach(p => {
            invStatus.innerHTML += `
                <div style="font-size:0.9rem; padding:10px 0; border-bottom:1px solid var(--border-cyber); display:flex; justify-content:space-between; align-items:center;">
                    <span>📱 ${p.name} -> المتبقي: <b>${p.stock} قطعة</b></span>
                    <button class="cyber-btn" style="padding:4px 10px; background:#3b82f6;" onclick="changeProductStock(${p.id}, ${p.stock})">✏️ تعديل الكمية</button>
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

// السلة وإرسال الطلبات للواتساب
window.addToCart = function(id) {
    const p = allProducts.find(prod => prod.id === id);
    if (!p || p.stock <= 0) return;
    const inCart = cart.find(item => item.id === id);
    if (inCart) { inCart.quantity++; } else { cart.push({ ...p, quantity: 1 }); }
    updateCartUI();
};

window.updateCartUI = function() {
    let subtotal = 0;
    cart.forEach(item => { subtotal += item.price * item.quantity; });
    const subtotalEl = document.getElementById('subtotal-price');
    if (subtotalEl) subtotalEl.innerText = `${subtotal.toFixed(2)} د.ل`;
};

window.sendOrderToWhatsApp = function() {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    
    let text = `📦 *طلب شراء جديد من متجر راكان للإلكترونيات*\n\n👤 *الزبون:* ${name}\n📞 *الهاتف:* ${phone}\n📍 *العنوان:* ${address}\n`;
    cart.forEach(i => { text += `• ${i.name} (${i.quantity} قطع)\n`; });
    text += `💰 *الإجمالي:* ${document.getElementById('subtotal-price').innerText}`;
    
    window.open(`https://wa.me/218934409036?text=${encodeURIComponent(text)}`, '_blank');
};

window.openModal = function(id) { document.getElementById(id).style.display = 'flex'; };
window.closeModal = function(id) { document.getElementById(id).style.display = 'none'; };
