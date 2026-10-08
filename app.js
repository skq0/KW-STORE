// =========================================================================
// 1. الأكواد القديمة والأساسية لمتجر KW STORE (طلب الأنظمة ونموذج التواصل)
// =========================================================================

// دالة طلب النظام لتعبئة حقل الرسالة تلقائياً للعميل ثم التمرير لأسفل
function orderSystem(systemName) {
    const msgField = document.getElementById('clientMsg');
    if (msgField) {
        msgField.value = `أنا مهتم بطلب: ${systemName}، وأود الحصول على تفاصيل السعر والنسخة التجريبية.`;
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }
}

// دالة التعامل مع نموذج الاتصال وإرسال البيانات القديم
function handleForm(event) {
    event.preventDefault();
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const msg = document.getElementById('clientMsg').value;

    console.log("تم استلام طلب جديد:", { name, phone, msg });
    alert(`شكراً لك يا ${name}. تم إرسال طلبك بنجاح للمطور يوسف وسنتواصل معك قريباً.`);
    document.getElementById('contactForm').reset();
}


// =========================================================================
// 2. نظام إدارة الهوية الرقمية الفريد للزوار وتوليد الـ IDs الثابتة
// =========================================================================

// دالة التحقق من هوية الزائر وفرض كتابة الاسم عند أول زيارة للموقع
function checkAndPromptUserIdentity() {
    let directory = JSON.parse(localStorage.getItem('kw_visitors_directory')) || [];
    let savedName = localStorage.getItem('kw_my_name');
    let savedID = localStorage.getItem('kw_my_id');

    // إذا كان الزائر جديداً ولم يسجل اسمه من قبل، يفرص عليه النظام الاسم
    if (!savedName || !savedID) {
        let enteredName = "";
        while (!enteredName || enteredName.trim() === "") {
            enteredName = prompt("مرحباً بك في منصة KW STORE العالمية!\nفضلاً، ادخل اسمك الكريم بالكامل لإنشاء هويتك وتصفح الأنظمة البرمجية:");
        }
        enteredName = enteredName.trim();

        // توليد ID ثابت يبدأ من 100 ويمتد تلقائياً بناءً على عدد الزوار المتراكم
        let assignedID = 100 + directory.length;

        // قفل الهوية الرقمية في متصفح العميل الحالي حتى لا تتغير أبداً
        localStorage.setItem('kw_my_name', enteredName);
        localStorage.setItem('kw_my_id', assignedID.toString());

        // تسجيل الهوية في السجل العام للمتجر ليراها المشرف لاحقاً في اللائحة
        directory.push({ id: assignedID, name: enteredName });
        localStorage.setItem('kw_visitors_directory', JSON.stringify(directory));

        alert(`أهلاً بك يا ${enteredName}.\nتم اعتماد هويتك الثابتة في النظام برقم مُعرف فريد هو: [ ID: ${assignedID} ]`);
    }
}


// =========================================================================
// 3. لوحة التحكم وإدارة المشرفين (إظهار الأزرار والتجربة والتبديل)
// =========================================================================

// تجهيز البيانات الافتراضية وتشغيل الفحوصات فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // فرض فحص وتسجيل هوية الزائر أولاً
    checkAndPromptUserIdentity();

    // بناء الرتب والأقسام الافتراضية إن لم تكن موجودة مسبقاً
    if (!localStorage.getItem('kw_roles')) {
        localStorage.setItem('kw_roles', JSON.stringify(["مدير العام", "مسؤول شكاوى", "دعم فني مستوى 1", "SuperVisor"]));
    }
    if (!localStorage.getItem('kw_employees')) {
        localStorage.setItem('kw_employees', JSON.stringify([{ id: 100, name: "يوسف (المطور المسؤول)", role: "مدير العام" }]));
    }
    if (!localStorage.getItem('kw_chat')) {
        localStorage.setItem('kw_chat', JSON.stringify([]));
    }
    
    // تشغيل دوال العرض لتحديث الواجهات بالبيانات المسجلة
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

// دالة الفحص الأمني للتحقق من هوية المشرف وإظهار زر الإعدادات
function checkAdminAccess() {
    const adminNavBtn = document.getElementById('admin-nav-btn');
    const isOwner = localStorage.getItem('kw_isAdmin') === 'true';
    if (adminNavBtn) {
        adminNavBtn.style.display = isOwner ? 'inline-block' : 'none';
    }
}

// دالة سريعة لك لتفعيل وضع الإدمن من كونسول المتصفح (F12) للتجربة:
// لتفعيل الوضع اكتب في الكونسول: toggleAdminView(true)
function toggleAdminView(status) {
    localStorage.setItem('kw_isAdmin', status);
    checkAdminAccess();
    console.log(status ? "تم تفعيل وضع المسؤول بنجاح! ظهر زر الإعدادات في الهيدر." : "تم العودة لوضع الزبون العادي.");
}


// =========================================================================
// 4. نظام سجل الهويات ودليل حركات الزوار وأعضاء المتجر
// =========================================================================

// دالة التحكم في إظهار وإخفاء سجل الزوار داخل الإعدادات عند الضغط على الزر
function toggleUsersDirectory() {
    const listDiv = document.getElementById('usersDirectoryList');
    if (listDiv) {
        if (listDiv.style.display === 'none' || listDiv.style.display === '') {
            renderUsersDirectory();
            listDiv.style.display = 'block';
        } else {
            listDiv.style.display = 'none';
        }
    }
}

// دالة قراءة وعرض دليل هويات زوار الموقع من الذاكرة إلى القائمة الرسومية
function renderUsersDirectory() {
    const directory = JSON.parse(localStorage.getItem('kw_visitors_directory')) || [];
    const directoryList = document.getElementById('usersDirectoryList');
    
    if (directoryList) {
        directoryList.innerHTML = '';
        if (directory.length === 0) {
            directoryList.innerHTML = '<div class="data-item" style="color:#a3b899; border:none; justify-content:center;">لا يوجد زوار مسجلين في الدليل حالياً.</div>';
        } else {
            directory.forEach(user => {
                const div = document.createElement('div');
                div.className = 'data-item';
                div.innerHTML = `<span>👤 الاسم: ${user.name}</span><span style="color: var(--accent); font-weight:bold;">ID: ${user.id}</span>`;
                directoryList.appendChild(div);
            });
        }
    }
}


// =========================================================================
// 5. نظام تعيين الموظفين والربط الذكي بالاسم أو رقم الـ ID
// =========================================================================

// دالة تعيين الموظف الجديد بدعم البحث الفوري بالـ ID الرقمي أو بالاسم الصريح للزائر
function assignEmployee() {
    const inputField = document.getElementById('empNameInput');
    const roleSelect = document.getElementById('empRoleSelect');
    const searchValue = inputField.value.trim();
    const selectedRole = roleSelect.value;

    if (!searchValue) return alert("من فضلك ادخل اسم الشخص أو رقم الـ ID أولاً للتعيين!");

    const directory = JSON.parse(localStorage.getItem('kw_visitors_directory')) || [];
    let employees = JSON.parse(localStorage.getItem('kw_employees')) || [];

    // البحث المطوّر داخل سجل الهويات الموثقة للتأكد من مطابقة الـ ID أو الاسم
    let foundUser = directory.find(user => 
        user.id.toString() === searchValue || user.name.toLowerCase() === searchValue.toLowerCase()
    );

    let finalName = searchValue;
    let finalID = "خارجي/يدوي";

    if (foundUser) {
        finalName = foundUser.name;
        finalID = foundUser.id;
    }

    // منع تكرار تعيين نفس الشخص بنفس الاسم كموظف مرتين داخل المتجر
    if (employees.some(emp => emp.name.toLowerCase() === finalName.toLowerCase())) {
        return alert("هذا الشخص مسجل كموظف بالفعل في النظام!");
    }

    // تعيين الموظف وحفظ بيانات هويته الكاملة ورتبته المعتمدة
    employees.push({ id: finalID, name: finalName, role: selectedRole });
    localStorage.setItem('kw_employees', JSON.stringify(employees));

    inputField.value = '';
    renderEmployees();
    alert(`تم ربط الهوية وتعيين (${finalName}) بنجاح وتثبيت رتبته كـ: ${selectedRole}`);
}

// دالة عرض وتحديث قائمة الموظفين الحاليين وصلاحياتهم داخل لوحة المشرفين
function renderEmployees() {
    const employees = JSON.parse(localStorage.getItem('kw_employees')) || [];
    const empList = document.getElementById('empList');

    if (empList) {
        empList.innerHTML = '';
        employees.forEach(emp => {
            const div = document.createElement('div');
            div.className = 'data-item';
            div.innerHTML = `<span>💼 ${emp.name} <small style="color:#a3b899;">[ID: ${emp.id}]</small></span><span style="color: var(--primary); font-weight:bold;">${emp.role}</span>`;
            empList.appendChild(div);
        });
    }
}


// =========================================================================
// 6. نظام إدارة رتب العمل وغرف تذاكر الشكاوى الحية (الدعم الفني)
// =========================================================================

// دالة إنشاء وتسمية رتبة مخصصة جديدة من المشرف
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

// دالة تحديث قائمة الرتب وتحديث الـ Select Dropdown الخاص بفرز الموظفين
function renderRoles() {
    const roles = JSON.parse(localStorage.getItem('kw_roles')) || [];
    const rolesList = document.getElementById('rolesList');
    const roleSelect = document.getElementById('empRoleSelect');

    if (rolesList) {
        rolesList.innerHTML = '';
roles.forEach(role => {
const div = document.createElement('div');
div.className = 'data-item';
div.innerHTML = <span>رتبة: ${role}</span><span style="color: var(--accent)">صلاحية الدعم مفعّلة</span>;
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
// دالة إرسال رسالة شكوى أو استفسار من طرف العميل الحالي باسمه المسجل
function sendTicketMessage() {
const input = document.getElementById('chatInput');
const text = input.value.trim();
if (!text) return;
let currentName = localStorage.getItem('kw_current_user_name') || 'زبون';
saveMessage(${currentName}: ${text}, 'client');
input.value = '';
}
// دالة إرسال رد رسمي ومعتمد من طرف الموظف/المشرف المسؤول من شاشة المراقبة
function sendAdminReply() {
const input = document.getElementById('adminChatInput');
const text = input.value.trim();
if (!text) return;
saveMessage(الموظف: ${text}, 'staff');
input.value = '';
}
// دالة إدراج وحفظ الرسائل المتبادلة في ذاكرة الشات المؤقتة
function saveMessage(text, sender) {
let chatLog = JSON.parse(localStorage.getItem('kw_chat')) || [];
chatLog.push({ text, sender, time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) });
localStorage.setItem('kw_chat', JSON.stringify(chatLog));
renderChatBoxes();
}
// دالة تحديث شاشات وصناديق الدردشة والشكاوى بالتزامن للطرفين
function renderChatBoxes() {
const chatLog = JSON.parse(localStorage.getItem('kw_chat')) || [];
const clientBox = document.getElementById('chatBox');
const adminBox = document.getElementById('adminChatBox');
// كود تحديث شاشة العميل داخل مودال الشكاوى
if (clientBox) {
clientBox.innerHTML = '';
chatLog.forEach(msg => {
const div = document.createElement('div');
div.className = msg ${msg.sender};
div.innerText = msg.text;
clientBox.appendChild(div);
});
clientBox.scrollTop = clientBox.scrollHeight;
}
// كود تحديث لوحة تحكم ومراقبة الشكاوى للموظفين والأدمن
if (adminBox) {
adminBox.innerHTML = '';
if (chatLog.length === 0) {
adminBox.innerHTML = 'لا توجد رسائل شكاوى جديدة مسجلة حالياً.';
} else {
chatLog.forEach(msg => {
const div = document.createElement('div');
div.className = 'data-item';
div.innerHTML = <span style="color: ${msg.sender === 'staff' ? 'var(--primary)' : '#fff'}">${msg.text}</span><small style="color:#557755">${msg.time}</small>;
adminBox.appendChild(div);
});
adminBox.scrollTop = adminBox.scrollHeight;
}
}
}
