# onionometer
Detecting satire using machine learning.


This project uses the doc2vec algorithm and scikit learn's logisitic regression classifier to try to identify satirical headlines from real ones.

The onion headline data was collected using the puppeteer library (via web scraping).
The real headlines were obtained from CBC since they had an easy to use API. I just directly accessed their API using the request library instead of scraping since using the API is faster.

Using these headlines, I first trained a Doc2Vec model (currently saved as onionometer.d2v). The main purpose of using Doc2Vec was to avoid using one-hot vectors, as that method does not consider context of words in a sentence (something that is very important in satire).

I then exported the headlines as vectors from Doc2Vec and split them in to train/test groups. My initial split was 30000 train (15000 onion and 15000 real headlines), 8000 test (4000/4000). These were then tossed in to scikit learn's logistic regression classifier.

Version 1 yields ~71% accuracy.

After cleaning the data a little bit more the model predicts satire with around 76.5% accuracy.

I will update this soon with a more in depth data analysis & will try to increase the accuracy.
