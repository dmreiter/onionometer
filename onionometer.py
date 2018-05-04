from gensim import utils
from gensim.models.doc2vec import LabeledSentence
from gensim.models import Doc2Vec

import numpy as np

from random import shuffle

from sklearn.linear_model import LogisticRegression

sentences = []

with utils.smart_open('sentences/onion.txt') as file_in:
    for item_no, line in enumerate(file_in):
        sentences.append(LabeledSentence(utils.to_unicode(line).lower().split(), ['ONION_' + str(item_no)]))

with utils.smart_open('sentences/real.txt') as file_in:
    for item_no, line in enumerate(file_in):
        sentences.append(LabeledSentence(utils.to_unicode(line).lower().split(), ['REAL_' + str(item_no)]))

# model = Doc2Vec.load('./onionometer.d2v')

model = Doc2Vec(min_count=1, window=5, vector_size=100)

model.build_vocab(sentences)

for epoch in range(20):
    print('training epoch ' + str(epoch + 1))
    shuffle(sentences)
    model.train(sentences, total_examples=model.corpus_count, epochs=20)

model.save('./onionometer.d2v')


train_array = np.zeros((30000, 100))
train_labels = np.zeros(30000)

for i in range(15000):
    onion_prefix = 'ONION_' + str(i)
    real_prefix = 'REAL_' + str(i)
    train_array[i] = model[onion_prefix]
    train_array[i + 15000] = model[real_prefix]
    train_labels[i] = 1
    train_labels[i + 15000] = 0

test_array = np.zeros((8000, 100))
test_labels = np.zeros(8000)

for i in range(4000):
    onion_prefix = 'ONION_' + str(i + 15000)
    real_prefix = 'REAL_' + str(i + 15000)
    test_array[i] = model[onion_prefix]
    test_array[i + 4000] = model[real_prefix]
    test_labels[i] = 1
    test_labels[i + 4000] = 0

classifier = LogisticRegression()
classifier.fit(train_array, train_labels)

score = classifier.score(test_array, test_labels)

print("accuracy on test set: " + str(score))