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
                classes[0] = 19496; 
                classes[1] = 61; 
            } else {
                classes[0] = 227; 
                classes[1] = 496; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 302; 
                classes[1] = 469; 
            } else {
                classes[0] = 100; 
                classes[1] = 489; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19345; 
                classes[1] = 56; 
            } else {
                classes[0] = 355; 
                classes[1] = 501; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 260; 
                classes[1] = 493; 
            } else {
                classes[0] = 109; 
                classes[1] = 521; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19448; 
                classes[1] = 55; 
            } else {
                classes[0] = 335; 
                classes[1] = 480; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 264; 
                classes[1] = 482; 
            } else {
                classes[0] = 95; 
                classes[1] = 481; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19429; 
                classes[1] = 50; 
            } else {
                classes[0] = 280; 
                classes[1] = 490; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 345; 
                classes[1] = 447; 
            } else {
                classes[0] = 92; 
                classes[1] = 507; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19428; 
                classes[1] = 71; 
            } else {
                classes[0] = 344; 
                classes[1] = 462; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 255; 
                classes[1] = 472; 
            } else {
                classes[0] = 87; 
                classes[1] = 521; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19465; 
                classes[1] = 51; 
            } else {
                classes[0] = 342; 
                classes[1] = 437; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 258; 
                classes[1] = 504; 
            } else {
                classes[0] = 97; 
                classes[1] = 486; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19409; 
                classes[1] = 68; 
            } else {
                classes[0] = 319; 
                classes[1] = 503; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 268; 
                classes[1] = 474; 
            } else {
                classes[0] = 120; 
                classes[1] = 479; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19443; 
                classes[1] = 62; 
            } else {
                classes[0] = 263; 
                classes[1] = 481; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 334; 
                classes[1] = 460; 
            } else {
                classes[0] = 96; 
                classes[1] = 501; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19461; 
                classes[1] = 45; 
            } else {
                classes[0] = 336; 
                classes[1] = 441; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 258; 
                classes[1] = 468; 
            } else {
                classes[0] = 119; 
                classes[1] = 512; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19350; 
                classes[1] = 67; 
            } else {
                classes[0] = 268; 
                classes[1] = 469; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 339; 
                classes[1] = 499; 
            } else {
                classes[0] = 116; 
                classes[1] = 532; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19410; 
                classes[1] = 60; 
            } else {
                classes[0] = 254; 
                classes[1] = 451; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 396; 
                classes[1] = 469; 
            } else {
                classes[0] = 91; 
                classes[1] = 509; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19439; 
                classes[1] = 56; 
            } else {
                classes[0] = 266; 
                classes[1] = 464; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 346; 
                classes[1] = 461; 
            } else {
                classes[0] = 102; 
                classes[1] = 506; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19377; 
                classes[1] = 60; 
            } else {
                classes[0] = 336; 
                classes[1] = 513; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 270; 
                classes[1] = 483; 
            } else {
                classes[0] = 106; 
                classes[1] = 495; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19459; 
                classes[1] = 56; 
            } else {
                classes[0] = 236; 
                classes[1] = 495; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 335; 
                classes[1] = 477; 
            } else {
                classes[0] = 105; 
                classes[1] = 477; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19393; 
                classes[1] = 43; 
            } else {
                classes[0] = 255; 
                classes[1] = 478; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 374; 
                classes[1] = 516; 
            } else {
                classes[0] = 99; 
                classes[1] = 482; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19468; 
                classes[1] = 60; 
            } else {
                classes[0] = 339; 
                classes[1] = 453; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 264; 
                classes[1] = 452; 
            } else {
                classes[0] = 107; 
                classes[1] = 497; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19342; 
                classes[1] = 60; 
            } else {
                classes[0] = 366; 
                classes[1] = 519; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 233; 
                classes[1] = 506; 
            } else {
                classes[0] = 113; 
                classes[1] = 501; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19399; 
                classes[1] = 67; 
            } else {
                classes[0] = 309; 
                classes[1] = 476; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 279; 
                classes[1] = 498; 
            } else {
                classes[0] = 101; 
                classes[1] = 511; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19430; 
                classes[1] = 52; 
            } else {
                classes[0] = 341; 
                classes[1] = 511; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 262; 
                classes[1] = 457; 
            } else {
                classes[0] = 115; 
                classes[1] = 472; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19364; 
                classes[1] = 71; 
            } else {
                classes[0] = 299; 
                classes[1] = 485; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 343; 
                classes[1] = 421; 
            } else {
                classes[0] = 113; 
                classes[1] = 544; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19411; 
                classes[1] = 70; 
            } else {
                classes[0] = 281; 
                classes[1] = 460; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 324; 
                classes[1] = 470; 
            } else {
                classes[0] = 118; 
                classes[1] = 506; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19398; 
                classes[1] = 48; 
            } else {
                classes[0] = 267; 
                classes[1] = 482; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 338; 
                classes[1] = 474; 
            } else {
                classes[0] = 110; 
                classes[1] = 523; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19440; 
                classes[1] = 58; 
            } else {
                classes[0] = 344; 
                classes[1] = 468; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 256; 
                classes[1] = 507; 
            } else {
                classes[0] = 87; 
                classes[1] = 480; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19383; 
                classes[1] = 76; 
            } else {
                classes[0] = 261; 
                classes[1] = 529; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 354; 
                classes[1] = 463; 
            } else {
                classes[0] = 103; 
                classes[1] = 471; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19387; 
                classes[1] = 65; 
            } else {
                classes[0] = 338; 
                classes[1] = 482; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 297; 
                classes[1] = 502; 
            } else {
                classes[0] = 96; 
                classes[1] = 473; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19426; 
                classes[1] = 37; 
            } else {
                classes[0] = 353; 
                classes[1] = 477; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 249; 
                classes[1] = 477; 
            } else {
                classes[0] = 92; 
                classes[1] = 529; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19432; 
                classes[1] = 67; 
            } else {
                classes[0] = 317; 
                classes[1] = 478; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 290; 
                classes[1] = 447; 
            } else {
                classes[0] = 89; 
                classes[1] = 520; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19446; 
                classes[1] = 49; 
            } else {
                classes[0] = 271; 
                classes[1] = 455; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 340; 
                classes[1] = 522; 
            } else {
                classes[0] = 90; 
                classes[1] = 467; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19434; 
                classes[1] = 62; 
            } else {
                classes[0] = 279; 
                classes[1] = 498; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 323; 
                classes[1] = 460; 
            } else {
                classes[0] = 106; 
                classes[1] = 478; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19504; 
                classes[1] = 58; 
            } else {
                classes[0] = 255; 
                classes[1] = 481; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 279; 
                classes[1] = 491; 
            } else {
                classes[0] = 98; 
                classes[1] = 474; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19367; 
                classes[1] = 46; 
            } else {
                classes[0] = 283; 
                classes[1] = 532; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 349; 
                classes[1] = 462; 
            } else {
                classes[0] = 105; 
                classes[1] = 496; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19314; 
                classes[1] = 54; 
            } else {
                classes[0] = 263; 
                classes[1] = 505; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 388; 
                classes[1] = 478; 
            } else {
                classes[0] = 94; 
                classes[1] = 544; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19422; 
                classes[1] = 51; 
            } else {
                classes[0] = 272; 
                classes[1] = 487; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 363; 
                classes[1] = 458; 
            } else {
                classes[0] = 96; 
                classes[1] = 491; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19386; 
                classes[1] = 45; 
            } else {
                classes[0] = 340; 
                classes[1] = 500; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 263; 
                classes[1] = 508; 
            } else {
                classes[0] = 107; 
                classes[1] = 491; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19411; 
                classes[1] = 61; 
            } else {
                classes[0] = 271; 
                classes[1] = 464; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 379; 
                classes[1] = 470; 
            } else {
                classes[0] = 109; 
                classes[1] = 475; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19411; 
                classes[1] = 54; 
            } else {
                classes[0] = 266; 
                classes[1] = 511; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 365; 
                classes[1] = 441; 
            } else {
                classes[0] = 90; 
                classes[1] = 502; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19420; 
                classes[1] = 69; 
            } else {
                classes[0] = 341; 
                classes[1] = 465; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 291; 
                classes[1] = 479; 
            } else {
                classes[0] = 106; 
                classes[1] = 469; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19409; 
                classes[1] = 70; 
            } else {
                classes[0] = 285; 
                classes[1] = 473; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 335; 
                classes[1] = 470; 
            } else {
                classes[0] = 101; 
                classes[1] = 497; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19366; 
                classes[1] = 46; 
            } else {
                classes[0] = 329; 
                classes[1] = 461; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 259; 
                classes[1] = 513; 
            } else {
                classes[0] = 117; 
                classes[1] = 549; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19395; 
                classes[1] = 47; 
            } else {
                classes[0] = 289; 
                classes[1] = 499; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 345; 
                classes[1] = 472; 
            } else {
                classes[0] = 105; 
                classes[1] = 488; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19395; 
                classes[1] = 59; 
            } else {
                classes[0] = 323; 
                classes[1] = 471; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 295; 
                classes[1] = 471; 
            } else {
                classes[0] = 91; 
                classes[1] = 535; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19465; 
                classes[1] = 65; 
            } else {
                classes[0] = 245; 
                classes[1] = 443; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 329; 
                classes[1] = 506; 
            } else {
                classes[0] = 107; 
                classes[1] = 480; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19439; 
                classes[1] = 60; 
            } else {
                classes[0] = 324; 
                classes[1] = 473; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 264; 
                classes[1] = 479; 
            } else {
                classes[0] = 118; 
                classes[1] = 483; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19414; 
                classes[1] = 56; 
            } else {
                classes[0] = 352; 
                classes[1] = 487; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 261; 
                classes[1] = 464; 
            } else {
                classes[0] = 124; 
                classes[1] = 482; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19466; 
                classes[1] = 55; 
            } else {
                classes[0] = 243; 
                classes[1] = 456; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 322; 
                classes[1] = 491; 
            } else {
                classes[0] = 107; 
                classes[1] = 500; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19437; 
                classes[1] = 58; 
            } else {
                classes[0] = 267; 
                classes[1] = 446; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 332; 
                classes[1] = 478; 
            } else {
                classes[0] = 108; 
                classes[1] = 514; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[0] <= 0.5) {
            if (features[1] <= 0.5) {
                classes[0] = 19435; 
                classes[1] = 68; 
            } else {
                classes[0] = 258; 
                classes[1] = 473; 
            }
        } else {
            if (features[1] <= 0.5) {
                classes[0] = 328; 
                classes[1] = 478; 
            } else {
                classes[0] = 110; 
                classes[1] = 490; 
            }
        }
    
        return findMax(classes);
    });
    
    trees.push(function(features) {
        var classes = new Array(2);
        
        if (features[1] <= 0.5) {
            if (features[0] <= 0.5) {
                classes[0] = 19477; 
                classes[1] = 42; 
            } else {
                classes[0] = 358; 
                classes[1] = 443; 
            }
        } else {
            if (features[0] <= 0.5) {
                classes[0] = 256; 
                classes[1] = 489; 
            } else {
                classes[0] = 88; 
                classes[1] = 487; 
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