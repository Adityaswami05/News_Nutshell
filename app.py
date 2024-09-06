from flask import Flask, request, render_template, jsonify
from newspaper import Article
from deep_translator import GoogleTranslator

app = Flask(__name__)

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

        # Returning the translated article data as JSON
        return jsonify({
            'title': translated_title,
            'summary': translated_summary,
            'publish_date': article.publish_date.strftime('%Y-%m-%d') if article.publish_date else 'N/A',
            'top_image': article.top_image
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)