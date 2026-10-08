function loginAsAdmin() {
    var pass = prompt("ادخل الرقم السري للمطور يوسف لفتح الإعدادات:");
    if (pass === "youssef2026") {
        localStorage.setItem("kw_isAdmin", "true");
        localStorage.setItem("kw_my_id", "100");
        localStorage.setItem("kw_my_name", "يوسف (المطور المسؤول)");
        
        var emps = localStorage.getItem("kw_employees") ? JSON.parse(localStorage.getItem("kw_employees")) : [];
        var exist = false;
        for (var i = 0; i < emps.length; i++) {
            if (emps[i].id.toString() === "100") { exist = true; break; }
        }
        if (!exist) {
            emps.push({ id: "100", name: "يوسف (المطور المسؤول)", role: "مدير العام" });
            localStorage.setItem("kw_employees", JSON.stringify(emps));
        }
        
        alert("🔓 تم تفعيل وضع المسؤول وترقيتك لمدير عام بنجاح!");
        location.reload();
    } else {
        alert("❌ الرقم السري خاطئ!");
    }
}
var activeRoom = null;

function get(k, def) {
    var val = localStorage.getItem(k);
    if (!val) return def;
    return JSON.parse(val);
}

function set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
}

function orderSystem(sys) {
    var f = document.getElementById("clientMsg");
    if (f) {
        f.value = "أنا مهتم بطلب: " + sys + "، وأود تفاصيل النسخة التجريبية.";
        document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
    }
}

function handleForm(e) {
    e.preventDefault();
    alert("شكراً لك. تم إرسال طلبك بنجاح وسنتواصل معك قريباً.");
    document.getElementById("contactForm").reset();
}
function initIdentity() {
    var dir = get("kw_visitors_directory", []);
    var name = localStorage.getItem("kw_my_name");
    var id = localStorage.getItem("kw_my_id");
    if (!name || !id) {
        while (!name || !name.trim()) {
            name = prompt("مرحباً بك! اكتب اسمك الكريم لتفعيل حسابك:");
        }
        id = (100 + dir.length).toString();
        localStorage.setItem("kw_my_name", name.trim());
        localStorage.setItem("kw_my_id", id);
        dir.push({ id: id, name: name.trim() });
        set("kw_visitors_directory", dir);
    }
    var info = document.getElementById("headerIdentityRight");
    if (info) {
        info.innerText = "👤 المعرف: " + id + " | الاسم: " + name;
    }
}

document.addEventListener("DOMContentLoaded", function() {
    initIdentity();
    if (!localStorage.getItem("kw_roles_v3")) {
        set("kw_roles_v3", [
            { id: 1, name: "مدير العام", permissions: { viewComplaints: true, reply: true, editPrices: true, manageEmployees: true, viewTickets: true, replyTickets: true, fireAssign: true, editSite: true } },
            { id: 2, name: "مسؤول شكاوى", permissions: { viewComplaints: true, reply: true, editPrices: false, manageEmployees: false, viewTickets: true, replyTickets: true, fireAssign: false, editSite: false } },
            { id: 3, name: "دعم فني مستوى 1", permissions: { viewComplaints: true, reply: false, editPrices: false, manageEmployees: false, viewTickets: true, replyTickets: true, fireAssign: false, editSite: false } }
        ]);
    }
    if (!localStorage.getItem("kw_employees")) {
        set("kw_employees", [{ id: "100", name: "يوسف", role: "مدير العام" }]);
    }
    if (!localStorage.getItem("kw_chat_rooms")) {
        set("kw_chat_rooms", {});
    }
    checkSecurityAccess();
    renderAll();
});
function checkSecurityAccess() {
    var myId = localStorage.getItem("kw_my_id");
    var isOwner = localStorage.getItem("kw_isAdmin") === "true";
    var emps = get("kw_employees", []);
    var roles = get("kw_roles_v3", []);
    var emp = emps.find(function(e) { return e.id.toString() === myId.toString(); });
    var userRole = null;
    if (emp) { userRole = roles.find(function(r) { return r.name === emp.role; }); }
    var badge = document.getElementById("headerRoleLeft");
    if (badge) { badge.innerText = emp ? emp.role : "Client"; }
    var adminBtn = document.getElementById("admin-nav-btn");
    var staffBtn = document.getElementById("staff-nav-btn");
    if (adminBtn) {
        if (isOwner || (userRole && (userRole.permissions.manageEmployees || userRole.permissions.editPrices || userRole.permissions.fireAssign))) {
            adminBtn.style.display = "inline-block";
        } else { adminBtn.style.display = "none"; }
    }
    if (staffBtn) {
        if (isOwner || (userRole && userRole.permissions.viewTickets && userRole.permissions.replyTickets)) {
            staffBtn.style.display = "inline-block";
        } else { staffBtn.style.display = "none"; }
    }
}

function openModal(id) { 
    if (document.getElementById(id)) { document.getElementById(id).style.display = "flex"; }
    if (id === "staffTicketsModal") { buildSidebar(); }
}
function closeModal(id) { if (document.getElementById(id)) { document.getElementById(id).style.display = "none"; } }
function loginAsAdmin() {
    var pass = prompt("ادخل الرقم السري للمطور يوسف لفتح الإعدادات:");
    if (pass === "123456") {
        localStorage.setItem("kw_isAdmin", "true");
        alert("🔓 تم تفعيل وضع المسؤول بنجاح!");
        location.reload();
    } else { alert("❌ الرقم السري خاطئ!"); }
}
function toggleUsersDirectory() {
    var div = document.getElementById("usersDirectoryList");
    if (div) {
        if (div.style.display === "none") {
            div.style.display = "block"; div.innerHTML = "";
            var dir = get("kw_visitors_directory", []);
            for (var i = 0; i < dir.length; i++) {
                div.innerHTML += '<div class="data-item"><span>👤 ' + dir[i].name + '</span><span style="color:var(--primary)">ID: ' + dir[i].id + '</span></div>';
            }
        } else { div.style.display = "none"; }
    }
}
function addNewRole() {
    var name = document.getElementById("roleInput").value.trim();
    if (!name) return;
    var r = get("kw_roles_v3", []);
    r.push({ id: Date.now(), name: name, permissions: { viewComplaints: false, reply: false, editPrices: false, manageEmployees: false, viewTickets: false, replyTickets: false, fireAssign: false, editSite: false } });
    set("kw_roles_v3", r); document.getElementById("roleInput").value = ""; renderAll(); checkSecurityAccess();
}
function renderAll() {
    var rList = document.getElementById("rolesList"), sel = document.getElementById("empRoleSelect"), eList = document.getElementById("empList");
    if (rList) {
        rList.innerHTML = ""; var roles = get("kw_roles_v3", []);
        for (var i = 0; i < roles.length; i++) {
            var role = roles[i];
            var html = '<div class="data-item" style="flex-direction:column; align-items:stretch;"><div style="display:flex; justify-content:space-between;"><span>رتبة: <strong style="color:var(--primary)">' + role.name + '</strong></span><button onclick="delRole(' + role.id + ')" style="background:none; border:1px solid #d9534f; color:#d9534f; cursor:pointer;">❌</button></div><div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:5px; background:#06110b; padding:5px; font-size:11px;">';
            html += '<label><input type="checkbox" ' + (role.permissions.viewComplaints ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ',\'viewComplaints\',this.checked)"> الشكاوى</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.reply ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ',\'reply\',this.checked)"> الرد</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.editPrices ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ',\'editPrices\',this.checked)"> الأسعار</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.viewTickets ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ',\'viewTickets\',this.checked)"> رؤية التذاكر</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.replyTickets ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ',\'replyTickets\',this.checked)"> رد التذاكر</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.fireAssign ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ',\'fireAssign\',this.checked)"> التعيين</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.editSite ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ',\'editSite\',this.checked)"> الموقع</label>';
            html += '</div></div>'; rList.innerHTML += html;
        }
    }
    if (sel) { sel.innerHTML = ""; var roles = get("kw_roles_v3", []); for (var i = 0; i < roles.length; i++) { sel.innerHTML += '<option value="' + roles[i].name + '">' + roles[i].name + '</option>'; } }
    if (eList) { eList.innerHTML = ""; var emps = get("kw_employees", []); for (var i = 0; i < emps.length; i++) { eList.innerHTML += '<div class="data-item"><span><strong>' + emps[i].name + '</strong> [ID: ' + emps[i].id + '] -> ' + emps[i].role + '</span><button onclick="fireEmp(\'' + emps[i].id + '\')" style="background:none; border:1px solid #d9534f; color:#d9534f; cursor:pointer;">❌</button></div>'; } }
    renderChats();
}
function delRole(id) { var filtered = get("kw_roles_v3", []).filter(function(x) { return x.id !== id; }); set("kw_roles_v3", filtered); renderAll(); checkSecurityAccess(); }
function togglePerm(id, k, v) { var r = get("kw_roles_v3", []); var x = r.find(function(i) { return i.id === id; }); if (x) { x.permissions[k] = v; } set("kw_roles_v3", r); checkSecurityAccess(); }
function assignEmployee() {
    var val = document.getElementById("empNameInput").value.trim(); var role = document.getElementById("empRoleSelect").value; if (!val) return;
    var dir = get("kw_visitors_directory", []); var u = dir.find(function(x) { return x.id.toString() === val || x.name.toLowerCase() === val.toLowerCase(); });
    var fName = u ? u.name : val; var fId = u ? u.id : Math.floor(1000 + Math.random() * 9000).toString();
    var emps = get("kw_employees", []); var exist = emps.some(function(e) { return e.name.toLowerCase() === fName.toLowerCase(); }); if (exist) return alert("مسجل بالفعل!");
    emps.push({ id: fId, name: fName, role: role }); set("kw_employees", emps); document.getElementById("empNameInput").value = ""; renderAll(); checkSecurityAccess();
}
function fireEmp(id) { if (confirm("فصل الموظف؟")) { var filtered = get("kw_employees", []).filter(function(e) { return e.id.toString() !== id.toString(); }); set("kw_employees", filtered); renderAll(); checkSecurityAccess(); } }
function sendMsg(src) {
    var input = document.getElementById(src === "client" ? "chatInput" : "adminChatInput"); var text = input.value.trim(); var myId = localStorage.getItem("kw_my_id"); var myName = localStorage.getItem("kw_my_name");
    if (!text) return; if (src === "admin" && !activeRoom) return;
    var target = src === "client" ? myId : activeRoom; var rms = get("kw_chat_rooms", {});
    if (!rms[target]) { rms[target] = { name: src === "client" ? myName : "Client", messages: [] }; }
    var senderType = src === "client" ? "client" : "staff"; var timeStr = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    rms[target].messages.push({ text: text, sender: senderType, name: myName, id: myId, time: timeStr }); set("kw_chat_rooms", rms); input.value = ""; renderChats();
}
function sendTicketMessage() { sendMsg("client"); }
function sendAdminReply() { sendMsg("admin"); }
function buildSidebar() {
    var sb = document.getElementById("roomsSidebar"); var rms = get("kw_chat_rooms", {});
    if (sb) { sb.innerHTML = ""; var keys = Object.keys(rms); for (var i = 0; i < keys.length; i++) { var id = keys[i]; var activeClass = activeRoom === id ? "active" : ""; sb.innerHTML += '<button class="room-tab ' + activeClass + '" onclick="activeRoom=\'' + id + '\'; buildSidebar(); renderChats();">👤 ' + rms[id].name + ' [' + id + ']</button>'; } }
}
function renderChats() {
    var rms = get("kw_chat_rooms", {}); var myId = localStorage.getItem("kw_my_id");
    var cBox = document.getElementById("clientChatBox");
    if (cBox && rms[myId]) { 
        var html = ""; for (var i = 0; i < rms[myId].messages.length; i++) { var m = rms[myId].messages[i]; var isClient = m.sender === "client"; var bg = isClient ? "#223a2a" : "#cd9b32"; var col = isClient ? "#fff" : "#000"; var side = isClient ? "flex-start" : "flex-end"; var tagColor = isClient ? "#cd9b32" : "#00ff66"; html += '<div class="msg ' + m.sender + '" style="margin-bottom:5px; padding:8px; border-radius:5px; background:' + bg + '; color:' + col + '; align-self:' + side + '"><div style="font-size:10px; font-weight:bold; color:' + tagColor + '">' + m.name + ' (' + m.id + ')</div><div>' + m.text + '</div></div>'; }
        cBox.innerHTML = html; cBox.scrollTop = cBox.scrollHeight; 
    }
    var aBox = document.getElementById("adminChatBox");
    if (aBox) {
        if (activeRoom && rms[activeRoom]) { 
            var html = ""; for (var i = 0; i < rms[activeRoom].messages.length; i++) { var m = rms[activeRoom].messages[i]; var isClient = m.sender === "client"; var bg = isClient ? "#223a2a" : "#cd9b32"; var col = isClient ? "#fff" : "#000"; var side = isClient ? "flex-start" : "flex-end"; var tagColor = isClient ? "#cd9b32" : "#00ff66"; html += '<div class="msg ' + m.sender + '" style="margin-bottom:5px; padding:8px; border-radius:5px; background:' + bg + '; color:' + col + '; align-self:' + side + '"><div style="font-size:10px; font-weight:bold; color:' + tagColor + '">' + m.name + ' (' + m.id + ')</div><div>' + m.text + '</div></div>'; }
            aBox.innerHTML = html; aBox.scrollTop = aBox.scrollHeight; 
        } else { aBox.innerHTML = '<p style="color:#888; text-align:center;">اختر تذكرة لبدء الرد</p>'; }
    }
}
