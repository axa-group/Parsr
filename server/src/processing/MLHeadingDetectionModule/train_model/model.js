export var DecisionTreeClassifier = function() {

    var findMax = function(nums) {
        var index = 0;
        for (var i = 0; i < nums.length; i++) {
            index = nums[i] > nums[index] ? i : index;
        }
        return index;
    };

    this.predict = function(features) {
        var classes = new Array(2);
            
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                if (features[3] <= 0.5) {
                    if (features[2] <= 0.5) {
                        classes[0] = 2605; 
                        classes[1] = 80; 
                    } else {
                        classes[0] = 9288; 
                        classes[1] = 127; 
                    }
                } else {
                    if (features[2] <= 0.5) {
                        classes[0] = 261; 
                        classes[1] = 16; 
                    } else {
                        classes[0] = 1408; 
                        classes[1] = 1170; 
                    }
                }
            } else {
                if (features[3] <= 0.5) {
                    if (features[2] <= 0.5) {
                        classes[0] = 2; 
                        classes[1] = 0; 
                    } else {
                        classes[0] = 106; 
                        classes[1] = 1299; 
                    }
                } else {
                    if (features[2] <= 0.5) {
                        classes[0] = 3; 
                        classes[1] = 0; 
                    } else {
                        classes[0] = 311; 
                        classes[1] = 1944; 
                    }
                }
            }
        } else {
            if (features[2] <= 0.5) {
                if (features[1] <= 0.5) {
                    if (features[3] <= 0.5) {
                        classes[0] = 66; 
                        classes[1] = 45; 
                    } else {
                        classes[0] = 60; 
                        classes[1] = 34; 
                    }
                } else {
                    if (features[3] <= 0.5) {
                        classes[0] = 1; 
                        classes[1] = 21; 
                    } else {
                        classes[0] = 13; 
                        classes[1] = 48; 
                    }
                }
            } else {
                if (features[1] <= 0.5) {
                    if (features[3] <= 0.5) {
                        classes[0] = 136; 
                        classes[1] = 2118; 
                    } else {
                        classes[0] = 113; 
                        classes[1] = 2573; 
                    }
                } else {
                    if (features[3] <= 0.5) {
                        classes[0] = 66; 
                        classes[1] = 1332; 
                    } else {
                        classes[0] = 42; 
                        classes[1] = 3674; 
                    }
                }
            }
        }
    
        return findMax(classes);
    };

};

if (typeof process !== 'undefined' && typeof process.argv !== 'undefined') {
    if (process.argv.length - 2 === 4) {

        // Features:
        var features = process.argv.slice(2);

        // Prediction:
        var clf = new DecisionTreeClassifier();
        var prediction = clf.predict(features);
        console.log(prediction);

    }
}