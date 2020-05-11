export var RandomForestClassifier = function() {

    var findMax = function(nums) {
        var index = 0;
        for (var i = 0; i < nums.length; i++) {
            index = nums[i] > nums[index] ? i : index;
        }
        return index;
    };

    var trees = new Array();

    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19624; 
                classes[1] = 41; 
            } else {
                classes[0] = 261; 
                classes[1] = 492; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 409; 
                classes[1] = 471; 
            } else {
                classes[0] = 127; 
                classes[1] = 438; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19613; 
                classes[1] = 60; 
            } else {
                classes[0] = 377; 
                classes[1] = 475; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 284; 
                classes[1] = 476; 
            } else {
                classes[0] = 103; 
                classes[1] = 475; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19598; 
                classes[1] = 57; 
            } else {
                classes[0] = 391; 
                classes[1] = 458; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 282; 
                classes[1] = 486; 
            } else {
                classes[0] = 126; 
                classes[1] = 465; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19608; 
                classes[1] = 41; 
            } else {
                classes[0] = 283; 
                classes[1] = 480; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 403; 
                classes[1] = 442; 
            } else {
                classes[0] = 120; 
                classes[1] = 486; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19559; 
                classes[1] = 49; 
            } else {
                classes[0] = 396; 
                classes[1] = 470; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 294; 
                classes[1] = 453; 
            } else {
                classes[0] = 143; 
                classes[1] = 499; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19552; 
                classes[1] = 48; 
            } else {
                classes[0] = 407; 
                classes[1] = 435; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 294; 
                classes[1] = 497; 
            } else {
                classes[0] = 114; 
                classes[1] = 516; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19588; 
                classes[1] = 60; 
            } else {
                classes[0] = 391; 
                classes[1] = 458; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 286; 
                classes[1] = 462; 
            } else {
                classes[0] = 128; 
                classes[1] = 490; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19510; 
                classes[1] = 41; 
            } else {
                classes[0] = 305; 
                classes[1] = 507; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 390; 
                classes[1] = 482; 
            } else {
                classes[0] = 132; 
                classes[1] = 496; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19647; 
                classes[1] = 58; 
            } else {
                classes[0] = 388; 
                classes[1] = 410; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 270; 
                classes[1] = 507; 
            } else {
                classes[0] = 121; 
                classes[1] = 462; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19608; 
                classes[1] = 44; 
            } else {
                classes[0] = 274; 
                classes[1] = 458; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 385; 
                classes[1] = 509; 
            } else {
                classes[0] = 148; 
                classes[1] = 437; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19509; 
                classes[1] = 60; 
            } else {
                classes[0] = 273; 
                classes[1] = 471; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 411; 
                classes[1] = 485; 
            } else {
                classes[0] = 127; 
                classes[1] = 527; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19598; 
                classes[1] = 46; 
            } else {
                classes[0] = 262; 
                classes[1] = 510; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 401; 
                classes[1] = 450; 
            } else {
                classes[0] = 128; 
                classes[1] = 468; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19492; 
                classes[1] = 61; 
            } else {
                classes[0] = 420; 
                classes[1] = 485; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 316; 
                classes[1] = 469; 
            } else {
                classes[0] = 138; 
                classes[1] = 482; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19603; 
                classes[1] = 50; 
            } else {
                classes[0] = 265; 
                classes[1] = 490; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 412; 
                classes[1] = 453; 
            } else {
                classes[0] = 107; 
                classes[1] = 483; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19568; 
                classes[1] = 65; 
            } else {
                classes[0] = 270; 
                classes[1] = 457; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 391; 
                classes[1] = 468; 
            } else {
                classes[0] = 134; 
                classes[1] = 510; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19661; 
                classes[1] = 41; 
            } else {
                classes[0] = 390; 
                classes[1] = 436; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 278; 
                classes[1] = 456; 
            } else {
                classes[0] = 145; 
                classes[1] = 456; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19539; 
                classes[1] = 59; 
            } else {
                classes[0] = 433; 
                classes[1] = 464; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 262; 
                classes[1] = 527; 
            } else {
                classes[0] = 117; 
                classes[1] = 462; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19535; 
                classes[1] = 44; 
            } else {
                classes[0] = 402; 
                classes[1] = 473; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 286; 
                classes[1] = 521; 
            } else {
                classes[0] = 126; 
                classes[1] = 476; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19554; 
                classes[1] = 50; 
            } else {
                classes[0] = 417; 
                classes[1] = 487; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 260; 
                classes[1] = 487; 
            } else {
                classes[0] = 131; 
                classes[1] = 477; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19396; 
                classes[1] = 64; 
            } else {
                classes[0] = 274; 
                classes[1] = 540; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 430; 
                classes[1] = 485; 
            } else {
                classes[0] = 126; 
                classes[1] = 548; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19543; 
                classes[1] = 71; 
            } else {
                classes[0] = 289; 
                classes[1] = 508; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 407; 
                classes[1] = 441; 
            } else {
                classes[0] = 127; 
                classes[1] = 477; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19620; 
                classes[1] = 47; 
            } else {
                classes[0] = 273; 
                classes[1] = 472; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 418; 
                classes[1] = 438; 
            } else {
                classes[0] = 117; 
                classes[1] = 478; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19554; 
                classes[1] = 55; 
            } else {
                classes[0] = 401; 
                classes[1] = 469; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 268; 
                classes[1] = 510; 
            } else {
                classes[0] = 129; 
                classes[1] = 477; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19545; 
                classes[1] = 55; 
            } else {
                classes[0] = 266; 
                classes[1] = 500; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 443; 
                classes[1] = 449; 
            } else {
                classes[0] = 118; 
                classes[1] = 487; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19565; 
                classes[1] = 57; 
            } else {
                classes[0] = 411; 
                classes[1] = 459; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 256; 
                classes[1] = 493; 
            } else {
                classes[0] = 139; 
                classes[1] = 483; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19631; 
                classes[1] = 58; 
            } else {
                classes[0] = 406; 
                classes[1] = 446; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 274; 
                classes[1] = 495; 
            } else {
                classes[0] = 129; 
                classes[1] = 424; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19593; 
                classes[1] = 50; 
            } else {
                classes[0] = 413; 
                classes[1] = 452; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 272; 
                classes[1] = 486; 
            } else {
                classes[0] = 130; 
                classes[1] = 467; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19627; 
                classes[1] = 62; 
            } else {
                classes[0] = 287; 
                classes[1] = 514; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 379; 
                classes[1] = 442; 
            } else {
                classes[0] = 121; 
                classes[1] = 431; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19522; 
                classes[1] = 42; 
            } else {
                classes[0] = 323; 
                classes[1] = 477; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 421; 
                classes[1] = 485; 
            } else {
                classes[0] = 116; 
                classes[1] = 477; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19590; 
                classes[1] = 57; 
            } else {
                classes[0] = 284; 
                classes[1] = 465; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 399; 
                classes[1] = 447; 
            } else {
                classes[0] = 146; 
                classes[1] = 475; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19547; 
                classes[1] = 54; 
            } else {
                classes[0] = 296; 
                classes[1] = 484; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 406; 
                classes[1] = 459; 
            } else {
                classes[0] = 148; 
                classes[1] = 469; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19545; 
                classes[1] = 52; 
            } else {
                classes[0] = 270; 
                classes[1] = 516; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 430; 
                classes[1] = 436; 
            } else {
                classes[0] = 132; 
                classes[1] = 482; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19626; 
                classes[1] = 49; 
            } else {
                classes[0] = 271; 
                classes[1] = 512; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 389; 
                classes[1] = 439; 
            } else {
                classes[0] = 109; 
                classes[1] = 468; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19543; 
                classes[1] = 48; 
            } else {
                classes[0] = 383; 
                classes[1] = 433; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 287; 
                classes[1] = 517; 
            } else {
                classes[0] = 148; 
                classes[1] = 504; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19599; 
                classes[1] = 53; 
            } else {
                classes[0] = 296; 
                classes[1] = 499; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 398; 
                classes[1] = 414; 
            } else {
                classes[0] = 148; 
                classes[1] = 456; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19572; 
                classes[1] = 55; 
            } else {
                classes[0] = 296; 
                classes[1] = 510; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 396; 
                classes[1] = 429; 
            } else {
                classes[0] = 135; 
                classes[1] = 470; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19655; 
                classes[1] = 64; 
            } else {
                classes[0] = 394; 
                classes[1] = 452; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 248; 
                classes[1] = 470; 
            } else {
                classes[0] = 124; 
                classes[1] = 456; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19581; 
                classes[1] = 55; 
            } else {
                classes[0] = 290; 
                classes[1] = 490; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 388; 
                classes[1] = 441; 
            } else {
                classes[0] = 119; 
                classes[1] = 499; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19616; 
                classes[1] = 58; 
            } else {
                classes[0] = 370; 
                classes[1] = 433; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 295; 
                classes[1] = 495; 
            } else {
                classes[0] = 115; 
                classes[1] = 481; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19514; 
                classes[1] = 56; 
            } else {
                classes[0] = 282; 
                classes[1] = 534; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 382; 
                classes[1] = 465; 
            } else {
                classes[0] = 112; 
                classes[1] = 518; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19615; 
                classes[1] = 56; 
            } else {
                classes[0] = 387; 
                classes[1] = 494; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 245; 
                classes[1] = 449; 
            } else {
                classes[0] = 116; 
                classes[1] = 501; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19585; 
                classes[1] = 57; 
            } else {
                classes[0] = 265; 
                classes[1] = 468; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 413; 
                classes[1] = 423; 
            } else {
                classes[0] = 136; 
                classes[1] = 516; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19549; 
                classes[1] = 54; 
            } else {
                classes[0] = 418; 
                classes[1] = 485; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 276; 
                classes[1] = 472; 
            } else {
                classes[0] = 128; 
                classes[1] = 481; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19592; 
                classes[1] = 57; 
            } else {
                classes[0] = 411; 
                classes[1] = 457; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 266; 
                classes[1] = 467; 
            } else {
                classes[0] = 122; 
                classes[1] = 491; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19665; 
                classes[1] = 50; 
            } else {
                classes[0] = 272; 
                classes[1] = 471; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 408; 
                classes[1] = 434; 
            } else {
                classes[0] = 128; 
                classes[1] = 435; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19651; 
                classes[1] = 54; 
            } else {
                classes[0] = 282; 
                classes[1] = 489; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 368; 
                classes[1] = 451; 
            } else {
                classes[0] = 139; 
                classes[1] = 429; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19572; 
                classes[1] = 51; 
            } else {
                classes[0] = 255; 
                classes[1] = 520; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 392; 
                classes[1] = 469; 
            } else {
                classes[0] = 118; 
                classes[1] = 486; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19500; 
                classes[1] = 44; 
            } else {
                classes[0] = 424; 
                classes[1] = 498; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 282; 
                classes[1] = 496; 
            } else {
                classes[0] = 150; 
                classes[1] = 469; 
            }
        }
    
        return findMax(classes);
    });
    
    this.predict = function(features) {
        var classes = new Array(2).fill(0);
        for (var i = 0; i < trees.length; i++) {
            classes[trees[i](features)]++;
        }
        return findMax(classes);
    }

};

if (typeof process !== 'undefined' && typeof process.argv !== 'undefined') {
    if (process.argv.length - 2 == 2) {

        // Features:
        var features = process.argv.slice(2);

        // Prediction:
        var prediction = new RandomForestClassifier().predict(features);
        console.log(prediction);

    }
}