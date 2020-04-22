export var DecisionTreeClassifierLevel = function() {

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
                classes[0] = 0; 
                classes[1] = 0; 
                classes[2] = 0; 
                classes[3] = 0; 
                classes[4] = 13; 
                classes[5] = 1; 
                classes[6] = 0; 
            } else {
                if (features[1] <= 0.5) {
                    classes[0] = 0; 
                    classes[1] = 0; 
                    classes[2] = 0; 
                    classes[3] = 0; 
                    classes[4] = 0; 
                    classes[5] = 2; 
                    classes[6] = 0; 
                } else {
                    classes[0] = 0; 
                    classes[1] = 0; 
                    classes[2] = 0; 
                    classes[3] = 2; 
                    classes[4] = 2; 
                    classes[5] = 0; 
                    classes[6] = 1; 
                }
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 0; 
                classes[1] = 3; 
                classes[2] = 1; 
                classes[3] = 0; 
                classes[4] = 0; 
                classes[5] = 0; 
                classes[6] = 0; 
            } else {
                if (features[0] <= 14.010000228881836) {
                    classes[0] = 0; 
                    classes[1] = 0; 
                    classes[2] = 0; 
                    classes[3] = 7; 
                    classes[4] = 1; 
                    classes[5] = 0; 
                    classes[6] = 0; 
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
    if (process.argv.length - 2 === 2) {

        // Features:
        var features = process.argv.slice(2);

        // Prediction:
        var clf = new DecisionTreeClassifierLevel();
        var prediction = clf.predict(features);
        console.log(prediction);

    }
}