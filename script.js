/* ======================================================================
   المتغيرات العامة
   ====================================================================== */
let currentConversationId = null;
let currentMode = 'general';
let activeFolderId = null;
let moveConversationTargetId = null;

let pendingAction = null;
let pendingConversationId = null;
let pendingCurrentTitle = '';
let pendingFolderId = null;

let recognition = null;
let isListening = false;
let silenceTimer = null;

let userSettings = {
    theme: 'dark',
    lang: 'en'
};

let pendingFiles = [];

const TRANSLATIONS = {
    en: {
        appName: "Nexara", appTagline: "Smart Assistant Space", newChat: "New Chat", folders: "Folders", searchPlaceholder: "Search in chats...", recentChats: "Recent Chats", commandLibrary: "Command Library", settings: "Settings", appTitle: "Nexara Assistant", appDesc: "Full Interactive Version", greeting: "Hello, how can I help you today?", inputPlaceholder: "Type your message here...", web: "Web", code: "Code", voice: "Voice", file: "File", version: "Nexara 0.1", settingsTitle: "Settings", darkMode: "Dark Mode", interfaceLang: "Interface Language", clearChats: "Clear All Chats", resetSettings: "Reset Settings", close: "Close", confirm: "Confirm", cancel: "Cancel", renameTitle: "Rename Conversation", deleteTitle: "Confirm Delete", deleteMsg: "Are you sure you want to delete this conversation and all its messages?", createFolderTitle: "Create New Folder", moveTitle: "Move Conversation to Folder", uncategorized: "Uncategorized", foldersAll: "All", foldersUncat: "Uncategorized", libraryTitle: "📖 Command Library", libraryContent: `<strong>Nexara Command List:</strong><br><br><code>/help</code> - Show available commands.<br><code>/rename [new name]</code> - Rename current conversation.<br><code>/delete</code> - Delete current conversation.<br><code>/export</code> - Export current conversation as a text file.<br><code>/folder [folder name]</code> - Create a new folder.<br><code>/move [folder name]</code> - Move current conversation to a folder.<br><br><i>Tip: Do not put a slash (/) at the end.</i>`,
        create: "Create", move: "Move", save: "Save", delete: "Delete", renameFolder: "Rename Folder", deleteFolder: "Delete Folder", deleteFolderMsg: "Are you sure you want to delete this folder? Its conversations will be moved to Uncategorized.",
        msgNavTitle: "My Messages"
    },
    ar: {
        appName: "Nexara", appTagline: "مساحة المساعد الذكي", newChat: "محادثة جديدة", folders: "المجلدات", searchPlaceholder: "ابحث في المحادثات...", recentChats: "المحادثات الأخيرة", commandLibrary: "مكتبة الأوامر", settings: "الإعدادات", appTitle: "مساعد Nexara", appDesc: "النسخة التفاعلية الكاملة", greeting: "مرحبا، كيف يمكنني مساعدتك اليوم؟", inputPlaceholder: "اكتب رسالتك هنا...", web: "ويب", code: "كود", voice: "صوت", file: "ملف", version: "Nexara 0.1", settingsTitle: "الإعدادات", darkMode: "الوضع المظلم", interfaceLang: "لغة الواجهة", clearChats: "مسح جميع المحادثات", resetSettings: "إعادة ضبط الإعدادات", close: "إغلاق", confirm: "تأكيد", cancel: "إلغاء", renameTitle: "تغيير اسم المحادثة", deleteTitle: "تأكيد الحذف", deleteMsg: "هل أنت متأكد من حذف هذه المحادثة وكل رسائلها؟", createFolderTitle: "إنشاء مجلد جديد", moveTitle: "نقل المحادثة إلى مجلد", uncategorized: "غير مصنف", foldersAll: "الكل", foldersUncat: "غير مصنف", libraryTitle: "📖 مكتبة الأوامر", libraryContent: `<strong>قائمة أوامر Nexara:</strong><br><br><code>/help</code> - عرض الأوامر المتاحة.<br><code>/rename [اسم جديد]</code> - تغيير عنوان المحادثة الحالية.<br><code>/delete</code> - حذف المحادثة الحالية.<br><code>/export</code> - تصدير المحادثة الحالية كملف نصي.<br><code>/folder [اسم المجلد]</code> - إنشاء مجلد جديد.<br><code>/move [اسم المجلد]</code> - نقل المحادثة إلى مجلد.<br><br><i>نصيحة: لا تضع شرطة مائلة (/) في نهاية الأمر.</i>`,
        create: "إنشاء", move: "نقل", save: "حفظ", delete: "حذف", renameFolder: "إعادة تسمية المجلد", deleteFolder: "حذف المجلد", deleteFolderMsg: "هل أنت متأكد من حذف هذا المجلد؟ سيتم نقل محادثاته إلى 'غير مصنف'.",
        msgNavTitle: "رسائلي"
    },
    fr: {
        appName: "Nexara", appTagline: "Espace d'assistant intelligent", newChat: "Nouveau chat", folders: "Dossiers", searchPlaceholder: "Rechercher dans les chats...", recentChats: "Chats récents", commandLibrary: "Bibliothèque de commandes", settings: "Paramètres", appTitle: "Assistant Nexara", appDesc: "Version interactive complète", greeting: "Bonjour, comment puis-je vous aider aujourd'hui ?", inputPlaceholder: "Tapez votre message ici...", web: "Web", code: "Code", voice: "Voix", file: "Fichier", version: "Nexara 0.1", settingsTitle: "Paramètres", darkMode: "Mode sombre", interfaceLang: "Langue de l'interface", clearChats: "Effacer tous les chats", resetSettings: "Réinitialiser les paramètres", close: "Fermer", confirm: "Confirmer", cancel: "Annuler", renameTitle: "Renommer la conversation", deleteTitle: "Confirmer la suppression", deleteMsg: "Êtes-vous sûr de vouloir supprimer cette conversation et tous ses messages ?", createFolderTitle: "Créer un nouveau dossier", moveTitle: "Déplacer la conversation vers un dossier", uncategorized: "Non classé", foldersAll: "Tout", foldersUncat: "Non classé", libraryTitle: "📖 Bibliothèque de commandes", libraryContent: `<strong>Liste des commandes Nexara :</strong><br><br><code>/help</code> - Afficher les commandes disponibles.<br><code>/rename [nouveau nom]</code> - Renommer la conversation actuelle.<br><code>/delete</code> - Supprimer la conversation actuelle.<br><code>/export</code> - Exporter la conversation actuelle en fichier texte.<br><code>/folder [nom du dossier]</code> - Créer un nouveau dossier.<br><code>/move [nom du dossier]</code> - Déplacer la conversation vers un dossier.<br><br><i>Astuce : Ne mettez pas de barre oblique (/) à la fin.</i>`,
        create: "Créer", move: "Déplacer", save: "Enregistrer", delete: "Supprimer", renameFolder: "Renommer le dossier", deleteFolder: "Supprimer le dossier", deleteFolderMsg: "Voulez-vous vraiment supprimer ce dossier ? Ses conversations seront déplacées vers 'Non classé'.",
        msgNavTitle: "Mes messages"
    },
    fa: {
        appName: "Nexara", newChat: "گفتگوی جدید", folders: "پوشه‌ها", searchPlaceholder: "جستجو در گفتگوها...", recentChats: "گفتگوهای اخیر", commandLibrary: "کتابخانه دستورات", settings: "تنظیمات", web: "وب", code: "کد", voice: "صدا", file: "پرونده", clearChats: "پاک کردن همه گفتگوها", resetSettings: "بازنشانی تنظیمات", close: "بستن", confirm: "تایید", cancel: "لغو", createFolderTitle: "ایجاد پوشه جدید", moveTitle: "انتقال گفتگو به پوشه", uncategorized: "دسته‌بندی نشده", foldersAll: "همه", foldersUncat: "دسته‌بندی نشده", libraryTitle: "📖 کتابخانه دستورات",
        create: "ایجاد", move: "انتقال", save: "ذخیره", delete: "حذف", renameFolder: "تغییر نام پوشه", deleteFolder: "حذف پوشه", deleteFolderMsg: "آیا مطمئن هستید که می‌خواهید این پوشه را حذف کنید؟ گفتگوهای آن به 'دسته‌بندی نشده' منتقل می‌شوند.",
        appTitle: "دستیار Nexara", appDesc: "نسخه تعاملی کامل", greeting: "سلام، امروز چگونه می‌توانم به شما کمک کنم؟", inputPlaceholder: "پیام خود را اینجا بنویسید...", version: "Nexara 0.1", settingsTitle: "تنظیمات", darkMode: "حالت تاریک", interfaceLang: "زبان رابط", renameTitle: "تغییر نام گفتگو", deleteTitle: "تایید حذف", deleteMsg: "آیا مطمئن هستید که می‌خواهید این گفتگو و تمام پیام‌های آن را حذف کنید؟", libraryContent: `<strong>لیست دستورات Nexara:</strong><br><br><code>/help</code> - نمایش دستورات موجود.<br><code>/rename [نام جدید]</code> - تغییر نام گفتگوی فعلی.<br><code>/delete</code> - حذف گفتگوی فعلی.<br><code>/export</code> - صادر کردن گفتگوی فعلی به صورت فایل متنی.<br><code>/folder [نام پوشه]</code> - ایجاد پوشه جدید.<br><code>/move [نام پوشه]</code> - انتقال گفتگو به پوشه.<br><br><i>نکته: در انتهای دستور خط مورب (/) قرار ندهید.</i>`,
        msgNavTitle: "پیام‌های من"
    },
    zh: {
        appName: "Nexara", appTagline: "智能助理空间", newChat: "新聊天", folders: "文件夹", searchPlaceholder: "在聊天中搜索...", recentChats: "最近聊天", commandLibrary: "命令库", settings: "设置", appTitle: "Nexara 助手", appDesc: "完整交互版本", greeting: "你好，今天我能帮你什么？", inputPlaceholder: "在此输入您的消息...", web: "网络", code: "代码", voice: "语音", file: "文件", version: "Nexara 0.1", settingsTitle: "设置", darkMode: "深色模式", interfaceLang: "界面语言", clearChats: "清除所有聊天", resetSettings: "重置设置", close: "关闭", confirm: "确认", cancel: "取消", renameTitle: "重命名对话", deleteTitle: "确认删除", deleteMsg: "您确定要删除此对话及其所有消息吗？", createFolderTitle: "创建新文件夹", moveTitle: "将对话移至文件夹", uncategorized: "未分类", foldersAll: "全部", foldersUncat: "未分类", libraryTitle: "📖 命令库", libraryContent: `<strong>Nexara 命令列表：</strong><br><br><code>/help</code> - 显示可用命令。<br><code>/rename [新名称]</code> - 重命名当前对话。<br><code>/delete</code> - 删除当前对话。<br><code>/export</code> - 将当前对话导出为文本文件。<br><code>/folder [文件夹名称]</code> - 创建新文件夹。<br><code>/move [文件夹名称]</code> - 将当前对话移至文件夹。<br><br><i>提示：结尾不要加斜杠 (/)。</i>`,
        create: "创建", move: "移动", save: "保存", delete: "删除", renameFolder: "重命名文件夹", deleteFolder: "删除文件夹", deleteFolderMsg: "您确定要删除此文件夹吗？其对话将被移至'未分类'。",
        msgNavTitle: "我的消息"
    },
    ja: {
        appName: "Nexara", appTagline: "スマートアシスタントスペース", newChat: "新しいチャット", folders: "フォルダ", searchPlaceholder: "チャットを検索...", recentChats: "最近のチャット", commandLibrary: "コマンドライブラリ", settings: "設定", appTitle: "Nexara アシスタント", appDesc: "フルインタラクティブ版", greeting: "こんにちは、今日はどのようにお手伝いしましょうか？", inputPlaceholder: "ここにメッセージを入力...", web: "ウェブ", code: "コード", voice: "音声", file: "ファイル", version: "Nexara 0.1", settingsTitle: "設定", darkMode: "ダークモード", interfaceLang: "インターフェース言語", clearChats: "すべてのチャットをクリア", resetSettings: "設定をリセット", close: "閉じる", confirm: "確認", cancel: "キャンセル", renameTitle: "会話名を変更", deleteTitle: "削除の確認", deleteMsg: "この会話とすべてのメッセージを削除してもよろしいですか？", createFolderTitle: "新しいフォルダを作成", moveTitle: "会話をフォルダに移動", uncategorized: "未分類", foldersAll: "すべて", foldersUncat: "未分類", libraryTitle: "📖 コマンドライブラリ", libraryContent: `<strong>Nexara コマンド一覧：</strong><br><br><code>/help</code> - 利用可能なコマンドを表示。<br><code>/rename [新しい名前]</code> - 現在の会話名を変更。<br><code>/delete</code> - 現在の会話を削除。<br><code>/export</code> - 現在の会話をテキストファイルとしてエクスポート。<br><code>/folder [フォルダ名]</code> - 新しいフォルダを作成。<br><code>/move [フォルダ名]</code> - 現在の会話をフォルダに移動。<br><br><i>ヒント：最後にスラッシュ (/) を付けないでください。</i>`,
        create: "作成", move: "移動", save: "保存", delete: "削除", renameFolder: "フォルダ名を変更", deleteFolder: "フォルダを削除", deleteFolderMsg: "このフォルダを削除してもよろしいですか？会話は'未分類'に移動されます。",
        msgNavTitle: "私のメッセージ"
    }
};

/* ======================================================================
   دوال الإعدادات والترجمة
   ====================================================================== */
function loadSettings() {
    try {
        const saved = localStorage.getItem('nexara_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            userSettings = { ...userSettings, ...parsed };
        } else {
            userSettings.theme = 'dark'; userSettings.lang = 'en';
            saveSettings();
        }
    } catch (e) { console.error('خطأ في تحميل الإعدادات:', e); }
    applySettings();
}

function saveSettings() {
    try { localStorage.setItem('nexara_settings', JSON.stringify(userSettings)); } catch (e) { console.error('خطأ في حفظ الإعدادات:', e); }
}

function applySettings() {
    document.documentElement.setAttribute('data-theme', userSettings.theme);
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.className = userSettings.theme === 'dark' ? 'toggle-switch active' : 'toggle-switch';
    applyLanguage(userSettings.lang);
}

async function applyLanguage(langCode) {
    const fallback = TRANSLATIONS['en'];
    const langData = TRANSLATIONS[langCode] || {};
    const t = { ...fallback, ...langData };
    if (!t) return;
    const el = (id) => document.getElementById(id);

    if (el('appName')) el('appName').innerText = t.appName;
    if (el('appTagline')) el('appTagline').innerText = t.appTagline;
    if (el('appTitle')) el('appTitle').innerText = t.appTitle;
    if (el('appDesc')) el('appDesc').innerText = t.appDesc;
    if (el('greetingText')) el('greetingText').innerText = t.greeting;
    if (el('newChatText')) el('newChatText').innerText = t.newChat;
    if (el('foldersTitle')) el('foldersTitle').innerText = t.folders;
    if (el('searchInput')) el('searchInput').placeholder = t.searchPlaceholder;
    if (el('recentChatsTitle')) el('recentChatsTitle').innerText = t.recentChats;
    if (el('userInput')) el('userInput').placeholder = t.inputPlaceholder;
    if (el('webText')) el('webText').innerText = t.web;
    if (el('codeText')) el('codeText').innerText = t.code;
    if (el('voiceText')) el('voiceText').innerText = t.voice;
    if (el('settingsText')) el('settingsText').innerText = t.settings;
    if (el('cmdLibraryText')) el('cmdLibraryText').innerText = t.commandLibrary;
    if (el('versionText')) el('versionText').innerText = t.version;
    if (el('settingsTitle')) el('settingsTitle').innerText = t.settingsTitle;
    if (el('themeLabel')) el('themeLabel').innerText = t.darkMode;
    if (el('langLabel')) el('langLabel').innerText = t.interfaceLang;
    if (el('msgNavTitle')) el('msgNavTitle').innerText = t.msgNavTitle;

    document.documentElement.dir = (langCode === 'ar' || langCode === 'fa') ? 'rtl' : 'ltr';

    await loadFolders();

    const overlay = document.getElementById('settingsOverlay');
    if (overlay) {
        const btns = overlay.querySelectorAll('button');
        if (btns.length >= 2) { btns[0].innerText = t.clearChats; btns[1].innerText = t.resetSettings; }
        const closeBtn = overlay.querySelector('.modal-btn.cancel');
        if (closeBtn) closeBtn.innerText = t.close;
    }
    updateSelectedLangText();
}

function initLanguageSelect() {
    const trigger = document.getElementById('langSelectTrigger');
    const wrapper = document.getElementById('langSelectWrapper');
    const optionsContainer = document.getElementById('langOptions');
    if (!trigger || !wrapper || !optionsContainer) return;
    if (optionsContainer.children.length > 0) return;
    const languages = [
        { value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' },
        { value: 'fr', label: 'Français' }, { value: 'fa', label: 'فارسی' },
        { value: 'zh', label: '中文' }, { value: 'ja', label: '日本語' }
    ];
    languages.forEach(lang => {
        const div = document.createElement('div'); div.className = 'custom-option'; div.dataset.value = lang.value; div.innerText = lang.label;
        if (lang.value === userSettings.lang) div.classList.add('selected');
        div.addEventListener('click', function (e) {
            e.stopPropagation();
            const val = this.dataset.value;
            changeLanguage(val);
            document.querySelectorAll('.custom-option').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            wrapper.classList.remove('open');
            updateSelectedLangText();
        });
        optionsContainer.appendChild(div);
    });
    trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        wrapper.classList.toggle('open');
    });
    document.removeEventListener('click', closeDropdown);
    document.addEventListener('click', closeDropdown);
    function closeDropdown(e) {
        if (!wrapper.contains(e.target)) wrapper.classList.remove('open');
    }
}

function updateSelectedLangText() {
    const selectedText = document.getElementById('selectedLangText');
    const options = document.querySelectorAll('.custom-option');
    if (!selectedText) return;
    options.forEach(opt => { if (opt.classList.contains('selected')) selectedText.innerText = opt.innerText; });
}

function toggleTheme() { userSettings.theme = userSettings.theme === 'dark' ? 'light' : 'dark'; saveSettings(); applySettings(); }
async function changeLanguage(langCode) { userSettings.lang = langCode; saveSettings(); await applySettings(); }

function showCustomConfirm(title, message, onConfirm, onCancel = null) {
    const overlay = document.getElementById('confirmModalOverlay');
    if (!overlay) { if (confirm(message)) onConfirm(); return; }
    document.getElementById('confirmModalTitle').innerText = title;
    document.getElementById('confirmModalMessage').innerText = message;
    overlay.classList.add('show');
    const confirmBtn = document.getElementById('confirmModalConfirmBtn');
    const cancelBtn = document.getElementById('confirmModalCancelBtn');
    const cleanup = () => {
        overlay.classList.remove('show');
        confirmBtn.onclick = null; cancelBtn.onclick = null;
    };
    confirmBtn.onclick = function () { cleanup(); if (onConfirm) onConfirm(); };
    cancelBtn.onclick = function () { cleanup(); if (onCancel) onCancel(); };
    overlay.onclick = function (e) { if (e.target === overlay && onCancel) { cleanup(); onCancel(); } };
}

function openResetSettingsConfirm() {
    showCustomConfirm("Reset Settings", "Are you sure you want to reset all settings to default?", function () {
        localStorage.removeItem('nexara_settings');
        loadSettings();
        closeSettings();
    });
}

function openClearChatsConfirm() {
    showCustomConfirm("Clear All Chats", "⚠️ This will permanently delete ALL your conversations and messages. Are you sure?", async function () {
        try {
            const response = await fetch('/api/clear_all_chats', { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                currentConversationId = null;
                const chatContainer = document.getElementById('chatBox');
                if (chatContainer) {
                    chatContainer.innerHTML = '<div class="landing-greeting" id="landingGreeting"><h1 id="greetingText">Hello, how can I help you today?</h1></div>';
                    applyLanguage(userSettings.lang);
                }
                await loadSessionsList(activeFolderId);
                closeSettings();
            } else { console.error("Error clearing chats: " + data.error); }
        } catch (e) { console.error(e); }
    });
}

function openSettings() {
    const overlay = document.getElementById('settingsOverlay');
    if (overlay) { overlay.style.display = 'flex'; initLanguageSelect(); }
}
function closeSettings() { document.getElementById('settingsOverlay').style.display = 'none'; }

function initApp() {
    try {
        loadSettings();
        const sendBtn = document.getElementById('sendBtn');
        const userInput = document.getElementById('userInput');
        const newChatBtn = document.getElementById('newChatBtn');
        const sidebarToggle = document.getElementById('topSidebarToggle');
        const msgNavBtn = document.getElementById('msgNavBtn');

        if (sendBtn) sendBtn.addEventListener('click', sendMessage);
        if (userInput) {
            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            });
            userInput.addEventListener('input', autoResizeTextarea);
            userInput.addEventListener('paste', handlePaste);
        }
        if (newChatBtn) newChatBtn.addEventListener('click', () => createNewChat(activeFolderId));
        if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
        if (msgNavBtn) msgNavBtn.addEventListener('click', openMessageNav);

        setupModeSelectors();
        setupModalListeners();
        setupVoiceRecognition();
        setupSearchFeature();

        fetch('/api/current_session')
            .then(res => res.json())
            .then(data => {
                if (data && data.id) { currentConversationId = data.id; loadHistory(currentConversationId); }
                else { createNewChat(activeFolderId); }
                loadFolders();
                loadSessionsList(activeFolderId);
            })
            .catch(error => console.error('خطأ في التهيئة:', error));
    } catch (e) { console.error('خطأ فادح في التهيئة:', e); }
}

// ==========================================
// الدوال الأساسية
// ==========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (window.innerWidth <= 768) { sidebar.classList.toggle('open'); overlay.classList.toggle('active'); }
    else { sidebar.classList.toggle('collapsed'); }
}

async function loadFolders() {
    try {
        const response = await fetch('/api/folders');
        const folders = await response.json();
        const container = document.getElementById('foldersList');
        if (!container) return;
        container.innerHTML = '';
        const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[userSettings.lang] || {}) };
        const createFolderBtn = (id, name, isSpecial = false) => {
            const btn = document.createElement('div'); btn.className = 'folder-item' + (activeFolderId === id ? ' active' : '');
            btn.onclick = () => switchFolder(id);
            let icon = 'fa-solid fa-folder';
            if (id === null) icon = 'fa-solid fa-inbox';
            else if (id === 0) icon = 'fa-regular fa-folder-open';
            let controlsHtml = '';
            if (!isSpecial) {
                controlsHtml = `<div class="folder-controls" onclick="event.stopPropagation();"><i class="fa-regular fa-pen-to-square" onclick="openFolderRenameModal(${id}, '${escapeHTML(name)}')"></i><i class="fa-regular fa-trash-can" onclick="openFolderDeleteModal(${id})"></i></div>`;
            }
            btn.innerHTML = `<i class="${icon}"></i><span class="folder-name">${escapeHTML(name)}</span>${controlsHtml}`;
            return btn;
        };
        container.appendChild(createFolderBtn(null, t.foldersAll || 'All', true));
        container.appendChild(createFolderBtn(0, t.foldersUncat || 'Uncategorized', true));
        folders.forEach(folder => { container.appendChild(createFolderBtn(folder.id, folder.name, false)); });
    } catch (error) { console.error('خطأ في تحميل المجلدات:', error); }
}

async function createNewChat(folderId) {
    try {
        const response = await fetch('/api/new_session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder_id: folderId || 0, lang: userSettings.lang }) });
        const data = await response.json();
        if (data && data.id) {
            currentConversationId = data.id;
            const chatContainer = document.getElementById('chatBox');
            if (chatContainer) {
                chatContainer.innerHTML = '<div class="landing-greeting" id="landingGreeting"><h1 id="greetingText">Hello, how can I help you today?</h1></div>';
                applyLanguage(userSettings.lang);
            }
            await loadSessionsList(activeFolderId);
            return true;
        }
        return false;
    } catch (error) { console.error('خطأ في إنشاء محادثة جديدة:', error); return false; }
}

// ==========================================
// دالة توسيع Textarea
// ==========================================
function autoResizeTextarea() {
    const textarea = document.getElementById('userInput');
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// ==========================================
// دوال رفع الملفات
// ==========================================
function handleFileSelect(input) {
    if (!input.files || input.files.length === 0) return;
    for (let i = 0; i < input.files.length; i++) {
        addPendingFile(input.files[i]);
    }
    input.value = '';
}

function handlePaste(e) {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
        const item = items[index];
        if (item.kind === 'file') {
            const blob = item.getAsFile();
            addPendingFile(blob);
        }
    }
}

function addPendingFile(file) {
    if (file.size > 200 * 1024 * 1024) {
        appendMessage('bot', '❌ File too large. Maximum size is 200MB.');
        return;
    }
    pendingFiles.push(file);
    renderFilePreview();
}

function removePendingFile(index) {
    pendingFiles.splice(index, 1);
    renderFilePreview();
}

function renderFilePreview() {
    const area = document.getElementById('filePreviewArea');
    if (!area) return;
    if (pendingFiles.length === 0) {
        area.style.display = 'none';
        area.innerHTML = '';
        return;
    }
    area.style.display = 'flex';
    area.innerHTML = '';
    pendingFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-preview-item';
        let icon = 'fa-regular fa-file';
        if (file.type.startsWith('image/')) icon = 'fa-regular fa-image';
        else if (file.type.startsWith('video/')) icon = 'fa-regular fa-file-video';
        const nameDisplay = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
        item.innerHTML = `
            <i class="${icon}"></i>
            <span>${escapeHTML(nameDisplay)} (${(file.size / 1024).toFixed(1)}KB)</span>
            <i class="fa-solid fa-xmark remove-preview-btn" onclick="removePendingFile(${index})"></i>
        `;
        area.appendChild(item);
    });
}

// ==========================================
// دوال التنقل والمحادثات
// ==========================================
function switchFolder(folderId) { activeFolderId = folderId; loadFolders(); loadSessionsList(activeFolderId); }

async function loadSessionsList(folderId = null) {
    try {
        let url = '/api/sessions';
        if (folderId !== null && folderId !== undefined) url += `?folder_id=${folderId}`;
        const response = await fetch(url);
        const sessions = await response.json();
        const sessionsContainer = document.getElementById('conversationsList');
        if (!sessionsContainer) return;
        sessionsContainer.innerHTML = '';
        sessions.forEach(session => {
            const card = document.createElement('div'); card.classList.add('chat-item'); card.dataset.conversationId = session.id;
            if (session.id === currentConversationId) card.classList.add('active');
            const textContainer = document.createElement('div'); textContainer.className = 'chat-item-text'; textContainer.onclick = () => switchConversation(session.id);
            const titleH4 = document.createElement('h4'); titleH4.innerText = escapeHTML(session.title); textContainer.appendChild(titleH4);
            card.appendChild(textContainer);
            const actionsContainer = document.createElement('div'); actionsContainer.className = 'chat-item-actions';
            const moveBtn = document.createElement('i'); moveBtn.className = 'fa-solid fa-arrow-right-arrow-left action-btn'; moveBtn.addEventListener('click', (e) => { e.stopPropagation(); openMoveModal(session.id); }); actionsContainer.appendChild(moveBtn);
            const renameBtn = document.createElement('i'); renameBtn.className = 'fa-regular fa-pen-to-square action-btn'; renameBtn.addEventListener('click', (e) => { e.stopPropagation(); openRenameModal(session.id, session.title); }); actionsContainer.appendChild(renameBtn);
            const deleteBtn = document.createElement('i'); deleteBtn.className = 'fa-regular fa-trash-can action-btn'; deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); openDeleteModal(session.id); }); actionsContainer.appendChild(deleteBtn);
            card.appendChild(actionsContainer);
            sessionsContainer.appendChild(card);
        });
    } catch (error) { console.error('❌ خطأ في جلب المحادثات:', error); }
}

async function switchConversation(conversationId) {
    if (currentConversationId === conversationId) return;
    currentConversationId = conversationId;
    if (window.innerWidth <= 768) toggleSidebar();
    await loadHistory(conversationId);
    await loadSessionsList(activeFolderId);
}

async function loadHistory(conversationId) {
    const chatContainer = document.getElementById('chatBox');
    if (chatContainer) chatContainer.innerHTML = '';
    try {
        const response = await fetch('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversation_id: conversationId }) });
        const messages = await response.json();
        messages.forEach(msg => {
            appendMessage(msg.role === 'user' ? 'user' : 'bot', msg.content, msg.id);
        });
    } catch (error) { console.error('خطأ في تحميل الرسائل:', error); }
}

async function createFolder() {
    const name = document.getElementById('folderInput').value.trim();
    if (!name) return;
    try {
        const response = await fetch('/api/folders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
        const data = await response.json();
        if (data.success) { closeFolderModal(); loadFolders(); }
    } catch (error) { console.error('خطأ في إنشاء مجلد:', error); }
}

// ==========================================
// 🔥 دالة إرسال التقييم (مُحسنة بصرياً)
// ==========================================
async function sendFeedback(messageId, type, likeBtn, dislikeBtn) {
    if (!messageId) {
        console.error("Message ID missing - Feedback cannot be saved.");
        return;
    }

    // إضافة تأثير بصري فوري
    likeBtn.style.pointerEvents = 'none';
    dislikeBtn.style.pointerEvents = 'none';

    // التبديل الحالة
    if (type === 'like') {
        likeBtn.classList.add('liked');
        dislikeBtn.classList.remove('disliked');
    } else {
        dislikeBtn.classList.add('disliked');
        likeBtn.classList.remove('liked');
    }

    try {
        const response = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message_id: messageId, type: type })
        });
        const data = await response.json();

        if (!data.success) {
            console.error("Feedback error:", data.error);
            // إذا فشل، قم بإرجاع الحالة السابقة (اختياري)
            if (type === 'like') {
                likeBtn.classList.remove('liked');
            } else {
                dislikeBtn.classList.remove('disliked');
            }
        }
    } catch (error) {
        console.error("Network error:", error);
        // إلغاء التغيير في حالة الخطأ
        if (type === 'like') {
            likeBtn.classList.remove('liked');
        } else {
            dislikeBtn.classList.remove('disliked');
        }
    } finally {
        // إعادة تفعيل الأزرار
        likeBtn.style.pointerEvents = 'auto';
        dislikeBtn.style.pointerEvents = 'auto';
    }
}

// ==========================================
// 🔥 دالة الإرسال الرئيسية
// ==========================================
async function sendMessage() {
    const inputElement = document.getElementById('userInput');
    if (!inputElement) return;
    const messageText = inputElement.value.trim();
    if (!messageText && pendingFiles.length === 0) return;
    const greeting = document.getElementById('landingGreeting');
    if (greeting) greeting.remove();
    if (!currentConversationId) {
        const success = await createNewChat(activeFolderId);
        if (!success) { appendMessage('bot', '⚠️ Failed to start a new chat.'); return; }
    }
    let userDisplayText = messageText;
    if (pendingFiles.length > 0) {
        const fileNames = pendingFiles.map(f => f.name).join(', ');
        userDisplayText = `📎 [${fileNames}] ${messageText}`;
    }
    appendMessage('user', userDisplayText, null);
    inputElement.value = '';
    inputElement.style.height = 'auto';
    inputElement.style.height = inputElement.scrollHeight + 'px';
    const filesToSend = [...pendingFiles];
    pendingFiles = [];
    renderFilePreview();
    const typingIndicator = appendTypingIndicator();
    try {
        let finalResponse = "";
        let finalMessageId = null;

        if (filesToSend.length > 0) {
            const file = filesToSend[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('conversation_id', currentConversationId);
            formData.append('lang', userSettings.lang);
            formData.append('mode', currentMode);
            formData.append('search_mode', userSettings.searchMode || 'web');
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
            const uploadData = await uploadRes.json();
            if (uploadData.success) {
                if (uploadData.conversation_id && uploadData.conversation_id !== currentConversationId) {
                    currentConversationId = uploadData.conversation_id;
                }
                finalResponse = uploadData.response;
                finalMessageId = uploadData.message_id;
            } else {
                finalResponse = `❌ Error uploading file: ${uploadData.error}`;
                if (typingIndicator) typingIndicator.remove();
                appendMessage('bot', finalResponse, null);
                await loadSessionsList(activeFolderId);
                return;
            }
        }

        if (messageText) {
            const predictRes = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: messageText,
                    mode: currentMode,
                    conversation_id: currentConversationId,
                    lang: userSettings.lang,
                    search_mode: userSettings.searchMode || 'web'
                })
            });
            const predictData = await predictRes.json();
            finalResponse = finalResponse ? finalResponse + "\n\n" + predictData.response : predictData.response;
            if (!finalMessageId) finalMessageId = predictData.message_id;
        }

        if (typingIndicator) typingIndicator.remove();
        appendMessage('bot', finalResponse, finalMessageId);
        await loadSessionsList(activeFolderId);
    } catch (error) {
        if (typingIndicator) typingIndicator.remove();
        appendMessage('bot', '❌ Failed to connect to server. Make sure the server is running.', null);
    }
}

// ==========================================
// 🔥 دوال عرض الرسائل
// ==========================================
function appendMessage(sender, text, msgId = null) {
    const chatContainer = document.getElementById('chatBox');
    if (!chatContainer) return;
    const wrapper = document.createElement('div'); wrapper.className = sender === 'user' ? 'message-wrapper user' : 'message-wrapper bot';
    let contentHTML = '';
    if (sender === 'user') {
        contentHTML = `
            <div class="avatar-text user-av">U</div>
            <div class="message-content">
                <div class="message-box">${escapeHTML(text)}</div>
                <div class="message-actions">
                    <i class="fa-regular fa-copy copy-btn" title="Copy message"></i>
                </div>
            </div>
        `;
    } else {
        let formattedText = text;
        formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--primary-teal); text-decoration: underline; font-weight: bold;">$1</a>');
        formattedText = formattedText.replace(/\n/g, '<br>');

        contentHTML = `
            <img src="/static/logo-removebg-preview.png?v=4" class="avatar-img bot-av" alt="Nexara">
            <div class="message-content">
                <div class="message-box">${formattedText}</div>
                <div class="message-actions">
                    <i class="fa-regular fa-copy copy-btn" title="Copy message"></i>
                    ${msgId ? `
                    <i class="fa-regular fa-thumbs-up feedback-btn" id="like-${msgId}" title="Like"></i>
                    <i class="fa-regular fa-thumbs-down feedback-btn" id="dislike-${msgId}" title="Dislike"></i>
                    ` : ''}
                </div>
            </div>
        `;
    }
    wrapper.innerHTML = contentHTML;
    chatContainer.appendChild(wrapper);

    const copyBtn = wrapper.querySelector('.copy-btn');
    if (copyBtn) {
        copyBtn.onclick = (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.className = 'fa-solid fa-check copy-btn';
                setTimeout(() => { copyBtn.className = 'fa-regular fa-copy copy-btn'; }, 1500);
            }).catch(err => console.error('Failed to copy: ', err));
        };
    }

    // 🔥 ربط أحداث التقييم فقط إذا كان msgId موجوداً
    if (sender === 'bot' && msgId) {
        const likeBtn = wrapper.querySelector('#like-' + msgId);
        const dislikeBtn = wrapper.querySelector('#dislike-' + msgId);
        if (likeBtn && dislikeBtn) {
            likeBtn.onclick = () => sendFeedback(msgId, 'like', likeBtn, dislikeBtn);
            dislikeBtn.onclick = () => sendFeedback(msgId, 'dislike', likeBtn, dislikeBtn);
        }
    }

    setTimeout(() => { chatContainer.scrollTop = chatContainer.scrollHeight; }, 100);
}

function appendTypingIndicator() {
    const chatContainer = document.getElementById('chatBox');
    if (!chatContainer) return null;
    const wrapper = document.createElement('div'); wrapper.className = 'message-wrapper bot';
    wrapper.innerHTML = `<img src="/static/logo-removebg-preview.png?v=4" class="avatar-img bot-av" alt="Nexara"><div class="message-box"><i class="fa-solid fa-circle-notch fa-spin"></i> Thinking...</div>`;
    chatContainer.appendChild(wrapper);
    setTimeout(() => { chatContainer.scrollTop = chatContainer.scrollHeight; }, 100);
    return wrapper;
}

// ==========================================
// دوال الصوت والإعدادات
// ==========================================
function setupVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { console.warn("المتصفح الحالي لا يدعم تحويل الصوت إلى نص."); const voiceBtn = document.getElementById('voiceTool'); if (voiceBtn) voiceBtn.style.opacity = '0.5'; return; }
    recognition = new SpeechRecognition(); recognition.lang = 'ar-SA'; recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = function () { isListening = true; clearTimeout(silenceTimer); silenceTimer = setTimeout(() => { if (isListening) { recognition.stop(); } }, 3000); };
    recognition.onresult = function (event) { clearTimeout(silenceTimer); silenceTimer = setTimeout(() => { if (isListening) { recognition.stop(); } }, 3000); const transcript = event.results[0][0].transcript; const inputField = document.getElementById('userInput'); if (inputField) { inputField.value = transcript; inputField.focus(); inputField.setSelectionRange(transcript.length, transcript.length); } };
    recognition.onend = function () { clearTimeout(silenceTimer); isListening = false; const voiceBtn = document.getElementById('voiceTool'); if (voiceBtn) { voiceBtn.classList.remove('listening-mode'); voiceBtn.innerHTML = `<div class="mic-container"><i class="fa-solid fa-microphone"></i><div class="wave"></div><div class="wave"></div><div class="wave"></div><div class="wave"></div><div class="wave"></div></div> Voice`; } };
    recognition.onerror = function (event) { console.warn('خطأ في التعرف الصوتي:', event.error); recognition.onend(); };
}

function toggleVoiceRecording() {
    if (!recognition) { return; }
    const voiceBtn = document.getElementById('voiceTool');
    if (isListening) { recognition.stop(); return; }
    try { recognition.start(); isListening = true; voiceBtn.classList.add('listening-mode'); voiceBtn.innerHTML = `<div class="mic-container"><i class="fa-solid fa-microphone"></i><div class="wave"></div><div class="wave"></div><div class="wave"></div><div class="wave"></div><div class="wave"></div></div> Listening...`; } catch (error) { console.error('فشل بدء التسجيل:', error); recognition.onend(); }
}

function setupModeSelectors() {
    const modeButtons = document.querySelectorAll('.tool-tag');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const isCurrentlyActive = btn.classList.contains('active-mode');
            modeButtons.forEach(b => {
                b.classList.remove('active-mode');
                if (b.id === 'voiceTool') {
                    b.classList.remove('listening-mode');
                    b.innerHTML = `<div class="mic-container"><i class="fa-solid fa-microphone"></i><div class="wave"></div><div class="wave"></div><div class="wave"></div><div class="wave"></div><div class="wave"></div></div> Voice`;
                    if (isListening && recognition) {
                        recognition.stop();
                        isListening = false;
                    }
                }
            });
            if (!isCurrentlyActive) {
                btn.classList.add('active-mode');
                if (btn.id === 'webTool') { currentMode = 'web'; }
                else if (btn.id === 'codeTool') { currentMode = 'code'; }
                else if (btn.id === 'voiceTool') { currentMode = 'general'; toggleVoiceRecording(); }
                else { currentMode = 'general'; }
            } else {
                currentMode = 'general';
                if (btn.id === 'voiceTool' && isListening) {
                    recognition.stop();
                    isListening = false;
                }
            }
        });
    });
}

function setupSearchFeature() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    let searchTimeout = null;
    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        const query = this.value.toLowerCase().trim(); const items = document.querySelectorAll('.chat-item');
        searchTimeout = setTimeout(() => {
            let foundInTitle = false;
            items.forEach(item => { const title = item.querySelector('h4').innerText.toLowerCase(); if (title.includes(query)) { item.style.display = 'flex'; foundInTitle = true; } else { item.style.display = 'none'; } });
            if (!foundInTitle && query.length >= 2) {
                fetch(`/api/search_conversations?q=${encodeURIComponent(query)}`).then(response => response.json()).then(results => {
                    items.forEach(item => item.style.display = 'none');
                    results.forEach(res => { items.forEach(item => { if (parseInt(item.dataset.conversationId) === res.id) item.style.display = 'flex'; }); });
                }).catch(err => console.error('خطأ في البحث في المحتوى:', err));
            }
        }, 500);
    });
}

function setupModalListeners() {
    document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => { if (e.target === document.getElementById('modalOverlay')) closeModal(); });
    document.getElementById('modalConfirmBtn').addEventListener('click', executeModalAction);
}

// ==========================================
// دوال المودالات
// ==========================================
function openRenameModal(conversationId, currentTitle) {
    const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[userSettings.lang] || {}) };
    pendingAction = 'rename'; pendingConversationId = conversationId; pendingCurrentTitle = currentTitle;
    document.getElementById('modalTitle').innerText = t.renameTitle;
    document.getElementById('modalMessage').style.display = 'none';
    const input = document.getElementById('modalInput'); input.style.display = 'block'; input.value = currentTitle;
    document.getElementById('modalConfirmBtn').className = 'modal-btn confirm'; document.getElementById('modalConfirmBtn').innerText = t.save;
    document.getElementById('modalCancelBtn').innerText = t.cancel;
    document.getElementById('modalOverlay').classList.add('show'); input.focus(); input.select();
}

function openDeleteModal(conversationId) {
    const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[userSettings.lang] || {}) };
    pendingAction = 'delete'; pendingConversationId = conversationId;
    document.getElementById('modalTitle').innerText = t.deleteTitle;
    document.getElementById('modalMessage').style.display = 'block';
    document.getElementById('modalMessage').innerText = t.deleteMsg;
    document.getElementById('modalInput').style.display = 'none';
    document.getElementById('modalConfirmBtn').className = 'modal-btn danger'; document.getElementById('modalConfirmBtn').innerText = t.delete;
    document.getElementById('modalCancelBtn').innerText = t.cancel;
    document.getElementById('modalOverlay').classList.add('show');
}

function openFolderRenameModal(folderId, currentName) {
    const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[userSettings.lang] || {}) };
    pendingAction = 'rename_folder'; pendingFolderId = folderId;
    document.getElementById('modalTitle').innerText = t.renameFolder;
    document.getElementById('modalMessage').style.display = 'none';
    const input = document.getElementById('modalInput'); input.style.display = 'block'; input.value = currentName;
    document.getElementById('modalConfirmBtn').className = 'modal-btn confirm'; document.getElementById('modalConfirmBtn').innerText = t.save;
    document.getElementById('modalCancelBtn').innerText = t.cancel;
    document.getElementById('modalOverlay').classList.add('show'); input.focus(); input.select();
}

function openFolderDeleteModal(folderId) {
    const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[userSettings.lang] || {}) };
    pendingAction = 'delete_folder'; pendingFolderId = folderId;
    document.getElementById('modalTitle').innerText = t.deleteFolder;
    document.getElementById('modalMessage').style.display = 'block';
    document.getElementById('modalMessage').innerText = t.deleteFolderMsg;
    document.getElementById('modalInput').style.display = 'none';
    document.getElementById('modalConfirmBtn').className = 'modal-btn danger'; document.getElementById('modalConfirmBtn').innerText = t.delete;
    document.getElementById('modalCancelBtn').innerText = t.cancel;
    document.getElementById('modalOverlay').classList.add('show');
}

async function openMoveModal(conversationId) {
    const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[userSettings.lang] || {}) };
    moveConversationTargetId = conversationId;
    const select = document.getElementById('moveFolderSelect'); select.innerHTML = `<option value="0">${t.uncategorized}</option>`;
    try {
        const res = await fetch('/api/folders'); const folders = await res.json();
        folders.forEach(f => { const opt = document.createElement('option'); opt.value = f.id; opt.innerText = f.name; select.appendChild(opt); });
        document.getElementById('moveTitle').innerText = t.moveTitle;
        document.querySelector('#moveModalOverlay .modal-btn.confirm').innerText = t.move;
        document.querySelector('#moveModalOverlay .modal-btn.cancel').innerText = t.cancel;
        document.getElementById('moveModalOverlay').style.display = 'flex';
    } catch (e) { console.error('خطأ في تحميل المجلدات للنقل:', e); }
}
function closeMoveModal() { document.getElementById('moveModalOverlay').style.display = 'none'; moveConversationTargetId = null; }
async function executeMove() {
    if (!moveConversationTargetId) return;
    const folderId = parseInt(document.getElementById('moveFolderSelect').value);
    try {
        const response = await fetch('/api/move_conversation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversation_id: moveConversationTargetId, folder_id: folderId }) });
        const data = await response.json();
        if (data.success) { closeMoveModal(); loadSessionsList(activeFolderId); loadFolders(); }
    } catch (error) { console.error('خطأ في النقل:', error); }
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    confirmBtn.style.display = 'block'; confirmBtn.className = 'modal-btn confirm';
    const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[userSettings.lang] || {}) };
    confirmBtn.innerText = t.confirm; confirmBtn.onclick = executeModalAction;
    const cancelBtn = document.getElementById('modalCancelBtn');
    cancelBtn.innerText = t.cancel; cancelBtn.className = 'modal-btn cancel'; cancelBtn.onclick = closeModal;
    pendingAction = null; pendingConversationId = null; pendingFolderId = null;
}

async function executeModalAction() {
    if (!pendingAction) return;
    if (pendingAction === 'rename_folder') {
        const newName = document.getElementById('modalInput').value.trim();
        if (!newName) return closeModal();
        try { await fetch(`/api/folders/${pendingFolderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName }) }); closeModal(); loadFolders(); } catch (e) { console.error(e); }
        return;
    }
    if (pendingAction === 'delete_folder') {
        try { await fetch(`/api/folders/${pendingFolderId}`, { method: 'DELETE' }); closeModal(); if (activeFolderId === pendingFolderId) switchFolder(null); else loadFolders(); } catch (e) { console.error(e); }
        return;
    }
    if (!pendingConversationId) return;
    if (pendingAction === 'rename') {
        const newTitle = document.getElementById('modalInput').value.trim();
        if (!newTitle) { document.getElementById('modalMessage').style.display = 'block'; document.getElementById('modalMessage').innerText = '⚠️ You cannot leave the name empty!'; document.getElementById('modalMessage').style.color = '#e74c3c'; return; }
        await performRename(pendingConversationId, newTitle); closeModal();
    } else if (pendingAction === 'delete') {
        await performDelete(pendingConversationId); closeModal();
    }
}

async function performRename(conversationId, newTitle) {
    try {
        const response = await fetch(`/api/sessions/${conversationId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle }) });
        const data = await response.json();
        if (data.success) { await loadSessionsList(activeFolderId); if (currentConversationId === conversationId) { const titleElement = document.querySelector('.header-title h2'); if (titleElement) titleElement.innerText = newTitle; } }
    } catch (error) { console.error('حدث خطأ في الاتصال بالخادم.', error); }
}

async function performDelete(conversationId) {
    try {
        const response = await fetch(`/api/sessions/${conversationId}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            if (currentConversationId === conversationId) {
                currentConversationId = null;
                const chatContainer = document.getElementById('chatBox');
                if (chatContainer) { chatContainer.innerHTML = '<div class="landing-greeting" id="landingGreeting"><h1 id="greetingText">Hello, how can I help you today?</h1></div>'; applyLanguage(userSettings.lang); }
            }
            await loadSessionsList(activeFolderId);
        }
    } catch (error) { console.error('حدث خطأ في الاتصال بالخادم.', error); }
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

function openLibrary() {
    const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[userSettings.lang] || {}) };
    document.getElementById('modalTitle').innerText = t.libraryTitle || '📖 Command Library';
    document.getElementById('modalMessage').style.display = 'block';
    document.getElementById('modalMessage').innerHTML = t.libraryContent;
    document.getElementById('modalInput').style.display = 'none';
    const confirmBtn = document.getElementById('modalConfirmBtn'); confirmBtn.style.display = 'none';
    const cancelBtn = document.getElementById('modalCancelBtn');
    cancelBtn.innerText = t.close || 'Close';
    cancelBtn.className = 'modal-btn cancel';
    document.getElementById('modalOverlay').classList.add('show');
}

function openCreateFolderModal() {
    const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[userSettings.lang] || {}) };
    document.getElementById('createFolderTitle').innerText = t.createFolderTitle;
    document.querySelector('#folderModalOverlay .modal-btn.confirm').innerText = t.create;
    document.querySelector('#folderModalOverlay .modal-btn.cancel').innerText = t.cancel;
    document.getElementById('folderModalOverlay').style.display = 'flex';
    document.getElementById('folderInput').value = '';
    document.getElementById('folderInput').focus();
}
function closeFolderModal() { document.getElementById('folderModalOverlay').style.display = 'none'; }

async function openMessageNav() {
    if (!currentConversationId) return;
    const t = { ...TRANSLATIONS['en'], ...(TRANSLATIONS[userSettings.lang] || {}) };
    document.getElementById('msgNavTitle').innerText = t.msgNavTitle;
    const listContainer = document.getElementById('msgNavList');
    listContainer.innerHTML = '<p style="text-align:center; color:var(--text-gray);"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading...</p>';
    document.getElementById('msgNavOverlay').style.display = 'flex';
    try {
        const response = await fetch('/api/history', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversation_id: currentConversationId }) });
        const messages = await response.json();
        const userMessages = messages.filter(msg => msg.role === 'user');
        listContainer.innerHTML = '';
        if (userMessages.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; color:var(--text-gray);">No messages yet.</p>';
            return;
        }
        userMessages.forEach((msg, index) => {
            const originalIndex = messages.indexOf(msg);
            const item = document.createElement('div');
            item.className = 'msg-nav-item';
            const shortText = msg.content.length > 60 ? msg.content.substring(0, 60) + '...' : msg.content;
            item.innerHTML = `
                <div class="msg-nav-text">${escapeHTML(shortText)}</div>
            `;
            item.onclick = () => jumpToMessage(originalIndex);
            listContainer.appendChild(item);
        });
    } catch (error) {
        listContainer.innerHTML = '<p style="text-align:center; color:#e74c3c;">Error loading messages.</p>';
        console.error('Error loading message nav: ', error);
    }
}

function closeMsgNav() {
    document.getElementById('msgNavOverlay').style.display = 'none';
}

function jumpToMessage(index) {
    const chatBox = document.getElementById('chatBox');
    const messageWrappers = chatBox.querySelectorAll('.message-wrapper');
    if (messageWrappers.length > index) {
        const target = messageWrappers[index];
        closeMsgNav();
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.style.transition = 'background 0.3s ease';
        target.style.background = 'rgba(14, 210, 190, 0.2)';
        setTimeout(() => { target.style.background = 'transparent'; }, 1500);
    }
}

document.addEventListener('DOMContentLoaded', initApp);