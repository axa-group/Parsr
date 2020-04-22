export var DecisionTreeClassifier = function() {

    var findMax = function(nums) {
        var index = 0;
        for (var i = 0; i < nums.length; i++) {
            index = nums[i] > nums[index] ? i : index;
        }
        return index;
    };

    this.predict = function(features) {
        var classes = new Array(7);
            
        if (features[0] <= 11.489999771118164) {
            if (features[0] <= 10.5) {
                if (features[2] <= 2.5) {
                    classes[0] = 0; 
                    classes[1] = 0; 
                    classes[2] = 0; 
                    classes[3] = 0; 
                    classes[4] = 5; 
                    classes[5] = 1; 
                    classes[6] = 0; 
                } else {
                    classes[0] = 0; 
                    classes[1] = 0; 
                    classes[2] = 0; 
                    classes[3] = 0; 
                    classes[4] = 8; 
                    classes[5] = 0; 
                    classes[6] = 0; 
                }
            } else {
                if (features[2] <= 1.5) {
                    classes[0] = 0; 
                    classes[1] = 0; 
                    classes[2] = 0; 
                    classes[3] = 2; 
                    classes[4] = 2; 
                    classes[5] = 0; 
                    classes[6] = 0; 
                } else {
                    classes[0] = 0; 
                    classes[1] = 0; 
                    classes[2] = 0; 
                    classes[3] = 0; 
                    classes[4] = 0; 
                    classes[5] = 2; 
                    classes[6] = 1; 
                }
            }
        } else {
            if (features[1] <= 0.5) {
                if (features[2] <= 2.5) {
                    classes[0] = 0; 
                    classes[1] = 1; 
                    classes[2] = 1; 
                    classes[3] = 0; 
                    classes[4] = 0; 
                    classes[5] = 0; 
                    classes[6] = 0; 
                } else {
                    classes[0] = 0; 
                    classes[1] = 2; 
                    classes[2] = 0; 
                    classes[3] = 0; 
                    classes[4] = 0; 
                    classes[5] = 0; 
                    classes[6] = 0; 
                }
            } else {
                if (features[0] <= 14.010000228881836) {
                    if (features[2] <= 1.5) {
                        classes[0] = 0; 
                        classes[1] = 0; 
                        classes[2] = 0; 
                        classes[3] = 6; 
                        classes[4] = 0; 
                        classes[5] = 0; 
                        classes[6] = 0; 
                    } else {
                        classes[0] = 0; 
                        classes[1] = 0; 
                        classes[2] = 0; 
                        classes[3] = 1; 
                        classes[4] = 1; 
                        classes[5] = 0; 
                        classes[6] = 0; 
                    }
                } else {
                    classes[0] = 3; 
                    classes[1] = 0; 
                    classes[2] = 0; 
                    classes[3] = 0; 
                    classes[4] = 0; 
                    classes[5] = 0; 
                    classes[6] = 0; 
                }
            }
        }
    
        return findMax(classes);
    };

};

if (typeof process !== 'undefined' && typeof process.argv !== 'undefined') {
    if (process.argv.length - 2 === 3) {

        // Features:
        var features = process.argv.slice(2);

        // Prediction:
        var clf = new DecisionTreeClassifier();
        var prediction = clf.predict(features);
        console.log(prediction);

    }
}