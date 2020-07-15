import os
import pickle
import sys

def main():
    # load the model and do the prediction
    model = pickle.load(open(os.path.dirname(__file__) + '/levels_model.pkl', 'rb'))
    nb_features = 7
    values = sys.argv[1].strip(',').split(',')
    predictions = []
    for i in range(0, len(values), nb_features):
        X = [[float(values[j]) for j in range(i, i + nb_features)]]
        predictions.append(str(model.predict(X)[0]))
    
    print(' '.join(predictions))
    sys.stdout.flush()
    sys.exit(0)

if __name__ == "__main__":    
    main()