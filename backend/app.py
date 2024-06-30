from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModel, AutoTokenizer
import torch
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json
import nltk
import random
import datetime

app = Flask(__name__)
CORS(app)


model_name = "aubmindlab/bert-base-arabert"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)


with open('arabic_words.json', 'r', encoding='utf-8') as file:
    common_words = json.load(file)

def generate_word_of_the_day():
    today = datetime.date.today()
    random.seed(today.toordinal())
    return random.choice(common_words)

def get_bert_embeddings(text):
    inputs = tokenizer(text, return_tensors='pt')
    outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).detach().numpy()


with open('word-list.txt', 'r', encoding='utf-8') as f:
    possible_words = [line.strip() for line in f.readlines()]

#possible_embeddings = {word:get_bert_embeddings(word) for word in possible_words[:10]}
possible_embeddings = []

@app.route('/word_of_the_day', methods=['GET'])
def word_of_the_day():
    word = generate_word_of_the_day()
    print('word', word)
    return jsonify({'word_of_the_day': word})

@app.route('/calculate_similarity', methods=['POST'])
def calculate_similarity():
    data = request.json
    word1 = data.get('word1')
    word2 = data.get('word2')

    embedding1 = get_bert_embeddings(word1)
    embedding2 = get_bert_embeddings(word2)

    similarity = cosine_similarity(embedding1, embedding2)[0][0]
    score = round((1 - similarity) * 1000) + 1

    return jsonify({'score': score})

@app.route('/closest_words', methods=['POST'])
def closest_words():
    data = request.json
    word = data.get('word')

    word_embedding = get_bert_embeddings(word)
    similarities = [cosine_similarity(word_embedding, emb)[0][0] for emb in possible_embeddings]
    closest_words = sorted(zip(possible_words, similarities), key=lambda x: x[1], reverse=True)[:100]

    return jsonify({'closest_words': [word for word, similarity in closest_words]})

if __name__ == '__main__':
    app.run(debug=True)
