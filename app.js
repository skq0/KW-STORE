// دالة لتسهيل طلب النظام عند الضغط على أزرار الكروت
function orderSystem(systemName) {
    const msgBox = document.getElementById("clientMsg");
    if(msgBox) {
        msgBox.value = `مرحباً يوسف تك، أنا مهتم بطلب تجربة: ${systemName}، أرجو التواصل معي.`;
        document.getElementById("contact").scrollIntoView({ behavior: 'smooth' });
    }
}

// دالة معالجة نموذج الاتصال وإظهار رسالة نجاح تفاعلية للعميل
function handleForm(event) {
    event.preventDefault();
    
    const name = document.getElementById("clientName").value;
    const phone = document.getElementById("clientPhone").value;
    
    alert(`شكراً لتواصلك معنا يا فنان! تم تسجيل طلبك باسم (${name}) بنجاح، وسيتم التواصل معك على رقم (${phone}) عبر الواتساب لإرسال نسخة الديمو والـ EXE للتجربة مجاناً. ✨🚀`);
    
    // إعادة تعيين الحقول بعد الإرسال
    document.getElementById("contactForm").reset();
}
