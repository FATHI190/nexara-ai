let currentConversationId = null;
let currentMode = 'general';

// متغيرات المودال
let pendingAction = null;
let pendingConversationId = null;
let pendingCurrentTitle = '';

// 🌟 متغيرات الصوت
let recognition = null;
let isListening = false;

document.addEventListener('DOMContentLoaded', () => {
    initApp();

    const sendBtn = document.getElementById('sendBtn');
    const userInput = document.getElementById('userInput');
    const newChatBtn = document.getElementById('newChatBtn');
    const sidebarToggle = document.getElementById('topSidebarToggle');

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    if (newChatBtn) newChatBtn.addEventListener('click', createNewChat);
    if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);

    setupModeSelectors();
    setupModalListeners();
    setupVoiceRecognition();
});

// --- إخفاء وإظهار القائمة الجانبية ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (window.innerWidth <= 768) {
        // وضع الجوال: تبديل طبقة الـ drawer
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    } else {
        // وضع الحاسوب: تبديل الـ collapsing
        sidebar.classList.toggle('collapsed');
    }
}

// --- تهيئة التطبيق ---
async function initApp() {
    try {
        const response = await fetch('/api/current_session');
        const data = await response.json();
        if (data && data.id) {
            currentConversationId = data.id;
            await loadHistory(currentConversationId);
        } else {
            await createNewChat();
        }
        await loadSessionsList();
    } catch (error) {
        console.error('خطأ في التهيئة:', error);
    }
}

// --- إنشاء محادثة جديدة ---
async function createNewChat() {
    try {
        const response = await fetch('/api/new_session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();

        if (data && data.id) {
            currentConversationId = data.id;
            const chatContainer = document.getElementById('chatBox');
            if (chatContainer) chatContainer.innerHTML = '<div class="landing-greeting" id="landingGreeting"><h1>مرحبا، كيف يمكنني مساعدتك اليوم؟</h1></div>';
            await loadSessionsList();
            return true;
        }
        return false;
    } catch (error) {
        console.error('خطأ في إنشاء محادثة جديدة:', error);
        return false;
    }
}

// --- جلب قائمة المحادثات ---
async function loadSessionsList() {
    try {
        const response = await fetch('/api/sessions');
        const sessions = await response.json();

        const sessionsContainer = document.getElementById('conversationsList');
        if (!sessionsContainer) return;

        sessionsContainer.innerHTML = '';

        sessions.forEach(session => {
            const card = document.createElement('div');
            card.classList.add('chat-item');

            if (session.id === currentConversationId) {
                card.classList.add('active');
            }

            card.innerHTML = `
                <div class="chat-item-text" onclick="switchConversation(${session.id})">
                    <h4>${escapeHTML(session.title)}</h4>
                    <p>تفاعل حي ومستقر بالكامل</p>
                </div>
                <div class="chat-item-actions">
                    <i class="fa-regular fa-pen-to-square action-btn" onclick="event.stopPropagation(); openRenameModal(${session.id}, '${escapeHTML(session.title)}')" title="تغيير الاسم"></i>
                    <i class="fa-regular fa-trash-can action-btn" onclick="event.stopPropagation(); openDeleteModal(${session.id})" title="حذف المحادثة"></i>
                </div>
            `;

            sessionsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('خطأ في جلب المحادثات:', error);
    }
}

// --- التبديل بين المحادثات ---
async function switchConversation(conversationId) {
    if (currentConversationId === conversationId) return;
    currentConversationId = conversationId;
    // إغلاق القائمة الجانبية عند التبديل في الجوال
    if (window.innerWidth <= 768) toggleSidebar();
    await loadHistory(conversationId);
    await loadSessionsList();
}

// --- تحميل تاريخ المحادثة ---
async function loadHistory(conversationId) {
    const chatContainer = document.getElementById('chatBox');
    if (chatContainer) chatContainer.innerHTML = '';

    try {
        const response = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation_id: conversationId })
        });
        const messages = await response.json();

        messages.forEach(msg => {
            appendMessage(msg.role === 'user' ? 'user' : 'bot', msg.content);
        });

    } catch (error) {
        console.error('خطأ في تحميل الرسائل:', error);
    }
}

// --- منطق المودال ---
function setupModalListeners() {
    document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) closeModal();
    });
    document.getElementById('modalConfirmBtn').addEventListener('click', executeModalAction);
}

function openRenameModal(conversationId, currentTitle) {
    pendingAction = 'rename';
    pendingConversationId = conversationId;
    pendingCurrentTitle = currentTitle;

    document.getElementById('modalTitle').innerText = 'تغيير اسم المحادثة';
    document.getElementById('modalMessage').style.display = 'none';
    const input = document.getElementById('modalInput');
    input.style.display = 'block';
    input.value = currentTitle;
    document.getElementById('modalConfirmBtn').className = 'modal-btn confirm';
    document.getElementById('modalConfirmBtn').innerText = 'حفظ';

    document.getElementById('modalOverlay').classList.add('show');
    input.focus();
    input.select();
}

function openDeleteModal(conversationId) {
    pendingAction = 'delete';
    pendingConversationId = conversationId;

    document.getElementById('modalTitle').innerText = 'تأكيد الحذف';
    document.getElementById('modalMessage').style.display = 'block';
    document.getElementById('modalMessage').innerText = 'هل أنت متأكد من حذف هذه المحادثة وكل رسائلها؟';
    document.getElementById('modalInput').style.display = 'none';
    document.getElementById('modalConfirmBtn').className = 'modal-btn danger';
    document.getElementById('modalConfirmBtn').innerText = 'نعم، احذف';

    document.getElementById('modalOverlay').classList.add('show');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    pendingAction = null;
    pendingConversationId = null;
}

async function executeModalAction() {
    if (!pendingAction || !pendingConversationId) return;

    if (pendingAction === 'rename') {
        const newTitle = document.getElementById('modalInput').value.trim();
        if (!newTitle) {
            document.getElementById('modalMessage').style.display = 'block';
            document.getElementById('modalMessage').innerText = '⚠️ لا يمكنك ترك الاسم فارغاً!';
            document.getElementById('modalMessage').style.color = '#e74c3c';
            return;
        }
        await performRename(pendingConversationId, newTitle);
        closeModal();
    }
    else if (pendingAction === 'delete') {
        await performDelete(pendingConversationId);
        closeModal();
    }
}

async function performRename(conversationId, newTitle) {
    try {
        const response = await fetch(`/api/sessions/${conversationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle })
        });
        const data = await response.json();
        if (data.success) {
            await loadSessionsList();
            if (currentConversationId === conversationId) {
                const titleElement = document.querySelector('.header-title h2');
                if (titleElement) titleElement.innerText = newTitle;
            }
        } else {
            console.warn('فشل في تغيير الاسم:', data.error);
        }
    } catch (error) {
        console.error('حدث خطأ في الاتصال بالخادم.', error);
    }
}

async function performDelete(conversationId) {
    try {
        const response = await fetch(`/api/sessions/${conversationId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            if (currentConversationId === conversationId) {
                currentConversationId = null;
                const chatContainer = document.getElementById('chatBox');
                if (chatContainer) {
                    chatContainer.innerHTML = '<div class="landing-greeting" id="landingGreeting"><h1>مرحبا، كيف يمكنني مساعدتك اليوم؟</h1></div>';
                }
            }
            await loadSessionsList();
        } else {
            console.warn('فشل في حذف المحادثة:', data.error);
        }
    } catch (error) {
        console.error('حدث خطأ في الاتصال بالخادم.', error);
    }
}

// --- إرسال الرسالة ---
async function sendMessage() {
    const inputElement = document.getElementById('userInput');
    if (!inputElement) return;

    const messageText = inputElement.value.trim();
    if (!messageText) return;

    if (!currentConversationId) {
        const success = await createNewChat();
        if (!success) {
            appendMessage('bot', '⚠️ تعذر بدء محادثة جديدة. يرجى الضغط على زر "محادثة جديدة" يدوياً.');
            return;
        }
    }

    appendMessage('user', messageText);
    inputElement.value = '';

    const typingIndicator = appendTypingIndicator();

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: messageText,
                mode: currentMode,
                conversation_id: currentConversationId
            })
        });

        const data = await response.json();
        if (typingIndicator) typingIndicator.remove();

        appendMessage('bot', data.response);
        await loadSessionsList();

    } catch (error) {
        if (typingIndicator) typingIndicator.remove();
        appendMessage('bot', '❌ فشل الاتصال بالخادم. تأكد من تشغيل الخادم.');
    }
}

function appendMessage(sender, text) {
    const chatContainer = document.getElementById('chatBox');
    if (!chatContainer) return;

    const wrapper = document.createElement('div');
    wrapper.className = sender === 'user' ? 'message-wrapper user' : 'message-wrapper bot';

    if (sender === 'user') {
        wrapper.innerHTML = `<div class="avatar-text user-av">U</div><div class="message-box">${escapeHTML(text)}</div>`;
    } else {
        wrapper.innerHTML = `
            <img src="/static/logo-removebg-preview.png?v=4" class="avatar-img bot-av" alt="Nexara">
            <div class="message-box">${escapeHTML(text)}</div>
        `;
    }

    chatContainer.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendTypingIndicator() {
    const chatContainer = document.getElementById('chatBox');
    if (!chatContainer) return null;

    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper bot';
    wrapper.innerHTML = `
        <img src="/static/logo-removebg-preview.png?v=4" class="avatar-img bot-av" alt="Nexara">
        <div class="message-box"><i class="fa-solid fa-circle-notch fa-spin"></i> يفكر...</div>
    `;
    chatContainer.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    return wrapper;
}

// ======================================================================
// 🌟 دوال الصوت
// ======================================================================

function setupVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.warn("المتصفح الحالي لا يدعم تحويل الصوت إلى نص.");
        const voiceBtn = document.getElementById('voiceTool');
        if (voiceBtn) voiceBtn.style.opacity = '0.5';
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        const inputField = document.getElementById('userInput');
        if (inputField) {
            inputField.value = transcript;
            inputField.focus();
            inputField.setSelectionRange(transcript.length, transcript.length);
        }
    };

    recognition.onend = function () {
        isListening = false;
        const voiceBtn = document.getElementById('voiceTool');
        if (voiceBtn) {
            voiceBtn.classList.remove('listening-mode');
            voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i> صوت';
        }
    };

    recognition.onerror = function (event) {
        console.warn('خطأ في التعرف الصوتي:', event.error);
        recognition.onend();
    };
}

function toggleVoiceRecording() {
    if (!recognition) {
        alert('المتصفح لا يدعم ميزة التعرف الصوتي. يرجى استخدام Google Chrome أو Edge.');
        return;
    }

    const voiceBtn = document.getElementById('voiceTool');

    if (isListening) {
        recognition.stop();
        return;
    }

    try {
        recognition.start();
        isListening = true;
        voiceBtn.classList.add('listening-mode');
        voiceBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> استماع...';
    } catch (error) {
        console.error('فشل بدء التسجيل:', error);
        recognition.onend();
    }
}

// ======================================================================

// --- إعداد أدوات الوضع ---
function setupModeSelectors() {
    const modeButtons = document.querySelectorAll('.tool-tag');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => {
                b.classList.remove('active-mode');
                if (b.id === 'voiceTool') {
                    b.classList.remove('listening-mode');
                    b.innerHTML = '<i class="fa-solid fa-microphone"></i> صوت';
                    if (isListening && recognition) recognition.stop();
                    isListening = false;
                }
            });

            btn.classList.add('active-mode');

            if (btn.id === 'webTool') currentMode = 'web';
            else if (btn.id === 'codeTool') currentMode = 'code';
            else if (btn.id === 'voiceTool') {
                currentMode = 'general';
                toggleVoiceRecording();
            }
            else currentMode = 'general';
        });
    });
}

function openLibrary() { console.log("📚 فتح مكتبة الأوامر (قيد التطوير)"); }
function openSettings() { console.log("⚙️ فتح الإعدادات (قيد التطوير)"); }

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}
