// app.js - موقع العملاء فقط (النسخة الآمنة والمخففة)
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
        document.getElementById("contact").scrollIntoView({ behavior: "smooth" }); 
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
// الجزء الرابع: دالة استقبال طلبات شراء الأنظمة وفحصها وإعادة تهيئة الحقول بعد الإرسال الناجح
function handleForm(e) { 
    e.preventDefault(); 
    if (!validateFormInputs("contactForm")) {
        alert("يرجى ملء جميع الحقول المطلوبة باللون الأحمر");
        return;
    }
    alert("Success"); 
    if(document.getElementById("contactForm")) document.getElementById("contactForm").reset(); 
}
// الجزء الخامس: استقبال شكاوى العملاء وتوليد معرف مشفر وتلقائي لكل تذكرة لضمان عدم التداخل
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
}
// الجزء السادس: حظر الرتب التلقائية وتوليد معرف رقمي فريد بين 100 و1000 لكل عميل جديد يدخل الرابط
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
// الجزء السابع: تهيئة النظام الكلية وربط الزر السري بالفوتر بالرابط المستقل لموقع الموظفين الجديد على GitHub
document.addEventListener("DOMContentLoaded", function() { 
    if (!localStorage.getItem("kw_force_refresh_v21")) { 
        localStorage.clear(); 
        localStorage.setItem("kw_force_refresh_v21", "true"); 
    } 
    initIdentity(); 
    
    // كود التوجيه السري والآمن للموظفين للموقع الجديد المعزول تماماً
    var lockSystemBtn = document.getElementById("secretLockLink");
    if (lockSystemBtn) {
        lockSystemBtn.removeAttribute("onclick"); 
        lockSystemBtn.addEventListener("click", function(e) {
            e.preventDefault();
            // ⚠️ قم بتغيير الرابط أدناه برابط موقع الموظفين الجديد الخاص بك (GitHub Pages) بعد تفعيله
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
});
