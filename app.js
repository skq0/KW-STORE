let activeRoom = null;
const get = (k, def) => JSON.parse(localStorage.getItem(k)) || def;
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function orderSystem(sys) {
    if (document.getElementById('clientMsg')) {
        document.getElementById('clientMsg').value = `أنا مهتم بطلب: ${sys}، وأود تفاصيل النسخة التجريبية.`;
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    }
}

function handleForm(e) {
    e.preventDefault();
    alert(`شكراً لك. تم إرسال طلبك بنجاح وسنتواصل معك قريباً.`);
    document.getElementById('contactForm').reset();
}

function initIdentity() {
    let dir = get('kw_visitors_directory', []);
    let name = localStorage.getItem('kw_my_name'), id = localStorage.getItem('kw_my_id');
    if (!name || !id) {
        while (!name || !name.trim()) name = prompt("مرحباً بك! اكتب اسمك الكريم لتفعيل حسابك:");
        id = (100 + dir.length).toString();
        localStorage.setItem('kw_my_name', name.trim());
        localStorage.setItem('kw_my_id', id);
        dir.push({ id, name: name.trim() });
        set('kw_visitors_directory', dir);
    }
    if(document.getElementById('headerIdentityRight')) document.getElementById('headerIdentityRight').innerText = `👤 المعرف: ${id} | الاسم: ${name}`;
}

document.addEventListener('DOMContentLoaded', () => {
    initIdentity();
    if (!localStorage.getItem('kw_roles_v3')) {
        set('kw_roles_v3', [
            { id: 1, name: "مدير العام", permissions: { viewComplaints: true, reply: true, editPrices: true, manageEmployees: true, viewTickets: true, replyTickets: true, fireAssign: true, editSite: true } },
            { id: 2, name: "مسؤول شكاوى", permissions: { viewComplaints: true, reply: true, editPrices: false, manageEmployees: false, viewTickets: true, replyTickets: true, fireAssign: false, editSite: false } },
            { id: 3, name: "دعم فني مستوى 1", permissions: { viewComplaints: true, reply: false, editPrices: false, manageEmployees: false, viewTickets: true, replyTickets: true, fireAssign: false, editSite: false } }
        ]);
    }
    if (!localStorage.getItem('kw_employees')) set('kw_employees', [{ id: "100", name: "يوسف", role: "مدير العام" }]);
    if (!localStorage.getItem('kw_chat_rooms')) set('kw_chat_rooms', {});
    
    const emp = get('kw_employees', []).find(e => e.id.toString() === localStorage.getItem('kw_my_id'));
    if (document.getElementById('headerRoleLeft')) document.getElementById('headerRoleLeft').innerText = emp ? emp.role : "Client";
    
    if (document.getElementById('admin-nav-btn')) document.getElementById('admin-nav-btn').style.display = localStorage.getItem('kw_isAdmin') === 'true' ? 'inline-block' : 'none';
    if (document.getElementById('staff-nav-btn')) document.getElementById('staff-nav-btn').style.display = (localStorage.getItem('kw_isAdmin') === 'true' || emp) ? 'inline-block' : 'none';

    renderAll();
});

function openModal(id) { 
    if(document.getElementById(id)) document.getElementById(id).style.display = 'flex'; 
    if(id === 'staffTicketsModal') buildSidebar(); 
}
function closeModal(id) { if(document.getElementById(id)) document.getElementById(id).style.display = 'none'; }

function loginAsAdmin() {
    if (prompt("ادخل الرقم السري للمطور يوسف لفتح الإعدادات:") === "youssef2026") {
        localStorage.setItem('kw_isAdmin', 'true');
        alert("🔓 تم تفعيل وضع المسؤول بنجاح!");
        location.reload();
    } else alert("❌ الرقم السري خاطئ!");
}

function toggleUsersDirectory() {
    let div = document.getElementById('usersDirectoryList');
    if (div) {
        div.style.display = div.style.display === 'none' ? 'block' : 'none';
        if (div.style.display === 'block') {
            div.innerHTML = '';
            get('kw_visitors_directory', []).forEach(u => div.innerHTML += `<div class="data-item"><span>👤 ${u.name}</span><span style="color:var(--primary)">ID: ${u.id}</span></div>`);
        }
    }
}

function addNewRole() {
    let name = document.getElementById('roleInput').value.trim();
    if (!name) return;
    let r = get('kw_roles_v3', []);
    r.push({ id: Date.now(), name, permissions: { viewComplaints: false, reply: false, editPrices: false, manageEmployees: false, viewTickets: false, replyTickets: false, fireAssign: false, editSite: false } });
    set('kw_roles_v3', r);
    document.getElementById('roleInput').value = '';
    renderAll();
}

function renderAll() {
    let rList = document.getElementById('rolesList'), sel = document.getElementById('empRoleSelect'), eList = document.getElementById('empList');
    if (rList) {
        rList.innerHTML = '';
        get('kw_roles_v3', []).forEach(r => {
            rList.innerHTML += `<div class="data-item" style="flex-direction:column; align-items:stretch;">
                <div style="display:flex; justify-content:space-between;">
                    <span>رتبة: <strong style="color:var(--primary)">${r.name}</strong></span>
                    <button onclick="delRole(${r.id})" style="background:none; border:1px solid #d9534f; color:#d9534f; cursor:pointer;">❌</button>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:5px; background:#06110b; padding:5px; font-size:11px;">
                    ${Object.keys(r.permissions).map(k => `<label><input type="checkbox" \({r.permissions[k]?'checked':''} onchange="togglePerm(\){r.id},'k',this.checked)"> {k}</label>`).join('')}
                </div>
            </div>`;
        });
    }
    if (sel) { sel.innerHTML = ''; get('kw_roles_v3', []).forEach(r => sel.innerHTML += `<option value="${r.name}">${r.name}</option>`); }
    if (eList) {
        eList.innerHTML = '';
        get('kw_employees', []).forEach(e => eList.innerHTML += `<div class="data-item"><span><strong>${e.name}</strong> [ID: ${e.id}] -> ${e.role}</span><button onclick="fireEmp('${e.id}')" style="background:none; border:1px solid #d9534f; color:#d9534f; cursor:pointer;">❌ فصل</button></div>`);
    }
    renderChats();
}

function delRole(id) { set('kw_roles_v3', get('kw_roles_v3', []).filter(x => x.id !== id)); renderAll(); }
function togglePerm(id, k, v) { let r = get('kw_roles_v3', []); let x = r.find(i=>i.id===id); if(x) x.permissions[k]=v; set('kw_roles_v3', r); }

function assignEmployee() {
    let val = document.getElementById('empNameInput').value.trim(), role = document.getElementById('empRoleSelect').value;
    if(!val) return;
    let u = get('kw_visitors_directory', []).find(x => x.id.toString() === val || x.name.toLowerCase() === val.toLowerCase());
    let emps = get('kw_employees', []);
    if(emps.some(e => e.name.toLowerCase() === (u?u.name:val).toLowerCase())) return alert("مسجل بالفعل!");
    emps.push({ id: u?u.id:Math.floor(1000+Math.random()*9000), name: u?u.name:val, role });
    set('kw_employees', emps);
    document.getElementById('empNameInput').value = '';
    renderAll();
}
function fireEmp(id) { if(confirm("فصل الموظف؟")) { set('kw_employees', get('kw_employees', []).filter(e=>e.id.toString()!==id.toString())); renderAll(); } }

function sendMsg(src) {
    let input = document.getElementById(src === 'client' ? 'chatInput' : 'adminChatInput');
    let text = input.value.trim(), myId = localStorage.getItem('kw_my_id'), myName = localStorage.getItem('kw_my_name');
    if (!text || (src === 'admin' && !activeRoom)) return;
    let target = src === 'client' ? myId : activeRoom;
    let rms = get('kw_chat_rooms', {});
    if (!rms[target]) rms[target] = { name: src === 'client' ? myName : 'Client', messages: [] };
    rms[target].messages.push({ text, sender: src === 'client'?'client':'staff', name: myName, id: myId, time: new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'}) });
    set('kw_chat_rooms', rms);
    input.value = '';
    renderChats();
}
function sendTicketMessage() { sendMsg('client'); }
function sendAdminReply() { sendMsg('admin'); }

function buildSidebar() {
    let sb = document.getElementById('roomsSidebar'), rms = get('kw_chat_rooms', {});
    if(sb) {
        sb.innerHTML = '';
        Object.keys(rms).forEach(id => {
            sb.innerHTML += `<button class="room-tab ${activeRoom===id?'active':''}" onclick="activeRoom='${id}'; buildSidebar(); renderChats();">👤 ${rms[id].name} [${id}]</button>`;
        });
    }
}

function renderChats() {
    let rms = get('kw_chat_rooms', {}), myId = localStorage.getItem('kw_my_id');
    let bHtml = m => `<div class="msg ${m.sender}" style="margin-bottom:5px; padding:8px; border-radius:5px; background:${m.sender==='client'?'#223a2a':'#cd9b32'}; color:${m.sender==='client'?'#fff':'#000'}; align-self:${m.sender==='client'?'flex-start':'flex-end'}"><div style="font-size:10px; font-weight:bold;">${m.name} (${m.id})</div><div>${m.text}</div></div>`;
    
    let cBox = document.getElementById('clientChatBox');
    if (cBox && rms[myId]) { cBox.innerHTML = rms[myId].messages.map(bHtml).join(''); cBox.scrollTop = cBox.scrollHeight; }
    
    let aBox = document.getElementById('adminChatBox');
    if (aBox) {
        if (activeRoom && rms[activeRoom]) { aBox.innerHTML = rms[activeRoom].messages.map(bHtml).join(''); aBox.scrollTop = aBox.scrollHeight; }
        else aBox.innerHTML = '<p style="color:#888; text-align:center;">اختر تذكرة لبدء الرد</p>';
    }
}
