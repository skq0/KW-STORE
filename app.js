function orderSystem(systemName) {
    const msgField = document.getElementById('clientMsg');
    if (msgField) {
        msgField.value = `أنا مهتم بطلب: ${systemName}، وأود الحصول على تفاصيل السعر والنسخة التجريبية.`;
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }
}

function handleForm(event) {
    event.preventDefault();
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const msg = document.getElementById('clientMsg').value;

    console.log("طلب جديد:", { name, phone, msg });
    alert(`شكراً لك يا ${name}. تم إرسال طلبك بنجاح للمطور يوسف وسنتواصل معك قريباً.`);
    document.getElementById('contactForm').reset();
}

function checkAndPromptUserIdentity() {
    let directory = JSON.parse(localStorage.getItem('kw_visitors_directory')) || [];
    let savedName = localStorage.getItem('kw_my_name');
    let savedID = localStorage.getItem('kw_my_id');

    if (!savedName || !savedID) {
        let enteredName = "";
        while (!enteredName || enteredName.trim() === "") {
            enteredName = prompt("مرحباً بك في KW STORE!\nمن فضلك اكتب اسمك الكريم لتصفح المنصة وتفعيل حسابك:");
        }
        enteredName = enteredName.trim();
        
        let assignedID = 100 + directory.length;

        localStorage.setItem('kw_my_name', enteredName);
        localStorage.setItem('kw_my_id', assignedID.toString());

        directory.push({ id: assignedID, name: enteredName });
        localStorage.setItem('kw_visitors_directory', JSON.stringify(directory));

        alert(`تم تسجيل هويتك بنجاح!\nالاسم: ${enteredName}\nرقم الـ ID الثابت لك: ${assignedID}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAndPromptUserIdentity();

    if (!localStorage.getItem('kw_roles')) {
        localStorage.setItem('kw_roles', JSON.stringify(["مدير العام", "مسؤول شكاوى", "دعم فني مستوى 1", "SuperVisor"]));
    }
    if (!localStorage.getItem('kw_employees')) {
        localStorage.setItem('kw_employees', JSON.stringify([{ id: 100, name: "يوسف (المطور المسؤول)", role: "مدير العام" }]));
    }
    if (!localStorage.getItem('kw_chat')) {
        localStorage.setItem('kw_chat', JSON.stringify([]));
    }
    
    renderRoles();
    renderEmployees();
    renderChatBoxes();
    checkAdminAccess();
});

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// دالة طلب الباسورد السري لفتح وضع المسؤول (الأدمن)
function loginAsAdmin() {
    let password = prompt("ادخل الرقم السري للمطور يوسف لفتح الإعدادات:");
    if (password === "youssef2026") {
        localStorage.setItem('kw_isAdmin', 'true');
        checkAdminAccess();
        alert("🔓 تم تفعيل وضع المسؤول بنجاح! ظهر زر الإعدادات في الهيدر فوق.");
    } else {
        alert("❌ الرقم السري خاطئ! حاول مجدداً.");
    }
}

function checkAdminAccess() {
    const adminNavBtn = document.getElementById('admin-nav-btn');
    const isOwner = localStorage.getItem('kw_isAdmin') === 'true';
    if (adminNavBtn) {
        adminNavBtn.style.display = isOwner ? 'inline-block' : 'none';
    }
}

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

function renderUsersDirectory() {
    const directory = JSON.parse(localStorage.getItem('kw_visitors_directory')) || [];
    const directoryList = document.getElementById('usersDirectoryList');
    
    if (directoryList) {
        directoryList.innerHTML = '';
        if (directory.length === 0) {
            directoryList.innerHTML = '<div class="data-item" style="color:#a3b899; border:none;">لا يوجد زوار مسجلين حالياً.</div>';
        } else {
            directory.forEach(user => {
                const div = document.createElement('div');
                div.className = 'data-item';
                div.innerHTML = `<span>👤 الاسم: ${user.name}</span><span style="color: var(--primary)">ID: ${user.id}</span>`;
                directoryList.appendChild(div);
            });
        }
    }
}

function assignEmployee() {
    const inputField = document.getElementById('empNameInput');
    const roleSelect = document.getElementById('empRoleSelect');
    const searchValue = inputField.value.trim();
    const selectedRole = roleSelect.value;

    if (!searchValue) return alert("من فضلك ادخل اسم الشخص أو رقم الـ ID أولاً للتعيين!");

    const directory = JSON.parse(localStorage.getItem('kw_visitors_directory')) || [];
    let employees = JSON.parse(localStorage.getItem('kw_employees')) || [];

    let foundUser = directory.find(user => 
        user.id.toString() === searchValue || user.name.toLowerCase() === searchValue.toLowerCase()
    );

    let finalName = searchValue;
    let finalID = "يدوي";

    if (foundUser) {
        finalName = foundUser.name;
        finalID = foundUser.id;
    }

    if (employees.some(emp => emp.name.toLowerCase() === finalName.toLowerCase())) {
        return alert("هذا الشخص مسجل كموظف بالفعل!");
    }

    employees.push({ id: finalID, name: finalName, role: selectedRole });
    localStorage.setItem('kw_employees', JSON.stringify(employees));

    inputField.value = '';
    renderEmployees();
    alert(`تم تعيين (${finalName}) بنجاح كـ: ${selectedRole}`);
}

function renderEmployees() {
    const employees = JSON.parse(localStorage.getItem('kw_employees')) || [];
    const empList = document.getElementById('empList');

    if (empList) {
        empList.innerHTML = '';
        employees.forEach(emp => {
            const div = document.createElement('div');
            div.className = 'data-item';
            div.innerHTML = `<span>${emp.name} [ID: ${emp.id}]</span><span style="color: var(--primary)">${emp.role}</span>`;
            empList.appendChild(div);
        });
    }
}

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
    alert(`تم بنجاح إنشاء رتبة: ${roleName}`);
}

function renderRoles() {
    const roles = JSON.parse(localStorage.getItem('kw_roles')) || [];
    const rolesList = document.getElementById('rolesList');
    const roleSelect = document.getElementById('empRoleSelect');

    if (rolesList) {
        rolesList.innerHTML = '';
        roles.forEach(role => {
            const div = document.createElement('div');
            div.className = 'data-item';
            div.innerHTML = `<span>رتبة: ${role}</span><span style="color: var(--accent)">صلاحية مفعّلة</span>`;
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

function sendTicketMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    let currentName = localStorage.getItem('kw_my_name') || 'زبون';
    saveMessage(`${currentName}: ${text}`, 'client');
    input.value = '';
}

function sendAdminReply() {
    const input = document.getElementById('adminChatInput');
    const text = input.value.trim();
    if (!text) return;

    saveMessage(`الموظف: ${text}`, 'staff');
    input.value = '';
}

function saveMessage(text, sender) {
    let chatLog = JSON.parse(localStorage.getItem('kw_chat')) || [];
    chatLog.push({ text, sender, time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) });
    localStorage.setItem('kw_chat', JSON.stringify(chatLog));
    renderChatBoxes();
}

function renderChatBoxes() {
    const chatLog = JSON.parse(localStorage.getItem('kw_chat')) || [];
    const clientBox = document.getElementById('chatBox');
    const adminBox = document.getElementById('adminChatBox');

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

    if (adminBox) {
        adminBox.innerHTML = '';
        if (chatLog.length === 0) {
            adminBox.innerHTML = '<div class="data-item" style="color:#a3b899; border:none;">لا توجد شكاوى حالياً.</div>';
        } else {
            chatLog.forEach(msg => {
                const div = document.createElement('div');
                div.className = 'data-item';
                div.innerHTML = `<span>${msg.text}</span><small style="color:#557755">${msg.time}</small>`;
                adminBox.appendChild(div);
            });
            adminBox.scrollTop = adminBox.scrollHeight;
        }
    }
}
