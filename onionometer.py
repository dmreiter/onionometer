from gensim import utils
from gensim.models.doc2vec import LabeledSentence
from gensim.models import Doc2Vec

import numpy as np

from random import shuffle

from sklearn.linear_model import LogisticRegression

class LabeledLineSentence:
    def __init__(self, sources):
        self.sources = sources

    def __iter__(self):
        for source, prefix in self.sources.items():
            with utils.smart_open(source) as fin:
                for item_no, line in enumerate(fin):
                    yield LabeledSentence(utils.to_unicode(line).lower().split(), [prefix + '_%s' % item_no])
        return self.sentences

    def to_array(self):
        self.sentences = []
        for source, prefix in self.sources.items():
            with utils.smart_open(source) as fin:
                for item_no, line in enumerate(fin):
                    self.sentences.append(LabeledSentence(utils.to_unicode(line).lower().split(), [prefix + '_%s' % item_no]))
        return self.sentences
    
    def sentences_perm(self):
        shuffle(self.sentences)
        return self.sentences

sources = {'sentences/onion.txt':'ONION', 'sentences/real.txt':'REAL'}

sentences = LabeledLineSentence(sources)

model = Doc2Vec.load('./onionometer.d2v')

# model = Doc2Vec(min_count=1, window=5, vector_size=100)

# model.build_vocab(sentences.to_array())

# for epoch in range(10):
#     model.train(sentences.sentences_perm(), total_examples=model.corpus_count, epochs=10)

# model.save('./onionometer.d2v')

# print(model.most_similar('man'))

# print(model['REAL_10000'])

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

print(score)