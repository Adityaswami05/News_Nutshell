from flask import Flask, request, render_template, jsonify, session
from newspaper import Article
from deep_translator import GoogleTranslator
from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline
from dotenv import load_dotenv
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Set a strong secret key
load_dotenv()
HF_API_KEY = os.getenv('HF_API_KEY')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/translate', methods=['POST'])
def translate():
    url = request.form['url']
    language = request.form['language']

    try:
        article = Article(url)
        article.download()
        article.parse()
        article.nlp()

        translator = GoogleTranslator(source='auto', target=language)
        translated_title = translator.translate(article.title)
        translated_summary = translator.translate(article.summary)

        # Store the translated summary in a session variable
        session['translated_summary'] = translated_summary

        return jsonify({
            'title': translated_title,
            'summary': translated_summary,
            'publish_date': article.publish_date.strftime('%Y-%m-%d') if article.publish_date else 'N/A',
            'top_image': article.top_image
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/ask', methods=['POST'])
def ask_question():
    question = request.form['question']
    # Retrieve the translated summary from the session
    article_text = session.get('translated_summary', '')

    try:
        model_name = "roberta-base" 
        tokenizer = AutoTokenizer.from_pretrained(model_name, use_auth_token=HF_API_KEY)
        model = AutoModelForQuestionAnswering.from_pretrained(model_name, use_auth_token=HF_API_KEY)

        qa_pipeline = pipeline('question-answering', model=model, tokenizer=tokenizer)

        answer = qa_pipeline(question=question, context=article_text)

        return jsonify({'answer': answer['answer']})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)