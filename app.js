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

// متغير لتخزين المعرف الخاص بالمحادثة النشطة حالياً في شاشة الموظفين
let activeClientChatID = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAndPromptUserIdentity();

    if (!localStorage.getItem('kw_roles_v2')) {
        const defaultRoles = [
            { id: 1, name: "مدير العام", permissions: { viewComplaints: true, reply: true, editPrices: true, manageEmployees: true } },
            { id: 2, name: "مسؤول شكاوى", permissions: { viewComplaints: true, reply: true, editPrices: false, manageEmployees: false } },
            { id: 3, name: "دعم فني مستوى 1", permissions: { viewComplaints: true, reply: false, editPrices: false, manageEmployees: false } },
            { id: 4, name: "SuperVisor", permissions: { viewComplaints: true, reply: true, editPrices: true, manageEmployees: false } }
        ];
        localStorage.setItem('kw_roles_v2', JSON.stringify(defaultRoles));
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
    if(id === 'staffTicketsModal') {
        renderStaffTicketsList();
    }
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function loginAsAdmin() {
    let password = prompt("ادخل الرقم السري للمطور يوسف لفتح الإعدادات:");
    if (password === "youssef2026") {
        localStorage.setItem('kw_isAdmin', 'true');
        checkAdminAccess();
        alert("🔓 تم تفعيل وضع المسؤول والموظفين بنجاح! ظهرت الأزرار الخاصة بك في الأعلى.");
    } else {
        alert("❌ الرقم السري خاطئ! حاول مجدداً.");
    }
}

function checkAdminAccess() {
    const adminNavBtn = document.getElementById('admin-nav-btn');
    const staffNavBtn = document.getElementById('staff-nav-btn');
    const isOwner = localStorage.getItem('kw_isAdmin') === 'true';
    
    // إظهار زر الإعدادات وزر تذاكر العاملين للموظفين فقط
    if (adminNavBtn) {
        adminNavBtn.style.display = isOwner ? 'inline-block' : 'none';
    }
    if (staffNavBtn) {
        staffNavBtn.style.display = isOwner ? 'inline-block' : 'none';
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

    let roles = JSON.parse(localStorage.getItem('kw_roles_v2')) || [];
    if (roles.some(r => r.name.toLowerCase() === roleName.toLowerCase())) {
        return alert("هذه الرتبة موجودة بالفعل!");
    }

    const newId = roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1;
    
    const newRole = {
        id: newId,
        name: roleName,
        permissions: { viewComplaints: false, reply: false, editPrices: false, manageEmployees: false }
    };

    roles.push(newRole);
    localStorage.setItem('kw_roles_v2', JSON.stringify(roles));
    
    input.value = '';
    renderRoles();
    alert(`تم بنجاح إنشاء رتبة: ${roleName}`);
}

function renderRoles() {
    const roles = JSON.parse(localStorage.getItem('kw_roles_v2')) || [];
    const rolesList = document.getElementById('rolesList');
    const roleSelect = document.getElementById('empRoleSelect');

    if (rolesList) {
        rolesList.innerHTML = '';
        roles.forEach(role => {
            const div = document.createElement('div');
            div.className = 'data-item';
            div.style.display = 'flex';
            div.style.flexDirection = 'column';
            div.style.gap = '8px';
            div.style.padding = '12px 8px';
            div.style.borderBottom = '1px solid #1a3629';

            div.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span>رتبة: <strong style="color: #cda052;">${role.name}</strong></span>
                    <div style="display: flex; gap: 6px;">
                        <button onclick="editRoleName(${role.id})" style="background: none; border: 1px solid #cda052; color: #cda052; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">📝 تعديل الاسم</button>
                        <button onclick="deleteRole(${role.id})" style="background: none; border: 1px solid #ff4d4d; color: #ff4d4d; padding: 2px 8px; border-radius: 4px; cursor: pointer; font-size: 11px;">❌ حذف</button>
                    </div>
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 12px; background: #06110b; padding: 6px; border-radius: 4px; width: 100%;">
                    <label style="font-size: 12px; color: #28a745; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <input type="checkbox" ${role.permissions.viewComplaints ? 'checked' : ''} onchange="togglePermission(${role.id}, 'viewComplaints', this.checked)"> رؤية الشكاوى
                    </label>
                    <label style="font-size: 12px; color: #28a745; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <input type="checkbox" ${role.permissions.reply ? 'checked' : ''} onchange="togglePermission(${role.id}, 'reply', this.checked)"> الرد
                    </label>
                    <label style="font-size: 12px; color: #28a745; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <input type="checkbox" ${role.permissions.editPrices ? 'checked' : ''} onchange="togglePermission(${role.id}, 'editPrices', this.checked)"> تعديل الأسعار
                    </label>
                    <label style="font-size: 12px; color: #28a745; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <input type="checkbox" ${role.permissions.manageEmployees ? 'checked' : ''} onchange="togglePermission(${role.id}, 'manageEmployees', this.checked)"> إدارة الموظفين
                    </label>
                </div>
            `;
            rolesList.appendChild(div);
        });
    }

    if (roleSelect) {
        roleSelect.innerHTML = '';
        roles.forEach(role => {
            const opt = document.createElement('option');
            opt.value = role.name;
            opt.innerText = role.name;
            roleSelect.appendChild(opt);
        });
    }
}

function editRoleName(roleId) {
    let roles = JSON.parse(localStorage.getItem('kw_roles_v2'));
    let role = roles.find(r => r.id === roleId);
    
    if (role) {
        let newName = prompt(`تعديل اسم رتبة (${role.name}) إلى:`, role.name);
        if (newName && newName.trim() !== "") {
            role.name = newName.trim();
            localStorage.setItem('kw_roles_v2', JSON.stringify(roles));
            renderRoles();
        }
    }
}

// دالة حذف الرتبة
function deleteRole(roleId) {
    let roles = JSON.parse(localStorage.getItem('kw_roles_v2'));
    let role = roles.find(r => r.id === roleId);
    
    if (role) {
        if (confirm(`هل أنت متأكد من حذف رتبة (${role.name}) نهائياً؟`)) {
            roles = roles.filter(r => r.id !== roleId);
            localStorage.setItem('kw_roles_v2', JSON.stringify(roles));
            renderRoles();
        }
    }
}

function togglePermission(roleId, permissionKey, isChecked) {
    let roles = JSON.parse(localStorage.getItem('kw_roles_v2'));
    let role = roles.find(r => r.id === roleId);
    
    if (role) {
        role.permissions[permissionKey] = isChecked;
        localStorage.setItem('kw_roles_v2', JSON.stringify(roles));
        console.log(`تم تحديث صلاحية [${permissionKey}] للرتبة [${role.name}] لـ: ${isChecked}`);
    }
}

// ========================================================
// التحديث الجديد والمطور لغرفة تذاكر العاملين المنفصلة
// ========================================================

function sendTicketMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    let currentName = localStorage.getItem('kw_my_name') || 'عميل جديد';
    let currentID = localStorage.getItem('kw_my_id') || '100';

    // العميل يرسل التذكرة وتضاف تلقائياً لرقم الـ ID الخاص به لتباع من تذاكر العاملين
    saveMessage(text, 'client', currentName, currentID, currentID);
    input.value = '';
}

function sendAdminReply() {
    const input = document.getElementById('adminChatInput');
    const text = input.value.trim();
    if (!text || !activeClientChatID) return;

    let currentName = localStorage.getItem('kw_my_name') || 'المطور يوسف';
    let currentID = localStorage.getItem('kw_my_id') || '100';

    // الموظف يرد على تذكرة العميل النشط المحددة
    saveMessage(text, 'staff', currentName, currentID, activeClientChatID);
    input.value = '';
}

function saveMessage(text, sender, name, id, chatRoomID) {
    let chatLog = JSON.parse(localStorage.getItem('kw_chat')) || [];
    chatLog.push({ 
        text: text, 
        sender: sender, 
        name: name, 
        id: id,
        chatRoomID: chatRoomID, // المعرف المخصص للغرفة لفصل المحادثات بالكامل
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) 
    });
    localStorage.setItem('kw_chat', JSON.stringify(chatLog));
    renderChatBoxes();
    renderStaffTicketsList();
}

// توليد قائمة أسماء وتذاكر العاملين بشكل منفصل ومنظم
function renderStaffTicketsList() {
    const listContainer = document.getElementById('staffTicketsList');
    if (!listContainer) return;

    const chatLog = JSON.parse(localStorage.getItem('kw_chat')) || [];
    
    // استخراج فريد لكل العملاء الذين أرسلوا رسائل
    let clientsMap = {};
    chatLog.forEach(msg => {
        if(msg.sender === 'client') {
            clientsMap[msg.chatRoomID] = msg.name;
        }
    });

    listContainer.innerHTML = "";
    const clientIDs = Object.keys(clientsMap);

    if (clientIDs.length === 0) {
        listContainer.innerHTML = '<div style="color:#a3b899; text-align:center; padding:10px;">لا توجد تذاكر أو محادثات نشطة حالياً.</div>';
        return;
    }

    clientIDs.forEach(id => {
        const div = document.createElement('div');
        div.className = 'ticket-item';
        div.innerHTML = `
            <span>👤 تذكرة: <strong>${clientsMap[id]}</strong> (ID: ${id})</span>
            <span style="color:var(--primary); font-size:12px;">اضغط لفتح المحادثة ←</span>
        `;
        div.onclick = () => selectActiveStaffChat(id, clientsMap[id]);
        listContainer.appendChild(div);
    });
}

// دالة تفعيل المحادثة المنفصلة للعميل المختار
function selectActiveStaffChat(id, name) {
    activeClientChatID = id;
    const section = document.getElementById('activeChatSection');
    const title = document.getElementById('activeChatTitle');
    
    if(section && title) {
        title.innerHTML = `💬 محادثة منفصلة مع العميل: <span style="color:#fff;">${name} (ID: ${id})</span>`;
        section.style.display = 'block';
        renderChatBoxes();
    }
}

function renderChatBoxes() {
    const clientBox = document.getElementById('clientChatBox');
    const adminBox = document.getElementById('adminChatBox');
    const chatLog = JSON.parse(localStorage.getItem('kw_chat')) || [];
    let currentClientID = localStorage.getItem('kw_my_id');

    // 1. توليد شاشة تذاكر العميل نفسه (يرى رسائله هو وردود الموظفين الموجهة له)
    if (clientBox) {
        let clientHtml = "";
        chatLog.forEach(msg => {
            if(msg.chatRoomID === currentClientID) {
                const isClient = msg.sender === 'client';
                const badgeColor = isClient ? '#cda052' : '#00ff66';
                const labelType = isClient ? '👤 العميل' : '🛠️ الموظف';
                
                clientHtml += `
                    <div class="msg ${msg.sender}" style="margin-bottom: 8px; width: fit-content; max-width: 85%;">
                        <div style="font-size: 11px; color: ${badgeColor}; font-weight: bold; margin-bottom: 4px; display: flex; gap: 8px;">
                            <span>${labelType}: ${msg.name}</span>
                            <span>(ID: ${msg.id})</span>
                        </div>
                        <div style="word-break: break-word;">${msg.text}</div>
                        <div style="font-size: 10px; color: #888; text-align: left; margin-top: 4px;">${msg.time}</div>
                    </div>
                `;
            }
        });
        clientBox.innerHTML = clientHtml;
        clientBox.scrollTop = clientBox.scrollHeight;
    }

    // 2. توليد شاشة الموظف المنفصلة (تظهر فقط رسائل العميل النشط المحدد حالياً)
    if (adminBox && activeClientChatID) {
        let adminHtml = "";
        chatLog.forEach(msg => {
            if(msg.chatRoomID === activeClientChatID) {
                const isClient = msg.sender === 'client';
                const badgeColor = isClient ? '#cda052' : '#00ff66';
                const labelType = isClient ? '👤 العميل' : '🛠️ الموظف';

                adminHtml += `
                    <div class="msg ${msg.sender}" style="margin-bottom: 8px; width: fit-content; max-width: 85%;">
                        <div style="font-size: 11px; color: ${badgeColor}; font-weight: bold; margin-bottom: 4px; display: flex; gap: 8px;">
                            <span>${labelType}: ${msg.name}</span>
                            <span>(ID: ${msg.id})</span>
                        </div>
                        <div style="word-break: break-word;">${msg.text}</div>
                        <div style="font-size: 10px; color: #888; text-align: left; margin-top: 4px;">${msg.time}</div>
                    </div>
                `;
            }
        });
        adminBox.innerHTML = adminHtml;
        adminBox.scrollTop = adminBox.scrollHeight;
    }
}
