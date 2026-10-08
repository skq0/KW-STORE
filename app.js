// =========================================================
// 1. الأكواد القديمة والأساسية لمتجر KW STORE
// =========================================================

// دالة طلب النظام لتعبئة حقل الرسالة تلقائياً للعميل
function orderSystem(systemName) {
    const msgField = document.getElementById('clientMsg');
    if (msgField) {
        msgField.value = `أنا مهتم بطلب: ${systemName}، وأود الحصول على تفاصيل السعر والنسخة التجريبية.`;
        // التمرير التلقائي لنموذج التواصل
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }
}

// دالة التعامل مع نموذج الاتصال وإرسال البيانات القديم
function handleForm(event) {
    event.preventDefault();
    
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const msg = document.getElementById('clientMsg').value;

    // هنا تضع كود الإرسال الخاص بك (مثل السيرفر أو الواتساب)
    console.log("تم استلام طلب جديد:", { name, phone, msg });
    alert(`شكراً لك يا ${name}. تم إرسال طلبك بنجاح للمطور يوسف وسنتواصل معك قريباً.`);
    
    document.getElementById('contactForm').reset();
}


// =========================================================
// 2. نظام إدارة الرتب، الموظفين، والشكاوى الجديد
// =========================================================

// تجهيز البيانات الافتراضية في المتصفح عند أول زيارة للموقع
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('kw_roles')) {
        localStorage.setItem('kw_roles', JSON.stringify(["مدير العام", "مسؤول شكاوى", "دعم فني مستوى 1"]));
    }
    if (!localStorage.getItem('kw_employees')) {
        localStorage.setItem('kw_employees', JSON.stringify([{ name: "يوسف (المطور المسؤول)", role: "مدير العام" }]));
    }
    if (!localStorage.getItem('kw_chat')) {
        localStorage.setItem('kw_chat', JSON.stringify([]));
    }
    
    // تحديث القوائم في لوحة التحكم وتفعيل الفحص الأمني للأزرار
    renderRoles();
    renderEmployees();
    renderChatBoxes();
    checkAdminAccess();
});

// دالة فتح النوافذ المنبثقة (Modals)
function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

// دالة إغلاق النوافذ المنبثقة (Modals)
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// دالة التحكم في إظهار أو إخفاء زر الإعدادات للعملاء/الأدمن
function checkAdminAccess() {
    const adminNavBtn = document.getElementById('admin-nav-btn');
    const isOwner = localStorage.getItem('kw_isAdmin') === 'true';
    
    if (adminNavBtn) {
        if (isOwner) {
            adminNavBtn.style.display = 'inline-block'; // يظهر فقط ليوسف أو الموظفين المحددين
        } else {
            adminNavBtn.style.display = 'none'; // مخفي تماماً عن الزبائن العاديين
        }
    }
}

// دالة سريعة لك لتفعيل/تعطيل وضع الإدمن من كونسول المتصفح (F12) للتجربة:
// لتفعيل الوضع اكتب: toggleAdminView(true)
function toggleAdminView(status) {
    localStorage.setItem('kw_isAdmin', status);
    checkAdminAccess();
    console.log(status ? "تم تفعيل وضع المسؤول بنجاح! ظهر زر الإعدادات في الهيدر الفوق." : "تم العودة لوضع الزبون العادي.");
}

// ---------------------------------------------------------
// أ. نظام الدردشة الحية والشكاوى (الدعم الفني)
// ---------------------------------------------------------

// إرسال رسالة شكوى من طرف العميل
function sendTicketMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    saveMessage(text, 'client');
    input.value = '';
}

// إرسال رد رسمي من طرف الموظف/الأدمن داخل لوحة التحكم
function sendAdminReply() {
    const input = document.getElementById('adminChatInput');
    const text = input.value.trim();
    if (!text) return;

    saveMessage(text, 'staff');
    input.value = '';
}

// حفظ الرسائل في الذاكرة وتحديث الشاشات فوراً
function saveMessage(text, sender) {
    let chatLog = JSON.parse(localStorage.getItem('kw_chat')) || [];
    chatLog.push({ text, sender, time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) });
    localStorage.setItem('kw_chat', JSON.stringify(chatLog));
    
    renderChatBoxes();
}

// تحديث شاشات الشات للطرفين بالتزامن
function renderChatBoxes() {
    const chatLog = JSON.parse(localStorage.getItem('kw_chat')) || [];
    const clientBox = document.getElementById('chatBox');
    const adminBox = document.getElementById('adminChatBox');

    // كود تحديث شات العميل
    if (clientBox) {
        clientBox.innerHTML = '';
        chatLog.forEach(msg => {
            const div = document.createElement('div');
            div.className = `msg ${msg.sender}`;
            div.innerText = msg.text;
            clientBox.appendChild(div);
        });
        clientBox.scrollTop = clientBox.scrollHeight;
    }

    // كود تحديث شات الموظف في لوحة المراقبة
    if (adminBox) {
        adminBox.innerHTML = '';
        if (chatLog.length === 0) {
            adminBox.innerHTML = '<div class="data-item" style="color:#a3b899; border:none;">لا توجد رسائل شكاوى جديدة مسجلة حالياً.</div>';
        } else {
            chatLog.forEach(msg => {
                const div = document.createElement('div');
                div.className = 'data-item';
                div.innerHTML = `<span style="color: ${msg.sender === 'staff' ? 'var(--primary)' : '#fff'}">[${msg.sender === 'staff' ? 'الموظف' : 'الزبون'}]: ${msg.text}</span><small style="color:#557755">${msg.time}</small>`;
                adminBox.appendChild(div);
            });
            adminBox.scrollTop = adminBox.scrollHeight;
        }
    }
}

// ---------------------------------------------------------
// ب. نظام إدارة الرتب والموظفين المخصصين
// ---------------------------------------------------------

// إضافة رتبة مخصصة جديدة وكتابة اسمها
function addNewRole() {
    const input = document.getElementById('roleInput');
    const roleName = input.value.trim();
    if (!roleName) return alert("من فضلك اكتب اسم الرتبة أولاً!");

    let roles = JSON.parse(localStorage.getItem('kw_roles')) || [];
    if (roles.includes(roleName)) return alert("هذه الرتبة موجودة بالفعل!");

    roles.push(roleName);
    localStorage.setItem('kw_roles', JSON.stringify(roles));
    
    input.value = '';
    renderRoles();
    alert(`تم بنجاح إنشاء رتبة مخصصة جديدة باسم: ${roleName}`);
}

// عرض الرتب وتحديث الـ Select Dropdown الخاص بالموظفين
function renderRoles() {
    const roles = JSON.parse(localStorage.getItem('kw_roles')) || [];
    const rolesList = document.getElementById('rolesList');
    const roleSelect = document.getElementById('empRoleSelect');

    if (rolesList) {
        rolesList.innerHTML = '';
        roles.forEach(role => {
            const div = document.createElement('div');
            div.className = 'data-item';
            div.innerHTML = `<span>رتبة: ${role}</span><span style="color: var(--accent)">صلاحية الدعم مفعّلة</span>`;
            rolesList.appendChild(div);
        });
    }

    if (roleSelect) {
        roleSelect.innerHTML = '';
        roles.forEach(role => {
            const opt = document.createElement('option');
            opt.value = role;
            opt.innerText = role;
            roleSelect.appendChild(opt);
        });
    }
}

// تعيين موظف جديد بالصلاحية والرتبة المكتوبة
function assignEmployee() {
    const nameInput = document.getElementById('empNameInput');
    const roleSelect = document.getElementById('empRoleSelect');
    
    const empName = nameInput.value.trim();
    const empRole = roleSelect.value;

    if (!empName) return alert("من فضلك ادخل اسم الموظف بالكامل!");

    let employees = JSON.parse(localStorage.getItem('kw_employees')) || [];
    employees.push({ name: empName, role: empRole });
    localStorage.setItem('kw_employees', JSON.stringify(employees));

    nameInput.value = '';
    renderEmployees();
    alert(`تم بنجاح تعيين الموظف (${empName}) وتثبيته في رتبة: ${empRole}`);
}

// عرض قائمة الموظفين الحاليين في لوحة التحكم
function renderEmployees() {
    const employees = JSON.parse(localStorage.getItem('kw_employees')) || [];
    const empList = document.getElementById('empList');

    if (empList) {
        empList.innerHTML = '';
        employees.forEach(emp => {
            const div = document.createElement('div');
            div.className = 'data-item';
            div.innerHTML = `<span>${emp.name}</span><span style="color: var(--primary)">${emp.role}</span>`;
            empList.appendChild(div);
        });
    }
}
