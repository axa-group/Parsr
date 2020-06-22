import os
import pickle
import sys

def main():
    # load the model and do the prediction
    if len(sys.argv) == 8:
        filename = os.path.dirname(__file__) + '/levels_model.pkl'
    elif len(sys.argv) == 9:
        filename = os.path.dirname(__file__) + '/headings_model.pkl'
    model = pickle.load(open(filename, 'rb'))
    X = [[float(sys.argv[i]) for i in range(1,len(sys.argv))]]
    prediction = model.predict(X)[0]
    print(prediction)
    sys.stdout.flush()
    sys.exit(0)

if __name__ == "__main__":    
    main()