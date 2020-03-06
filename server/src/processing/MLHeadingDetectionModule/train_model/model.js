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
                        classes[0] = 2052; 
                        classes[1] = 72; 
                    } else {
                        classes[0] = 7446; 
                        classes[1] = 103; 
                    }
                } else {
                    if (features[2] <= 0.5) {
                        classes[0] = 202; 
                        classes[1] = 17; 
                    } else {
                        classes[0] = 1132; 
                        classes[1] = 1001; 
                    }
                }
            } else {
                if (features[3] <= 0.5) {
                    if (features[2] <= 0.5) {
                        classes[0] = 2; 
                        classes[1] = 0; 
                    } else {
                        classes[0] = 90; 
                        classes[1] = 1011; 
                    }
                } else {
                    if (features[2] <= 0.5) {
                        classes[0] = 2; 
                        classes[1] = 0; 
                    } else {
                        classes[0] = 250; 
                        classes[1] = 1504; 
                    }
                }
            }
        } else {
            if (features[2] <= 0.5) {
                if (features[1] <= 0.5) {
                    if (features[3] <= 0.5) {
                        classes[0] = 54; 
                        classes[1] = 36; 
                    } else {
                        classes[0] = 48; 
                        classes[1] = 25; 
                    }
                } else {
                    classes[0] = 10; 
                    classes[1] = 22; 
                }
            } else {
                if (features[1] <= 0.5) {
                    if (features[3] <= 0.5) {
                        classes[0] = 105; 
                        classes[1] = 1881; 
                    } else {
                        classes[0] = 91; 
                        classes[1] = 2106; 
                    }
                } else {
                    if (features[3] <= 0.5) {
                        classes[0] = 49; 
                        classes[1] = 1006; 
                    } else {
                        classes[0] = 35; 
                        classes[1] = 2784; 
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