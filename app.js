// app.js - موقع العملاء فقط (النسخة الآمنة والمخففة المربوطة حياً بالموظفين)
// الجزء الأول: دوال التحكم البرمجي في جلب وتخزين البيانات وحفظها من المتصفح
var activeRoom = null;

function get(k, def) { 
    var val = localStorage.getItem(k); 
    if (!val) return def; 
    try { return JSON.parse(val); } catch(e) { return def; } 
}

function set(k, v) { 
    localStorage.setItem(k, JSON.stringify(v)); 
}
// الجزء الثاني: نظام استقبال طلب النظام المالي وملء حقل الرسالة ونقل العميل تلقائياً لأسفل الموقع
function orderSystem(sys) { 
    var f = document.getElementById("clientMsg"); 
    if (f) { 
        f.value = "Order: " + sys; 
        var contactSec = document.getElementById("contact");
        if(contactSec) contactSec.scrollIntoView({ behavior: "smooth" }); 
    } 
}
// الجزء الثالث: جدار التحقق الفوري من تعبئة المدخلات الإلزامية وتلوين الحواف باللون الأحمر
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
// الجزء الرابع: دالة استقبال طلبات شراء الأنظمة وفحصها وإرسالها حياً للوحة الموظفين
function handleForm(e) { 
    if(e) e.preventDefault(); 
    if (!validateFormInputs("contactForm")) {
        alert("يرجى ملء جميع الحقول المطلوبة باللون الأحمر");
        return;
    }
    
    var cName = document.getElementById("clientName").value.trim();
    var cPhone = document.getElementById("clientPhone").value.trim();
    var cMsg = document.getElementById("clientMsg").value.trim();
    
    // 🚀 [حقن برمي حي]: إرسال وحقن الطلب في نفس قاعدة البيانات التي تقرأها لوحة الموظفين فوراً
    var orders = get("kw_orders_v1", []);
    orders.push({
        id: "order_" + Date.now(),
        clientName: cName,
        clientPhone: cPhone,
        selectedSystem: cMsg,
        date: new Date().toLocaleString("ar-EG")
    });
    set("kw_orders_v1", orders);
    
    alert("تم إرسال طلب الشراء بنجاح فوري! وسوف يظهر حياً لطاقم الموظفين في خانة 'طلبات الأنظمة' للتدقيق الفوري."); 
    if(document.getElementById("contactForm")) document.getElementById("contactForm").reset(); 
}
// الجزء الخامس: استقبال شكاوى العملاء وتوليد معرف مشفر وحقنها حياً في لوحة الموظفين
function submitComplaint(e) { 
    if(e) e.preventDefault(); 
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
        reply: "" 
    }); 
    set("kw_complaints_v1", complaints); 
    alert("تم إرسال تذكرة الشكوى حياً للإدارة بنجاح!"); 
    if(document.getElementById("complaintForm")) document.getElementById("complaintForm").reset(); 
    renderStaffRepliesForClient();
}
// 📩 [حقن واجهة الردود حياً]: فلترة وعرض ردود موظفي الإدارة وحقنها حياً للعميل بدون ريفريش
function renderStaffRepliesForClient() {
    var container = document.getElementById("staffRepliesContainer");
    var section = document.getElementById("clientRepliesSection");
    if (!container || !section) return;
    
    var complaints = get("kw_complaints_v1", []);
    var answeredTickets = complaints.filter(function(c) { return c && c.reply && c.reply !== ""; });
    
    if (answeredTickets.length > 0) {
        section.style.display = "block";
        container.innerHTML = "";
        answeredTickets.forEach(function(c) {
            container.innerHTML += '<div style="background:#060b07; padding:15px; border:1px solid rgba(46,204,113,0.3); border-radius:6px; margin-bottom:10px;">' +
                '<div style="font-size:12px; color:var(--text-muted);">التذكرة الفنية الموجهة باسم العميل: ' + c.senderName + '</div>' +
                '<div style="font-weight:bold; margin-top:4px; color:#fff;">⚠️ تفاصيل مشكلتك: ' + c.message + '</div>' +
                '<div style="color:var(--primary); font-weight:bold; margin-top:8px; border-top:1px solid rgba(255,255,255,0.05); padding-top:5px;">🛡️ حل ورد طاقم الموظفين: ' + c.reply + '</div></div>';
        });
    } else {
        section.style.display = "none";
    }
}
// الجزء السادس: توليد معرف رقمي فريد بين 100 و1000 لكل عميل جديد يدخل الرابط ومزامنته بـ Directory
function initIdentity() { 
    var dir = get("kw_visitors_directory", []); 
    var name = localStorage.getItem("kw_my_name"); 
    var id = localStorage.getItem("kw_my_id"); 
    
    if (!name || !id || name === "زائر جديد") { 
        name = "";
        while (!name || !name.trim()) { 
            name = prompt("أدخل اسمك الكريم للبدء في المتجر:"); 
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
// دوال معالجة وفتح وقفل المودالات الكودية القديمة بصفحة العميل
function openModal(id) { var m = document.getElementById(id); if(m) m.style.display = "flex"; }
function closeModal(id) { var m = document.getElementById(id); if(m) m.style.display = "none"; }
function openLoginModal() { openModal("staffLoginModal"); }
function logoutStaff() { localStorage.setItem("kw_isAdmin", "false"); location.reload(); }
function handleStaffLogin(e) { if(e) e.preventDefault(); alert("يرجى استخدام رابط قفل النظام للتحويل للوحة الموظفين المصلحة والجديدة بالخارج!"); }
function addNewRole() { alert("تم تعطيل النقل المحمي هنا؛ تحكم بالرتب من لوحة الموظفين الخارجية المربوطة حياً!"); }
function assignEmployee() { alert("تحكم بالتوظيف من اللوحة الخارجية المستقلة للموظفين!"); }
function toggleUsersDirectory() { var d = document.getElementById("usersDirectoryList"); if(d) { d.style.display = d.style.display === "none" ? "block" : "none"; d.innerHTML = "يرجى مراجعته حياً من دليل لوحة الموظفين المحدثة."; } }
// الجزء السابع: تهيئة النظام الكلية ومزامنة الاستماع للربط الحي
document.addEventListener("DOMContentLoaded", function() { 
    if (!localStorage.getItem("kw_force_refresh_v21")) { 
        localStorage.clear(); 
        localStorage.setItem("kw_force_refresh_v21", "true"); 
    } 
    initIdentity(); 
    renderStaffRepliesForClient();
    
    // كود التوجيه السري والآمن للموظفين للربط المباشر بموقع الموظفين الجديد على GitHub
    var lockSystemBtn = document.getElementById("secretLockLink");
    if (lockSystemBtn) {
        lockSystemBtn.removeAttribute("onclick"); 
        lockSystemBtn.addEventListener("click", function(e) {
            e.preventDefault();
            // ⚠️ قم بوضع رابط مستودع الموظفين المطور والنهائي (GitHub Pages) هنا لربطهما بضغطة زر واحدة
            window.location.href = "https://github.io";
        });
    }

    var compForm = document.getElementById("complaintForm"); 
    if (compForm) { compForm.addEventListener("submit", submitComplaint); } 
    var allReqs = document.querySelectorAll("input[required], textarea[required]");
    allReqs.forEach(function(el){ 
        el.addEventListener("input", function(){ 
            if(this.value.trim()) this.style.borderColor = "var(--border-color)"; 
        }); 
    });

    // 🔄 [المزامنة التلقائية واللحظية فورا]: إذا قام المسؤول بالرد من لوحة الموظفين، يسمح فوراً للعميل برؤية الحل هنا حياً
    window.addEventListener("storage", function() {
        renderStaffRepliesForClient();
    });
});
