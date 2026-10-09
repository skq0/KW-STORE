var activeRoom = null;

function get(k, def) {
    var val = localStorage.getItem(k);
    if (!val) return def;
    try { return JSON.parse(val); } catch(e) { return def; }
}

function set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
}

function orderSystem(sys) {
    var f = document.getElementById("clientMsg");
    if (f) {
        f.value = "أنا مهتم بطلب: " + sys + "، وأود التفاصيل.";
        document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
    }
}

function handleForm(e) {
    e.preventDefault();
    alert("شكراً لك. تم إرسال طلبك بنجاح.");
    if(document.getElementById("contactForm")) document.getElementById("contactForm").reset();
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

function loginAsAdmin() {
    var pass = prompt("ادخل الرقم السري للمطور يوسف لفتح الإعدادات:");
    if (pass === "youssef2026" || pass === "youssef2025") {
        localStorage.setItem("kw_isAdmin", "true");
        localStorage.setItem("kw_my_id", "100");
        localStorage.setItem("kw_my_name", "يوسف (المطور المسؤول)");
        
        var emps = get("kw_employees", []);
        var exist = false;
        for (var i = 0; i < emps.length; i++) {
            if (emps[i].id.toString() === "100") { 
                emps[i].name = "يوسف (المطور المسؤول)";
                emps[i].role = "مدير العام";
                exist = true; 
                break; 
            }
        }
        if (!exist) {
            emps.push({ id: "100", name: "يوسف (المطور المسؤول)", role: "مدير العام" });
        }
        set("kw_employees", emps);
        alert("🔓 تم تفعيل وضع المسؤول بنجاح!");
        location.reload();
    } else {
        alert("❌ الرقم السري خاطئ!");
    }
}

document.addEventListener("keydown", function(event) {
    if (event.key === "a" || event.key === "A") {
        var activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
            return;
        }
        loginAsAdmin();
    }
});

document.addEventListener("DOMContentLoaded", function() {
    if (!localStorage.getItem("kw_cleared_v4")) {
        localStorage.clear();
        localStorage.setItem("kw_cleared_v4", "true");
    }
    initIdentity();
    if (!localStorage.getItem("kw_roles_v3")) {
        set("kw_roles_v3", [
            { id: 1, name: "مدير العام", permissions: { viewComplaints: true, reply: true, editPrices: true, manageEmployees: true, viewTickets: true, replyTickets: true, fireAssign: true, editSite: true } },
            { id: 2, name: "مسؤول شكاوى", permissions: { viewComplaints: true, reply: true, editPrices: false, manageEmployees: false, viewTickets: true, replyTickets: true, fireAssign: false, editSite: false } },
            { id: 3, name: "دعم فني مستوى 1", permissions: { viewComplaints: true, reply: false, editPrices: false, manageEmployees: false, viewTickets: true, replyTickets: true, fireAssign: false, editSite: false } }
        ]);
    }
    if (!localStorage.getItem("kw_employees")) { 
        set("kw_employees", [{ id: "100", name: "يوسف (المطور المسؤول)", role: "مدير العام" }]); 
    }
    if (!localStorage.getItem("kw_chat_rooms")) { set("kw_chat_rooms", {}); }
    checkSecurityAccess();
    renderAll();
});

function checkSecurityAccess() {
    var myId = localStorage.getItem("kw_my_id");
    var isOwner = localStorage.getItem("kw_isAdmin") === "true";
    var emps = get("kw_employees", []);
    var roles = get("kw_roles_v3", []);
    
    var emp = emps.find(function(e) { return e.id.toString() === myId.toString(); });
    var userRole = (emp) ? roles.find(function(r) { return r.name === emp.role; }) : null;
    
    if (document.getElementById("headerRoleLeft")) { 
        document.getElementById("headerRoleLeft").innerText = emp ? emp.role : "Client"; 
    }
    
    var adminBtn = document.getElementById("admin-nav-btn");
    var staffBtn = document.getElementById("staff-nav-btn");

    if (adminBtn) { 
        if (isOwner || (userRole && (userRole.permissions.manageEmployees || userRole.permissions.editPrices || userRole.permissions.fireAssign))) {
            adminBtn.style.setProperty('display', 'inline-block', 'important');
        } else {
            adminBtn.style.display = "none"; 
        }
    }
    if (staffBtn) { 
        if (isOwner || (userRole && userRole.permissions.viewTickets && userRole.permissions.replyTickets)) {
            staffBtn.style.setProperty('display', 'inline-block', 'important');
        } else {
            staffBtn.style.display = "none"; 
        }
    }
}

function openModal(id) { 
    if (document.getElementById(id)) document.getElementById(id).style.display = "flex"; 
    if (id === "staffTicketsModal") { if(typeof buildSidebar === "function") buildSidebar(); } 
}

function closeModal(id) { 
    if (document.getElementById(id)) document.getElementById(id).style.display = "none"; 
}

function toggleUsersDirectory() {
    var div = document.getElementById("usersDirectoryList");
    if (div) {
        if (div.style.display === "none" || div.style.display === "") {
            div.style.display = "block"; 
            div.innerHTML = ""; 
            var dir = get("kw_visitors_directory", []);
            for (var i = 0; i < dir.length; i++) { 
                div.innerHTML += '<div class="data-item"><span>👤 ' + dir[i].name + '</span><span style="color:var(--primary)">ID: ' + dir[i].id + '</span></div>'; 
            }
        } else { 
            div.style.display = "none"; 
        }
    }
}

function addNewRole() {
    var name = document.getElementById("roleInput").value.trim(); 
    if (!name) return;
    var r = get("kw_roles_v3", []); 
    r.push({ id: Date.now(), name: name, permissions: { viewComplaints: false, reply: false, editPrices: false, manageEmployees: false, viewTickets: false, replyTickets: false, fireAssign: false, editSite: false } });
    set("kw_roles_v3", r); 
    document.getElementById("roleInput").value = ""; 
    renderAll(); 
    checkSecurityAccess();
}

function renderAll() {
    var rList = document.getElementById("rolesList");
    var sel = document.getElementById("empRoleSelect");
    var eList = document.getElementById("empList");
    
    if (rList) {
        rList.innerHTML = ""; 
        var roles = get("kw_roles_v3", []);
        for (var i = 0; i < roles.length; i++) {
            var role = roles[i];
            var html = '<div class="data-item" style="flex-direction:column; align-items:stretch;"><div style="display:flex; justify-content:space-between;"><span>رتبة: <strong style="color:var(--primary)">' + role.name + '</strong></span><button onclick="delRole(' + role.id + ')" style="background:none; border:1px solid #d9534f; color:#d9534f; cursor:pointer;">❌</button></div><div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:5px; background:#06110b; padding:5px; font-size:11px;">';
            html += '<label><input type="checkbox" ' + (role.permissions.viewComplaints ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ','viewComplaints',this.checked)"> الشكاوى</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.reply ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ','reply',this.checked)"> الرد</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.editPrices ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ','editPrices',this.checked)"> الأسعار</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.viewTickets ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ','viewTickets',this.checked)"> الرؤية</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.replyTickets ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ','replyTickets',this.checked)"> رد التذاكر</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.fireAssign ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ','fireAssign',this.checked)"> التعيين</label>';
            html += '<label><input type="checkbox" ' + (role.permissions.editSite ? 'checked' : '') + ' onchange="togglePerm(' + role.id + ','editSite',this.checked)"> الموقع</label>';
            html += '</div></div>'; 
            rList.innerHTML += html;
        }
    }
    if (sel) { 
        sel.innerHTML = ""; 
        var r = get("kw_roles_v3", []); 
        for (var i = 0; i < r.length; i++) {
            sel.innerHTML += '<option value="' + r[i].name + '">' + r[i].name + '</option>';
        }
    }
    if (eList) {
        eList.innerHTML = ""; 
        var emps = get("kw_employees", []);
        for (var i = 0; i < emps.length; i++) {
            var emp = emps[i];
            eList.innerHTML += '<div class="data-item"><span>👤 ' + emp.name + ' (ID: ' + emp.id + ') - <strong style="color:var(--primary)">' + emp.role + '</strong></span>' +
            (emp.id.toString() !== "100" ? '<button onclick="fireEmployee('' + emp.id + '')" style="background:none; border:1px solid #d9534f; color:#d9534f; cursor:pointer;">طرد ❌</button>' : '') + '</div>';
        }
    }
}

function togglePerm(roleId, permName, isChecked) {
    var roles = get("kw_roles_v3", []);
    var role = roles.find(function(r) { return r.id === roleId; });
    if (role) {
        role.permissions[permName] = isChecked;
        set("kw_roles_v3", roles);
        checkSecurityAccess();
    }
}

function delRole(roleId) {
    if (roleId === 1 || roleId === 2 || roleId === 3) {
        alert("❌ لا يمكن حذف الرتب الأساسية للنظام!");
        return;
    }
    var roles = get("kw_roles_v3", []);
    roles = roles.filter(function(r) { return r.id !== roleId; });
    set("kw_roles_v3", roles);
    renderAll();
}

function assignEmployee() {
    var id = document.getElementById("empIdInput").value.trim();
    var role = document.getElementById("empRoleSelect").value;
    if (!id) return;
    
    var dir = get("kw_visitors_directory", []);
    var user = dir.find(function(u) { return u.id.toString() === id.toString(); });
    if (!user) {
        alert("❌ هذا المعرف (ID) غير مسجل في دليل الزوار!");
        return;
    }
    
    var emps = get("kw_employees", []);
    var exist = emps.find(function(e) { return e.id.toString() === id.toString(); });
    if (exist) {
        exist.role = role;
    } else {
        emps.push({ id: id, name: user.name, role: role });
    }
    set("kw_employees", emps);
    document.getElementById("empIdInput").value = "";
    renderAll();
    checkSecurityAccess();
    alert("💼 تم تعيين/تعديل رتبة الموظف بنجاح!");
}

function fireEmployee(empId) {
    if (empId.toString() === "100") {
        alert("❌ لا يمكن طرد المدير العام المسؤول!");
        return;
    }
    var emps = get("kw_employees", []);
    emps = emps.filter(function(e) { return e.id.toString() !== empId.toString(); });
    set("kw_employees", emps);
    renderAll();
    checkSecurityAccess();
}
