// app.js - الجزء الأول: إدارة واسترجاع البيانات المخزنة من LocalStorage
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
        f.value = "Order: " + sys; 
        document.getElementById("contact").scrollIntoView({ behavior: "smooth" }); 
    } 
}
// app.js - الجزء الثاني: فحص الحقول المطلوبة وتغيير لون الحواف عند وجود حقول فارغة
function validateFormInputs(formId) {
    var form = document.getElementById(formId);
    if (!form) return true;
    var inputs = form.querySelectorAll("input[required], textarea[required]");
    var isValid = true;
    inputs.forEach(function(input) {
        if (!input.value.trim()) {
            input.style.borderColor = "#d9534f"; 
            isValid = false;
        } else {
            input.style.borderColor = "var(--border-color)";
        }
    });
    return isValid;
}

function handleForm(e) { 
    e.preventDefault(); 
    if (!validateFormInputs("contactForm")) {
        alert("يرجى ملء جميع الحقول المطلوبة باللون الأحمر");
        return;
    }
    alert("Success"); 
    if(document.getElementById("contactForm")) document.getElementById("contactForm").reset(); 
}
// app.js - الجزء الثالث: معالجة إرسال الشكاوى وبناء نظام المعرفات العشوائية الآمنة (100-1000) وعرضها بالأعلى
function submitComplaint(e) { 
    e.preventDefault(); 
    if (!validateFormInputs("complaintForm")) {
        alert("يرجى كتابة الاسم وتفاصيل الشكوى أولاً");
        return;
    }
    var cName = document.getElementById("compName").value.trim(); 
    var cMsg = document.getElementById("compMsg").value.trim(); 
    
    var complaints = get("kw_complaints_v1", []); 
    complaints.push({ 
        id: "comp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5), 
        senderId: localStorage.getItem("kw_my_id") || "Unknown", 
        senderName: cName, 
        message: cMsg, 
        date: new Date().toLocaleString("ar-EG"), 
        reply: null 
    }); 
    set("kw_complaints_v1", complaints); 
    alert("Done"); 
    document.getElementById("complaintForm").reset(); 
    renderAll(); 
}

function initIdentity() { 
    var dir = get("kw_visitors_directory", []); 
    var name = localStorage.getItem("kw_my_name"); 
    var id = localStorage.getItem("kw_my_id"); 
    
    if (!name || !id) { 
        while (!name || !name.trim()) { 
            name = prompt("أدخل اسمك الكريم للبدء:"); 
        } 
        id = Math.floor(Math.random() * (1000 - 100 + 1) + 100).toString();
        
        localStorage.setItem("kw_my_name", name.trim()); 
        localStorage.setItem("kw_my_id", id); 
        localStorage.setItem("kw_isAdmin", "false"); 
        
        dir.push({ id: id, name: name.trim() }); 
        set("kw_visitors_directory", dir); 
    } 
    
    var info = document.getElementById("headerIdentityRight"); 
    if (info) { 
        info.innerHTML = "👤 المعرف: " + id + " | الاسم: " + name; 
    } 
}
// app.js - الجزء الرابع: فتح نافذة المودال وبناء سهم خيارات الرتب بشكل ديناميكي آمن
function openLoginModal() {
    var modal = document.getElementById("staffLoginModal");
    if (!modal) return;
    var select = document.getElementById("loginRoleSelect");
    if (select) {
        select.innerHTML = '<option value="مدير العام">مدير العام (المالك الأصلي)</option>';
        var roles = get("kw_roles_v3", []);
        roles.forEach(function(r) {
            if (r.name !== "مدير العام") { 
                select.innerHTML += '<option value="' + r.name + '">' + r.name + '</option>'; 
            }
        });
    }
    modal.style.display = "flex";
}
// app.js - الجزء الخامس: فحص الباسورد للرتب وتسجيل خروج الموظفين والعودة لركبة عميل عادي
function handleStaffLogin(e) {
    e.preventDefault();
    var selectedRole = document.getElementById("loginRoleSelect").value;
    var typedPassword = document.getElementById("loginPasswordInput").value;
    
    if (!typedPassword) { alert("الرجاء إدخال كلمة المرور"); return; }
    
    if (selectedRole === "مدير العام" && (typedPassword === "youssef2026" || typedPassword === "youssef2025" || typedPassword === "admin2026")) {
        localStorage.setItem("kw_isAdmin", "true"); 
        localStorage.setItem("kw_my_id", "100"); 
        localStorage.setItem("kw_my_name", "Youssef Developer"); 
        var emps = get("kw_employees", []); 
        var exist = emps.find(function(e) { return e.id.toString() === "100"; }); 
        if (!exist) { 
            emps.push({ id: "100", name: "Youssef Developer", role: "مدير العام" }); 
            set("kw_employees", emps); 
        } 
        alert("أهلاً بك يا مدير، تم تفعيل كامل صلاحيات الإعدادات والتذاكر."); 
        location.reload(); return;
    }
    
    var roles = get("kw_roles_v3", []); 
    var matchedRole = roles.find(function(r) { return r.name === selectedRole && r.password === typedPassword; }); 
    if (matchedRole) { 
        var myName = localStorage.getItem("kw_my_name") || "موظف متجر"; 
        var myId = localStorage.getItem("kw_my_id") || "200"; 
        var emps = get("kw_employees", []); 
        var exist = emps.find(function(e) { return e.id.toString() === myId.toString(); }); 
        if (exist) { exist.role = matchedRole.name; } else { emps.push({ id: myId, name: myName, role: matchedRole.name }); } 
        localStorage.setItem("kw_isAdmin", "false"); set("kw_employees", emps); 
        alert("تم تسجيل الدخول بنجاح برتبة: " + matchedRole.name); 
        closeModal("staffLoginModal"); location.reload(); 
    } else { alert("كلمة المرور خاطئة للرتبة المحددة!"); } 
}

function logoutStaff() {
    localStorage.removeItem("kw_isAdmin");
    var id = Math.floor(Math.random() * (1000 - 100 + 1) + 100).toString();
    localStorage.setItem("kw_my_id", id); localStorage.setItem("kw_my_name", "زائر جديد");
    alert("تم تسجيل الخروج والعودة كعميل عادي."); location.reload();
}
// app.js - الجزء السادس: دالة التعديل الفوري لبيانات أي مستخدم وتحديث الـ LocalStorage بربط مباشر
function editUserIdentity(oldId) {
    var dir = get("kw_visitors_directory", []);
    var userIndex = dir.findIndex(function(u) { return u.id.toString() === oldId.toString(); });
    if (userIndex === -1) return;

    var newName = prompt("تعديل الاسم الكريم الجديد:", dir[userIndex].name);
    var newId = prompt("تعديل الـ ID الجديد (يجب أن يكون فريداً):", dir[userIndex].id);

    if (!newName || !newName.trim() || !newId || !newId.trim()) { alert("البيانات المدخلة غير صالحة!"); return; }
    
    if (newId.trim() !== oldId.toString()) {
        var idExists = dir.find(function(u) { return u.id.toString() === newId.trim(); });
        if (idExists) { alert("هذا المعرف (ID) مستخدم بالفعل لشخص آخر!"); return; }
    }

    var currentMyId = localStorage.getItem("kw_my_id");
    if (currentMyId && currentMyId.toString() === oldId.toString()) {
        localStorage.setItem("kw_my_name", newName.trim());
        localStorage.setItem("kw_my_id", newId.trim());
    }

    var emps = get("kw_employees", []);
    var empIndex = emps.findIndex(function(e) { return e.id.toString() === oldId.toString(); });
    if (empIndex !== -1) {
        emps[empIndex].id = newId.trim();
        emps[empIndex].name = newName.trim();
        set("kw_employees", emps);
    }

    dir[userIndex].name = newName.trim();
    dir[userIndex].id = newId.trim();
    set("kw_visitors_directory", dir);

    alert("تم تحديث البيانات بنجاح في النظام.");
    location.reload();
}
// app.js - الجزء السابع: فتح دليل الزوار ورندر الأزرار التفاعلية لتعديل الصلاحيات والأمان لـ KW STORE
function toggleUsersDirectory() { 
    var div = document.getElementById("usersDirectoryList"); 
    if (div) { 
        if (div.style.display === "none" || div.style.display === "") { 
            div.style.display = "block"; div.innerHTML = ""; 
            var dir = get("kw_visitors_directory", []); 
            for (var i = 0; i < dir.length; i++) { 
                div.innerHTML += '<div class="data-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">' +
                    '<span>👤 ' + dir[i].name + ' <strong style="color:var(--primary); margin-right:5px;">(ID: ' + dir[i].id + ')</strong></span>' +
                    '📝 تعديل</button>' +
                    '</div>'; 
            } 
        } else { div.style.display = "none"; } 
    } 
}

function checkSecurityAccess() { 
    var myId = localStorage.getItem("kw_my_id"); 
    var isOwner = localStorage.getItem("kw_isAdmin") === "true"; 
    var emps = get("kw_employees", []); var roles = get("kw_roles_v3", []); 
    var emp = emps.find(function(e) { return e.id.toString() === myId.toString(); }); 
    var userRole = (emp) ? roles.find(function(r) { return r.name === emp.role; }) : null; 
    if (document.getElementById("headerRoleLeft")) { document.getElementById("headerRoleLeft").innerText = emp ? emp.role : "Client"; } 
    var adminBtn = document.getElementById("admin-nav-btn"); var staffBtn = document.getElementById("staff-nav-btn"); var logoutBtn = document.getElementById("logout-system-btn");
    if (logoutBtn) { logoutBtn.style.display = (emp || isOwner) ? "inline-block" : "none"; }
    if (adminBtn) { 
        if (isOwner || (userRole && (userRole.permissions.manageEmployees || userRole.permissions.editPrices || userRole.permissions.fireAssign || userRole.permissions.editPasswords))) { adminBtn.style.setProperty('display', 'inline-block', 'important'); } else { adminBtn.style.display = "none"; } 
    } 
    if (staffBtn) { 
        if (isOwner || (userRole && userRole.permissions.viewTickets && userRole.permissions.replyTickets)) { staffBtn.style.setProperty('display', 'inline-block', 'important'); } else { staffBtn.style.display = "none"; } 
    } 
}
// app.js - الجزء الثامن: بناء الصلاحيات الافتراضية والشكاوى وتثبيت مستمعي الأحداث عند تشغيل الصفحة
function openModal(id) { if (document.getElementById(id)) document.getElementById(id).style.display = "flex"; }
function closeModal(id) { if (document.getElementById(id)) document.getElementById(id).style.display = "none"; }
function addNewRole() { var name = document.getElementById("roleInput").value.trim(); if (!name) return; var r = get("kw_roles_v3", []); r.push({ id: "role_" + Date.now(), name: name, password: "pass" + Date.now().toString().slice(-4), permissions: { viewComplaints: false, reply: false, editPrices: false, manageEmployees: false, viewTickets: false, replyTickets: false, fireAssign: false, editSite: false, editPasswords: false } }); set("kw_roles_v3", r); document.getElementById("roleInput").value = ""; renderAll(); checkSecurityAccess(); }
function changeRolePassword(roleId) { var myId = localStorage.getItem("kw_my_id"); var isOwner = localStorage.getItem("kw_isAdmin") === "true"; var emps = get("kw_employees", []); var roles = get("kw_roles_v3", []); var emp = emps.find(function(e) { return e.id.toString() === myId.toString(); }); var userRole = (emp) ? roles.find(function(r) { return r.name === emp.role; }) : null; if (!isOwner && (!userRole || !userRole.permissions.editPasswords)) { alert("No Permission"); return; } var targetRole = roles.find(function(r) { return r.id.toString() === roleId.toString(); }); if (targetRole) { var newPass = prompt("New Password:", targetRole.password || ""); if (newPass && newPass.trim() !== "") { targetRole.password = newPass.trim(); set("kw_roles_v3", roles); renderAll(); alert("Updated"); } } }

function renderAll() { 
    var rList = document.getElementById("rolesList"); var sel = document.getElementById("empRoleSelect"); var eList = document.getElementById("empList"); var compList = document.getElementById("adminComplaintsList"); 
    if (rList) { 
        rList.innerHTML = ""; var roles = get("kw_roles_v3", []); 
        for (var i = 0; i < roles.length; i++) { 
            var role = roles[i]; 
            var html = '<div class="data-item" style="flex-direction:column; align-items:stretch; margin-bottom:10px; border:1px solid var(--border-color); padding:10px; background:#0b130e;"><div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:5px;"><span>Role: <strong style="color:var(--primary)">' + role.name + '</strong></span><div><button onclick="changeRolePassword(\'' + role.id + '\')" style="background:#cd9b32; border:none; color:#000; padding:2px 6px; font-size:11px; margin-left:5px; cursor:pointer; font-weight:bold;">🔑 Password</button><button onclick="delRole(\'' + role.id + '\')" style="background:none; border:1px solid #d9534f; color:#d9534f; cursor:pointer; padding:2px 6px;">❌</button></div></div><div style="display:flex; flex-wrap:wrap; gap:10px; margin-top:5px; background:#06110b; padding:5px; font-size:11px;">' +
                '<label><input type="checkbox" ' + (role.permissions.viewComplaints ? 'checked' : '') + ' onchange="togglePerm(\'' + role.id + '\',\'viewComplaints\',this.checked)"> الشكاوى</label>' +
                '<label><input type="checkbox" ' + (role.permissions.reply ? 'checked' : '') + ' onchange="togglePerm(\'' + role.id + '\',\'reply\',this.checked)"> الرد</label>' +
                '<label><input type="checkbox" ' + (role.permissions.editPrices ? 'checked' : '') + ' onchange="togglePerm(\'' + role.id + '\',\'editPrices\',this.checked)"> الأسعار</label>' +
                '<label><input type="checkbox" ' + (role.permissions.viewTickets ? 'checked' : '') + ' onchange="togglePerm(\'' + role.id + '\',\'viewTickets\',this.checked)"> الرؤية</label>' +
                '<label><input type="checkbox" ' + (role.permissions.replyTickets ? 'checked' : '') + ' onchange="togglePerm(\'' + role.id + '\',\'replyTickets\',this.checked)"> رد التذاكر</label>' +
                '<label><input type="checkbox" ' + (role.permissions.fireAssign ? 'checked' : '') + ' onchange="togglePerm(\'' + role.id + '\',\'fireAssign\',this.checked)"> التعيين</label>' +
                '<label><input type="checkbox" ' + (role.permissions.editSite ? 'checked' : '') + ' onchange="togglePerm(\'' + role.id + '\',\'editSite\',this.checked)"> الموقع</label>' +
                '<label><input type="checkbox" ' + (role.permissions.editPasswords ? 'checked' : '') + ' onchange="togglePerm(\'' + role.id + '\',\'editPasswords\',this.checked)"> تعديل الباسورد</label>' +
                '</div></div>'; rList.innerHTML += html; 
        } 
    } if (sel) { sel.innerHTML = ""; var r = get("kw_roles_v3", []); for (var i = 0; i < r.length; i++) { sel.innerHTML += '<option value="' + r[i].name + '">' + r[i].name + '</option>'; } } 
    if (eList) { eList.innerHTML = ""; var emps = get("kw_employees", []); for (var i = 0; i < emps.length; i++) { var emp = emps[i]; eList.innerHTML += '<div class="data-item"><span>👤 ' + emp.name + ' (ID: ' + emp.id + ') - <strong style="color:var(--primary)">' + emp.role + '</strong></span>' + (emp.id.toString() !== "100" ? '<button onclick="fireEmployee(\'' + emp.id + '\')" style="background:none; border:1px solid #d9534f; color:#d9534f; cursor:pointer;">طرد ❌</button>' : '') + '</div>'; } } 
    if (compList) { compList.innerHTML = ""; var complaints = get("kw_complaints_v1", []); if (complaints.length === 0) { compList.innerHTML = '<div style="color:#557755; text-align:center; padding:10px;">لا توجد شكاوى مستلمة حالياً.</div>'; } else { for (var i = complaints.length - 1; i >= 0; i--) { var c = complaints[i]; compList.innerHTML += '<div style="background:#122218; border:1px solid var(--border-color); padding:10px; margin-bottom:8px; border-radius:5px;"><div style="display:flex; justify-content:space-between; font-size:12px; color:var(--primary);"><span>👤 من: ' + c.senderName + '</span><span>📅 ' + c.date + '</span></div><div style="color:#fff; margin-top:5px; font-size:14px;">📝 الشكوى: ' + c.message + '</div></div>'; } } } 
}

function togglePerm(roleId, permName, isChecked) { var roles = get("kw_roles_v3", []); var role = roles.find(function(r) { return r.id.toString() === roleId.toString(); }); if (role) { role.permissions[permName] = isChecked; set("kw_roles_v3", roles); checkSecurityAccess(); } }
function delRole(roleId) { if (roleId === 1 || roleId === 2 || roleId === 3 || roleId === "1" || roleId === "2" || roleId === "3") { alert("Cannot Delete Base Roles"); return; } var roles = get("kw_roles_v3", []); roles = roles.filter(function(r) { return r.id.toString() !== roleId.toString(); }); set("kw_roles_v3", roles); renderAll(); }
function assignEmployee() { var myId = localStorage.getItem("kw_my_id"); var id = document.getElementById("empIdInput").value.trim(); var role = document.getElementById("empRoleSelect").value; if (!id) return; if (id.toString() === myId.toString() && localStorage.getItem("kw_isAdmin") !== "true") { alert("Action Blocked"); return; } var dir = get("kw_visitors_directory", []); var user = dir.find(function(u) { return u.id.toString() === id.toString(); }); if (!user) { alert("Not Found"); return; } var emps = get("kw_employees", []); var exist = emps.find(function(e) { return e.id.toString() === id.toString(); }); if (exist) { exist.role = role; } else { emps.push({ id: id, name: user.name, role: role }); } set("kw_employees", emps); document.getElementById("empIdInput").value = ""; renderAll(); checkSecurityAccess(); alert("Assigned Successfully"); }
function fireEmployee(empId) { var myId = localStorage.getItem("kw_my_id"); if (empId.toString() === "100") { alert("Cannot Action Admin"); return; } if (empId.toString() === myId.toString()) { alert("Action Blocked"); return; } var emps = get("kw_employees", []); emps = emps.filter(function(e) { return e.id.toString() !== empId.toString(); }); set("kw_employees", emps); renderAll(); checkSecurityAccess(); }

document.addEventListener("DOMContentLoaded", function() { 
    if (!localStorage.getItem("kw_force_refresh_v16")) { localStorage.clear(); localStorage.setItem("kw_force_refresh_v16", "true"); } 
    initIdentity(); 
    if (!localStorage.getItem("kw_roles_v3")) { 
        set("kw_roles_v3", [ 
            { id: 1, name: "مدير العام", password: "admin2026", permissions: { viewComplaints: true, reply: true, editPrices: true, manageEmployees: true, viewTickets: true, replyTickets: true, fireAssign: true, editSite: true, editPasswords: true } }, 
            { id: 2, name: "مسؤول شكاوى", password: "shakwa2026", permissions: { viewComplaints: true, reply: true, editPrices: false, manageEmployees: false, viewTickets: true, replyTickets: true, fireAssign: false, editSite: false, editPasswords: false } }, 
            { id: 3, name: "دعم فني مستوى 1", password: "tech2026", permissions: { viewComplaints: true, reply: false, editPrices: false, manageEmployees: false, viewTickets: true, replyTickets: true, fireAssign: false, editSite: false, editPasswords: false } } 
        ]); 
    } 
    if (!localStorage.getItem("kw_employees")) { set("kw_employees", [{ id: "100", name: "Youssef Developer", role: "مدير العام" }]); } 
    if (!localStorage.getItem("kw_chat_rooms")) { set("kw_chat_rooms", {}); } 
    var compForm = document.getElementById("complaintForm"); if (compForm) { compForm.addEventListener("submit", submitComplaint); } 
    var allReqs = document.querySelectorAll("input[required], textarea[required]");
    allReqs.forEach(function(el){ el.addEventListener("input", function(){ if(this.value.trim()) this.style.borderColor = "var(--border-color)"; }); });
    checkSecurityAccess(); renderAll(); 
});
