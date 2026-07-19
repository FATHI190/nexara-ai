// ربط العناصر الأساسية من الواجهة
document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('userInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') sendMessage();
});

// 1. تفعيل زر "محادثة جديدة" (تنظيف الشاشة وبدء شات جديد)
document.querySelector('.new-chat-btn').addEventListener('click', function () {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML = `
        <div class="message-wrapper bot">
            <div class="avatar bot-av">AI</div>
            <div class="message-box">
                🔄 تم بدء جلسة محادثة جديدة بنجاح! فصوص Nexara جاهزة ومستعدة لأسئلتك الآن.
            </div>
        </div>
    `;
});

// 2. تفعيل أزرار الأدوات السفلية (ويب، كود، صوت) عند الضغط عليها
document.querySelectorAll('.tool-tag').forEach(tag => {
    tag.addEventListener('click', function () {
        const toolName = this.innerText.trim();
        const inputField = document.getElementById('userInput');

        // تأثير بصري لطيف عند الضغط
        this.style.transform = 'scale(0.95)';
        setTimeout(() => this.style.transform = 'scale(1)', 1000);

        // إضافة نص الأداة داخل صندوق الكتابة لتسهيل الأمر على المستخدم
        if (toolName.includes("ويب")) {
            inputField.value = "[البحث في الويب]: " + inputField.value;
        } else if (toolName.includes("كود")) {
            inputField.value = "اكتب لي كود لـ " + inputField.value;
        } else if (toolName.includes("صوت")) {
            alert("🎙️ ميزة الإدخال الصوتي ستكون مدعومة في التحديث القادم عبر المايكروفون!");
        }
        inputField.focus();
    });
});

// 3. تفعيل أزرار القائمة الجانبية السفلى (مكتبة الأوامر والإعدادات)
document.querySelectorAll('.footer-item').forEach(item => {
    item.addEventListener('click', function () {
        const name = this.innerText.trim();
        alert(`⚙️ فتح نافذة: (${name}) لـ Nexara AI Studio قيد التطوير والتحضير!`);
    });
});

// 4. دالة إرسال الرسائل الأساسية والمعالجة عبر الفص الذكي للبايثون
function sendMessage() {
    const inputField = document.getElementById('userInput');
    const query = inputField.value.trim();

    if (query === '') return;

    const chatBox = document.getElementById('chatBox');

    // إنشاء فقاعة المستخدم مع الـ Avatar
    const userWrapper = document.createElement('div');
    userWrapper.className = 'message-wrapper user';
    userWrapper.innerHTML = `
        <div class="avatar user-av">U</div>
        <div class="message-box">${query}</div>
    `;
    chatBox.appendChild(userWrapper);

    inputField.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;

    // إرسال الطلب إلى سيرفر بايثون (Flask)
    fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: query })
    })
        .then(response => response.json())
        .then(data => {
            // إنشاء فقاعة Nexara مع الـ Avatar والرد الذكي
            const botWrapper = document.createElement('div');
            botWrapper.className = 'message-wrapper bot';
            botWrapper.innerHTML = `
            <div class="avatar bot-av">AI</div>
            <div class="message-box">${data.response}</div>
        `;
            chatBox.appendChild(botWrapper);
            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(error => {
            console.error('Error:', error);
            const errorWrapper = document.createElement('div');
            errorWrapper.className = 'message-wrapper bot';
            errorWrapper.innerHTML = `
            <div class="avatar bot-av">AI</div>
            <div class="message-box">❌ عذراً، واجهت مشكلة في الاتصال بالسيرفر الداخلي لعقلي. تأكد من تشغيل ملف app.py!</div>
        `;
            chatBox.appendChild(errorWrapper);
            chatBox.scrollTop = chatBox.scrollHeight;
        });
}
