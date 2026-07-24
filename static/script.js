let currentMode = 'general';

document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('webTool').addEventListener('click', function () { toggleMode('web', this); });
    document.getElementById('codeTool').addEventListener('click', function () { toggleMode('code', this); });
    document.getElementById('voiceTool').addEventListener('click', function () { alert("🎙️ فص الصوت: جاري الاتصال بالمايكروفون..."); });

    function toggleMode(mode, element) {
        if (currentMode === mode) {
            currentMode = 'general';
            element.classList.remove('active-mode');
        } else {
            document.querySelectorAll('.tool-tag').forEach(t => t.classList.remove('active-mode'));
            currentMode = mode;
            element.classList.add('active-mode');
        }
    }

    document.getElementById('userInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    document.getElementById('topSidebarToggle').addEventListener('click', toggleSidebar);
    document.getElementById('sendBtn').addEventListener('click', function () {
        const userInputField = document.getElementById('userInput');
        if (userInputField.value.trim() !== '') {
            sendMessage();
        } else {
            toggleSidebar();
        }
    });

    document.getElementById('newChatBtn').addEventListener('click', function () {
        document.getElementById('chatBox').innerHTML = `<div class="landing-greeting" id="landingGreeting"><h1>مرحبا، كيف يمكنني مساعدتك اليوم؟</h1></div>`;
        currentMode = 'general';
        document.querySelectorAll('.tool-tag').forEach(t => t.classList.remove('active-mode'));
    });

    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const bottomIcon = document.querySelector('#sendBtn i');
        sidebar.classList.toggle('collapsed');
        bottomIcon.style.transform = sidebar.classList.contains('collapsed') ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    // ==========================================
    // الحل النهائي (بسيط جداً ويعتمد على تأخير الخادم)
    // ==========================================
    async function sendMessage() {
        const inputField = document.getElementById('userInput');
        const query = inputField.value.trim();
        if (query === '') return;

        const chatBox = document.getElementById('chatBox');
        const greeting = document.getElementById('landingGreeting');
        if (greeting) { greeting.remove(); }

        // إضافة رسالة المستخدم
        const userWrapper = document.createElement('div');
        userWrapper.className = 'message-wrapper user';
        userWrapper.innerHTML = `<div class="avatar user-av">U</div><div class="message-box">${query}</div>`;
        chatBox.appendChild(userWrapper);
        inputField.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        // إظهار طبقة "يفكر..."
        const overlay = document.getElementById('thinking-overlay');
        overlay.style.display = 'flex';

        // إجبار المتصفح على رسم الطبقة فوراً
        overlay.offsetHeight;

        // الآن أرسل الطلب. بما أن الخادم سيستغرق 1.2 ثانية، فإن "يفكر..." ستبقى!
        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: query, mode: currentMode })
            });
            const data = await response.json();

            // إخفاء الطبقة وعرض الرد
            overlay.style.display = 'none';

            const botWrapper = document.createElement('div');
            botWrapper.className = 'message-wrapper bot';
            botWrapper.innerHTML = `<div class="avatar bot-av">AI</div><div class="message-box">${data.response}</div>`;
            chatBox.appendChild(botWrapper);
            chatBox.scrollTop = chatBox.scrollHeight;

        } catch (error) {
            console.error('Error:', error);
            overlay.style.display = 'none';
            const errWrapper = document.createElement('div');
            errWrapper.className = 'message-wrapper bot';
            errWrapper.innerHTML = `<div class="avatar bot-av">AI</div><div class="message-box" style="background:#ffe6e6;">❌ حدث خطأ في الاتصال بالخادم.</div>`;
            chatBox.appendChild(errWrapper);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
});
