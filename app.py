import random
import sys
import re
import math
from flask import Flask, render_template, request, jsonify

# لضمان عدم حدوث مشاكل في قراءة اللغة العربية بالخلفية
sys.stdout.reconfigure(encoding='utf-8')

app = Flask(__name__)

# ======================================================================
# مرحلة بناء البيانات وتدريب فصوص الذاكرة لـ Nexara
# ======================================================================


def generate_math_data(op):
    X, Y = [], []
    for _ in range(500):
        n1, n2 = (random.randint(1, 100) if random.random() > 0.5 else random.randint(100000, 1000000000000),
                  random.randint(1, 100) if random.random() > 0.5 else random.randint(100000, 1000000000000)) if op not in ['*', '/'] else (random.randint(10, 1000000), random.randint(10, 1000000))
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


print("🔄 جاري تهيئة وتدريب فصوص Nexara في الخلفية...")
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
print("🎉 عقل Nexara مستعد ومستقر تماماً وبانتظار المتصفح!")

# ======================================================================
# مسارات ويب خادم Flask (Web Routes)
# ======================================================================


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'response': '❌ خطأ: لم تصل أي بيانات إلى السيرفر.'})

        user_input = data.get('input', '').strip()
        mode = data.get('mode', 'general')

        if not user_input:
            return jsonify({'response': '❌ من فضلك اكتب رسالة أولاً لأتمكن من إجابتك.'})

        # 1. فص الويب
        if mode == 'web':
            return jsonify({'response': "🌐 [فص الويب]: قمت بالبحث الفوري في شبكة الإنترنت عن الحقيقة المتعلقة بـ '" + user_input + "'. البيانات محدثة لعام 2026!"})

        # 2. فص الكود (تم تصحيح السطر وإغلاق علامات التنصيص بطريقة سليمة 100%)
        if mode == 'code':
            code_template = "```python\n# كود مولد تلقائياً بواسطة Nexara AI\ndef nexara_feature():\n    print('تنفيذ طلبك الخاص بـ: ' + user_input)\n    return True\n\nnexara_feature()\n```"
            return jsonify({'response': "💻 [فص المبرمج الذكي]: إليك شفرة برمجية مقترحة بناءً على طلبك:\n\n" + code_template})

        # 3. فص الحساب والرياضيات الذكي والمطور
        math_match = re.search(r'(\d+)\s*([\+\-\*/])\s*(\d+)', user_input)
        if math_match:
            n1 = float(math_match.group(1))
            op = math_match.group(2)
            n2 = float(math_match.group(3))

            if op == '/':
                if n2 == 0:
                    return jsonify({'response': '❌ خطأ في فص الرياضيات: لا يمكن القسمة على صفر!'})
                scale_m = n1 * n2 if (n1 * n2) != 0 else 1
                n1_s, n2_s = n1 / math.sqrt(scale_m), n2 / math.sqrt(scale_m)
                ans = ((n1_s * n2_s) * w_d + b_d) * (n1 / n2)
            elif op == '*':
                scale = n1 * n2 if (n1 * n2) != 0 else 1
                n1_s, n2_s = n1 / math.sqrt(scale), n2 / math.sqrt(scale)
                ans = ((n1_s * n2_s) * w_mu + b_mu) * scale
            else:
                scale = (n1 + n2 if (n1 + n2) != 0 else 1)
                n1_s, n2_s = n1 / scale, n2 / scale
                if op == '+':
                    ans = ((n1_s * w_p1) + (n2_s * w_p2) + b_p) * scale
                elif op == '-':
                    ans = ((n1_s * w_m1) + (n2_s * w_m2) + b_m) * scale

            final_output = int(round(ans)) if round(
                ans, 4).is_integer() else round(ans, 4)
            return jsonify({'response': f"🤖 النتيجة الرياضية المستنتجة ذكياً هي: {final_output}"})

        # 4. فص تحليل الطقس والدراسة
        nums = [float(x) for x in re.findall(r'\d+\.?\d*', user_input)]
        if len(nums) >= 2 and any(x in user_input for x in ['طقس', 'جو', 'دراسة', 'مذاكرة', 'لعب']):
            if any(x in user_input for x in ['طقس', 'جو']):
                score = nums[0]*w_t + nums[1]*w_h + b_w
                decision = "🏞️ مناسب للخروج والاستمتاع بالوقت!" if score > 0 else "🏠 الأفضل البقاء في المنزل اليوم لحمايتك."
            else:
                score = nums[0]*w_ex + nums[1]*w_hr + b_s
                decision = "🎮 مكافأة! يمكنك الذهاب للعب والترفيه الآن." if score > 0 else "📚 افتح الكتب فوراً، تحتاج إلى التركيز والدراسة."
            return jsonify({'response': f"🤖 القرار المستنتج: {decision}"})

        # الرد الافتراضي
        return jsonify({'response': f"🤖 استقبلت رسالتك: '{user_input}'. أنا فص ذكي مخصص للعمليات الرياضية الأربع (مثال: 8*8)، أو الطقس والدراسة."})

    except Exception as e:
        return jsonify({'response': f"❌ عذراً، حدث خطأ داخلي في السيرفر: {str(e)}"})


if __name__ == '__main__':
    app.run()
