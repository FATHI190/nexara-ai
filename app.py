import random
import sys
import re
import math
import os
import json
import time
import sqlite3
import requests
from flask import Flask, render_template, request, jsonify, g
from concurrent.futures import ThreadPoolExecutor, TimeoutError

from deep_translator import GoogleTranslator

sys.stdout.reconfigure(encoding='utf-8')
app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, 'chat.db')
USER_FILE = os.path.join(BASE_DIR, 'user.txt')
WEIGHTS_FILE = os.path.join(BASE_DIR, "nexara_weights.json")

temp_sessions = {}
temp_id_counter = 1000

try:
    translator = GoogleTranslator(source='auto', target='ar')
except Exception:
    translator = None
    print("⚠️ تنبيه: لم يتم تحميل الترجمة.")


def get_db():
    if 'db' not in g:
        try:
            g.db = sqlite3.connect(DATABASE, check_same_thread=False)
            g.db.row_factory = sqlite3.Row
        except Exception:
            return None
    return g.db


@app.teardown_appcontext
def close_connection(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()


# ======================================================================
# 🔥 تم نقل تهيئة قاعدة البيانات إلى هنا لتعمل مع Gunicorn على Render
# ======================================================================
try:
    with app.app_context():
        db = get_db()
        if db:
            db.execute('''
                CREATE TABLE IF NOT EXISTS conversations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            db.execute('''
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    conversation_id INTEGER NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            db.commit()
            print("✅ قاعدة البيانات تعمل بشكل طبيعي.")
except Exception as e:
    print(f"⚠️ قاعدة البيانات لم تعمل! لكن الخادم سيعمل بوضعية (الذاكرة المؤقتة).")


# ======================================================================
# دوال الذكاء الاصطناعي والرياضيات
# ======================================================================
def generate_math_data(op):
    X, Y = [], []
    for _ in range(500):
        n1, n2 = (random.randint(1, 100) if random.random() > 0.5 else random.randint(100000, 1000000000000),
                  random.randint(1, 100) if random.random() > 0.5 else random.randint(100000, 1000000000000))
        if op in ['*', '/']:
            scale = (n1 * n2)
        else:
            scale = (n1 + n2 if (n1 + n2) != 0 else 1)
        sqrt_scale = math.sqrt(scale) if op in ['*', '/'] else scale
        if sqrt_scale == 0:
            sqrt_scale = 1
        X.append([n1 / sqrt_scale, n2 / sqrt_scale])
        if op == '+':
            Y.append(1.0)
        elif op == '-':
            Y.append((n1 - n2) / scale)
        elif op == '*':
            Y.append((n1 * n2) / scale)
        elif op == '/':
            Y.append((n1 / n2) / (n1 / n2) if n1 != 0 and n2 != 0 else 1.0)
    return X, Y


def train_brain(X, Y, is_advanced=False, lr=0.1, epochs=2000):
    w1, w2, b = 0.0, 0.0, 0.0
    for _ in range(epochs):
        for i in range(len(X)):
            x1, x2, target = X[i][0], X[i][1], Y[i]
            pred = (x1 * x2) * w1 + \
                b if is_advanced else (x1 * w1) + (x2 * w2) + b
            error = target - pred
            w1 += error * (x1 * x2 if is_advanced else x1) * lr
            if not is_advanced:
                w2 += error * x2 * lr
            b += error * lr
    return (w1, b) if is_advanced else (w1, w2, b)


def save_weights(weights_dict):
    with open(WEIGHTS_FILE, "w", encoding="utf-8") as f:
        json.dump(weights_dict, f, indent=2)


def load_weights():
    if os.path.exists(WEIGHTS_FILE):
        with open(WEIGHTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


weights = load_weights()
if weights:
    w_p1, w_p2, b_p = weights['plus']
    w_m1, w_m2, b_m = weights['minus']
    w_mu, b_mu = weights['multiply']
    w_d, b_d = weights['divide']
    w_t, w_h, b_w = weights['weather']
    w_ex, w_hr, b_s = weights['study']
else:
    print("🔮 جاري تدريب نموذج Nexara من البداية...")
    X_p, Y_p = generate_math_data('+')
    w_p1, w_p2, b_p = train_brain(X_p, Y_p, epochs=1000)
    X_m, Y_m = generate_math_data('-')
    w_m1, w_m2, b_m = train_brain(X_m, Y_m, epochs=1000)
    X_mu, Y_mu = generate_math_data('*')
    w_mu, b_mu = train_brain(X_mu, Y_mu, is_advanced=True, epochs=1000)
    X_d, Y_d = generate_math_data('/')
    w_d, b_d = train_brain(X_d, Y_d, is_advanced=True, epochs=1000)
    w_t, w_h, b_w = train_brain([[25, 40], [40, 85], [22, 50], [42, 90], [18, 45]], [
                                1, 0, 1, 0, 1], lr=0.001, epochs=500)
    w_ex, w_hr, b_s = train_brain([[5, 0], [4, 1], [0, 4], [1, 5], [0, 2]], [
                                  0, 0, 1, 1, 1], lr=0.001, epochs=500)
    weights = {'plus': [w_p1, w_p2, b_p], 'minus': [w_m1, w_m2, b_m], 'multiply': [
        w_mu, b_mu], 'divide': [w_d, b_d], 'weather': [w_t, w_h, b_w], 'study': [w_ex, w_hr, b_s]}
    save_weights(weights)
    print("✅ تم تدريب الأوزان وحفظها بنجاح!")


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    try:
        user_id = get_user_id()
        db = get_db()
        if db is None:
            return jsonify([])
        cur = db.execute(
            "SELECT id, title, created_at FROM conversations WHERE user_id = ? ORDER BY id DESC", (user_id,))
        sessions = cur.fetchall()
        return jsonify([{'id': row['id'], 'title': row['title'], 'created_at': row['created_at']} for row in sessions])
    except Exception:
        return jsonify([])


@app.route('/api/current_session', methods=['GET'])
def get_current_session():
    try:
        user_id = get_user_id()
        db = get_db()
        if db is None:
            return jsonify({'id': None})
        cur = db.execute(
            "SELECT id FROM conversations WHERE user_id = ? ORDER BY id DESC LIMIT 1", (user_id,))
        row = cur.fetchone()
        if row:
            return jsonify({'id': row['id']})
        return jsonify({'id': None})
    except Exception:
        return jsonify({'id': None})


@app.route('/api/new_session', methods=['POST'])
def new_session():
    global temp_id_counter
    try:
        user_id = get_user_id()
        db = get_db()
        if db is not None:
            default_title = "محادثة جديدة"
            cur = db.execute(
                "INSERT INTO conversations (user_id, title) VALUES (?, ?)", (user_id, default_title))
            new_id = cur.lastrowid
            db.commit()
            return jsonify({'id': new_id, 'title': default_title})
        else:
            temp_id_counter += 1
            temp_sessions[temp_id_counter] = {
                "title": "محادثة جديدة (مؤقتة)", "messages": []}
            return jsonify({'id': temp_id_counter, 'title': "محادثة جديدة (مؤقتة)"})
    except Exception:
        temp_id_counter += 1
        temp_sessions[temp_id_counter] = {
            "title": "محادثة جديدة (مؤقتة)", "messages": []}
        return jsonify({'id': temp_id_counter, 'title': "محادثة جديدة (مؤقتة)"})


@app.route('/api/sessions/<int:session_id>', methods=['DELETE'])
def delete_session(session_id):
    try:
        user_id = get_user_id()
        db = get_db()
        if db is None:
            return jsonify({'success': False, 'error': 'Database error'}), 500
        cur = db.execute(
            "SELECT id FROM conversations WHERE id = ? AND user_id = ?", (session_id, user_id))
        if not cur.fetchone():
            return jsonify({'success': False, 'error': 'Conversation not found'}), 404
        db.execute("DELETE FROM messages WHERE conversation_id = ?",
                   (session_id,))
        db.execute("DELETE FROM conversations WHERE id = ?", (session_id,))
        db.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/sessions/<int:session_id>', methods=['PUT'])
def rename_session(session_id):
    try:
        data = request.get_json() or {}
        new_title = data.get('title', '').strip()
        if not new_title:
            return jsonify({'success': False, 'error': 'Title cannot be empty'}), 400
        user_id = get_user_id()
        db = get_db()
        if db is None:
            return jsonify({'success': False, 'error': 'Database error'}), 500
        cur = db.execute(
            "SELECT id FROM conversations WHERE id = ? AND user_id = ?", (session_id, user_id))
        if not cur.fetchone():
            return jsonify({'success': False, 'error': 'Conversation not found'}), 404
        db.execute("UPDATE conversations SET title = ? WHERE id = ?",
                   (new_title, session_id))
        db.commit()
        return jsonify({'success': True, 'title': new_title})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/history', methods=['POST'])
def get_history():
    data = request.get_json() or {}
    conv_id = data.get('conversation_id')
    if not conv_id:
        return jsonify([])
    try:
        db = get_db()
        if db is not None:
            cur = db.execute(
                "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY id ASC", (conv_id,))
            messages = cur.fetchall()
            return jsonify([{'role': row['role'], 'content': row['content']} for row in messages])
    except Exception:
        pass
    if conv_id in temp_sessions:
        return jsonify(temp_sessions[conv_id]['messages'])
    return jsonify([])


def translate_text(text):
    if not text or not translator:
        return text
    try:
        return translator.translate(text)
    except:
        return text


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json() or {}
        user_input = data.get('input', '').strip()
        mode = data.get('mode', 'general')
        conv_id = data.get('conversation_id')

        if not user_input:
            return jsonify({'response': '❌ من فضلك اكتب رسالة أولاً.'})

        db = get_db()
        is_memory_mode = False

        if conv_id in temp_sessions:
            is_memory_mode = True
            temp_sessions[conv_id]['messages'].append(
                {'role': 'user', 'content': user_input})
        else:
            if db is None:
                global temp_id_counter
                temp_id_counter += 1
                conv_id = temp_id_counter
                is_memory_mode = True
                temp_sessions[conv_id] = {"title": user_input[:30], "messages": [
                    {'role': 'user', 'content': user_input}]}
            else:
                cur = db.execute(
                    "SELECT title FROM conversations WHERE id = ?", (conv_id,))
                conv = cur.fetchone()
                if conv and conv['title'] == "محادثة جديدة":
                    new_title = user_input[:30] + \
                        ("..." if len(user_input) > 30 else "")
                    db.execute(
                        "UPDATE conversations SET title = ? WHERE id = ?", (new_title, conv_id))
                    db.commit()
                db.execute("INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
                           (conv_id, 'user', user_input))
                db.commit()

        final_response = ""

        if mode == 'web':
            try:
                search_success = False
                final_response = ""
                translated_query = translate_text(user_input)
                clean_eng_query = re.sub(
                    r'[^\w\s]', '', translated_query).strip()
                if not clean_eng_query:
                    clean_eng_query = user_input

                # 1. محاولة بحث DuckDuckGo سريعة جداً (مهلة 1.5 ثانية)
                try:
                    with ThreadPoolExecutor(max_workers=1) as executor:
                        future = executor.submit(lambda: requests.get(
                            f"https://api.duckduckgo.com/?q={clean_eng_query}&format=json&no_html=1&skip_disambig=1",
                            timeout=2
                        ))
                        response = future.result(timeout=1.5)
                        if response.status_code == 200:
                            data_ddg = response.json()
                            abstract = data_ddg.get('AbstractText', '')
                            if abstract and len(abstract) > 20:
                                clean_ddg = re.sub(r'[*\[\]=#]', '', abstract)
                                final_response = translate_text(clean_ddg)
                                search_success = True
                except (TimeoutError, Exception):
                    pass

                # 2. إذا فشل DuckDuckGo، حاول Wikipedia
                if not search_success:
                    try:
                        headers = {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                        wiki_url = f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles={clean_eng_query}&format=json&redirects=1"
                        response_wiki = requests.get(
                            wiki_url, headers=headers, timeout=3)
                        data_wiki = response_wiki.json()
                        pages = data_wiki.get('query', {}).get('pages', {})
                        for page_id, page_info in pages.items():
                            if page_id != '-1' and 'extract' in page_info:
                                extract = page_info['extract']
                                if extract and len(extract) > 30:
                                    clean_text = re.sub(
                                        r'[*\[\]=#]', '', extract)
                                    final_response = translate_text(clean_text)
                                    search_success = True
                                    break
                    except Exception:
                        pass

                # 3. إذا فشل الكل
                if not search_success:
                    final_response = "لم يعثر البحث على أي نتائج. تأكد من أن الخادم متصل بالإنترنت أو حاول لاحقاً."

            except Exception as e:
                final_response = f"حدث خطأ أثناء البحث. {str(e)}"

        elif mode == 'code':
            final_response = "تم توليد الكود."

        else:
            math_match = re.search(r'(\d+)\s*([\+\-\*/])\s*(\d+)', user_input)
            if math_match:
                n1, op, n2 = float(math_match.group(1)), math_match.group(
                    2), float(math_match.group(3))
                if op == '/':
                    if n2 == 0:
                        final_response = '❌ لا يمكن القسمة على صفر!'
                    else:
                        scale_m = n1 * n2
                        n1_s, n2_s = n1 / \
                            math.sqrt(scale_m), n2 / math.sqrt(scale_m)
                        ans = ((n1_s * n2_s) * w_d + b_d) * (n1 / n2)
                        final_output = int(round(ans)) if round(
                            ans, 4).is_integer() else round(ans, 4)
                        final_response = f"النتيجة الرياضية: {final_output}"
                elif op == '*':
                    scale = n1 * n2
                    n1_s, n2_s = n1 / math.sqrt(scale), n2 / math.sqrt(scale)
                    ans = ((n1_s * n2_s) * w_mu + b_mu) * scale
                    final_output = int(round(ans)) if round(
                        ans, 4).is_integer() else round(ans, 4)
                    final_response = f"النتيجة الرياضية: {final_output}"
                else:
                    scale = (n1 + n2 if (n1 + n2) != 0 else 1)
                    n1_s, n2_s = n1 / scale, n2 / scale
                    if op == '+':
                        ans = ((n1_s * w_p1) + (n2_s * w_p2) + b_p) * scale
                    elif op == '-':
                        ans = ((n1_s * w_m1) + (n2_s * w_m2) + b_m) * scale
                    final_output = int(round(ans)) if round(
                        ans, 4).is_integer() else round(ans, 4)
                    final_response = f"النتيجة الرياضية: {final_output}"
            else:
                nums = [float(x) for x in re.findall(r'\d+\.?\d*', user_input)]
                if len(nums) >= 2 and any(x in user_input for x in ['طقس', 'جو', 'دراسة', 'مذاكرة', 'لعب']):
                    if any(x in user_input for x in ['طقس', 'جو']):
                        score = nums[0]*w_t + nums[1]*w_h + b_w
                        decision = "🏞️ مناسب للخروج!" if score > 0 else "🏠 ابق في المنزل."
                    else:
                        score = nums[0]*w_ex + nums[1]*w_hr + b_s
                        decision = "🎮 يمكنك اللعب!" if score > 0 else "📚 افتح الكتب فوراً."
                    final_response = f"القرار: {decision}"
                else:
                    final_response = user_input

        if is_memory_mode:
            temp_sessions[conv_id]['messages'].append(
                {'role': 'bot', 'content': final_response})
        else:
            db.execute("INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
                       (conv_id, 'bot', final_response))
            db.commit()

        return jsonify({'response': final_response})
    except Exception as e:
        return jsonify({'response': f"❌ خطأ فني: {str(e)}"})


def get_user_id():
    if os.path.exists(USER_FILE):
        with open(USER_FILE, 'r') as f:
            return f.read().strip()
    else:
        new_id = os.urandom(24).hex()
        with open(USER_FILE, 'w') as f:
            f.write(new_id)
        return new_id


if __name__ == '__main__':
    # لم نعد بحاجة لتهيئة قاعدة البيانات هنا لأنها نُقلت للأعلى
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
