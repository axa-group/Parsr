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
            
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                if (features[2] <= 0.5) {
                    classes[0] = 2866; 
                    classes[1] = 116; 
                } else {
                    classes[0] = 10696; 
                    classes[1] = 1290; 
                }
            } else {
                if (features[2] <= 0.5) {
                    classes[0] = 5; 
                    classes[1] = 0; 
                } else {
                    classes[0] = 334; 
                    classes[1] = 2953; 
                }
            }
        } else {
            if (features[2] <= 0.5) {
                if (features[0] <= 0.5) {
                    classes[0] = 126; 
                    classes[1] = 76; 
                } else {
                    classes[0] = 14; 
                    classes[1] = 68; 
                }
            } else {
                if (features[0] <= 0.5) {
                    classes[0] = 243; 
                    classes[1] = 5004; 
                } else {
                    classes[0] = 105; 
                    classes[1] = 4882; 
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