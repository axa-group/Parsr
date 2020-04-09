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
                classes[0] = 21561; 
                classes[1] = 1889; 
            } else {
                classes[0] = 430; 
                classes[1] = 6425; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 311; 
                classes[1] = 7635; 
            } else {
                classes[0] = 133; 
                classes[1] = 6486; 
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
        var clf = new DecisionTreeClassifier();
        var prediction = clf.predict(features);
        console.log(prediction);

    }
}