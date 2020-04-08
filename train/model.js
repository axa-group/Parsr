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
            
        if (features[1] <= 1.0003218054771423) {
            if (features[6] <= 0.006279716268181801) {
                if (features[0] <= 1.0044215321540833) {
                    classes[0] = 1816; 
                    classes[1] = 0; 
                } else {
                    if (features[0] <= 1.079260766506195) {
                        classes[0] = 9; 
                        classes[1] = 2; 
                    } else {
                        classes[0] = 9; 
                        classes[1] = 0; 
                    }
                }
            } else {
                if (features[1] <= 0.9802578687667847) {
                    if (features[4] <= 1.3929747939109802) {
                        if (features[0] <= 1.0144707560539246) {
                            if (features[1] <= 0.8643448054790497) {
                                classes[0] = 23; 
                                classes[1] = 0; 
                            } else {
                                classes[0] = 6; 
                                classes[1] = 1; 
                            }
                        } else {
                            if (features[5] <= 0.0507067646831274) {
                                classes[0] = 1; 
                                classes[1] = 6; 
                            } else {
                                classes[0] = 0; 
                                classes[1] = 7; 
                            }
                        }
                    } else {
                        if (features[3] <= 0.0009181214263662696) {
                            if (features[5] <= 0.7509610056877136) {
                                classes[0] = 3; 
                                classes[1] = 4; 
                            } else {
                                classes[0] = 0; 
                                classes[1] = 20; 
                            }
                        } else {
                            classes[0] = 0; 
                            classes[1] = 50; 
                        }
                    }
                } else {
                    if (features[0] <= 1.0013200640678406) {
                        if (features[4] <= 0.3541666716337204) {
                            if (features[0] <= 0.9841344058513641) {
                                classes[0] = 5; 
                                classes[1] = 3; 
                            } else {
                                if (features[5] <= 0.5833333432674408) {
                                    if (features[5] <= 0.10555555671453476) {
                                        classes[0] = 6; 
                                        classes[1] = 1; 
                                    } else {
                                        if (features[5] <= 0.2613636404275894) {
                                            classes[0] = 12; 
                                            classes[1] = 0; 
                                        } else {
                                            classes[0] = 6; 
                                            classes[1] = 1; 
                                        }
                                    }
                                } else {
                                    classes[0] = 9; 
                                    classes[1] = 0; 
                                }
                            }
                        } else {
                            if (features[4] <= 1.4166666865348816) {
                                classes[0] = 109; 
                                classes[1] = 0; 
                            } else {
                                if (features[4] <= 2.100000023841858) {
                                    if (features[5] <= 2.474675416946411) {
                                        classes[0] = 14; 
                                        classes[1] = 1; 
                                    } else {
                                        classes[0] = 5; 
                                        classes[1] = 2; 
                                    }
                                } else {
                                    classes[0] = 24; 
                                    classes[1] = 0; 
                                }
                            }
                        }
                    } else {
                        if (features[5] <= 2.026008129119873) {
                            if (features[4] <= 0.46666668355464935) {
                                classes[0] = 9; 
                                classes[1] = 0; 
                            } else {
                                classes[0] = 6; 
                                classes[1] = 1; 
                            }
                        } else {
                            classes[0] = 0; 
                            classes[1] = 7; 
                        }
                    }
                }
            }
        } else {
            if (features[0] <= 1.0145231485366821) {
                if (features[0] <= 0.9902041852474213) {
                    if (features[6] <= 0.0028818566352128983) {
                        if (features[4] <= 0.08543745055794716) {
                            classes[0] = 0; 
                            classes[1] = 27; 
                        } else {
                            classes[0] = 2; 
                            classes[1] = 5; 
                        }
                    } else {
                        classes[0] = 0; 
                        classes[1] = 138; 
                    }
                } else {
                    if (features[0] <= 1.000419795513153) {
                        if (features[2] <= 0.026539931073784828) {
                            if (features[4] <= 0.6039735376834869) {
                                classes[0] = 6; 
                                classes[1] = 1; 
                            } else {
                                classes[0] = 34; 
                                classes[1] = 0; 
                            }
                        } else {
                            classes[0] = 9; 
                            classes[1] = 4; 
                        }
                    } else {
                        if (features[4] <= 0.2109028771519661) {
                            if (features[2] <= 0.5) {
                                classes[0] = 5; 
                                classes[1] = 4; 
                            } else {
                                classes[0] = 7; 
                                classes[1] = 0; 
                            }
                        } else {
                            if (features[5] <= 0.3327961415052414) {
                                classes[0] = 0; 
                                classes[1] = 65; 
                            } else {
                                classes[0] = 4; 
                                classes[1] = 5; 
                            }
                        }
                    }
                }
            } else {
                if (features[0] <= 1.2484405636787415) {
                    if (features[5] <= 0.3999982178211212) {
                        if (features[4] <= 0.1674952581524849) {
                            if (features[6] <= 0.5) {
                                if (features[4] <= 0.10347061604261398) {
                                    classes[0] = 2; 
                                    classes[1] = 6; 
                                } else {
                                    if (features[5] <= 0.18443408608436584) {
                                        classes[0] = 0; 
                                        classes[1] = 34; 
                                    } else {
                                        classes[0] = 1; 
                                        classes[1] = 6; 
                                    }
                                }
                            } else {
                                if (features[3] <= 0.7274927198886871) {
                                    classes[0] = 6; 
                                    classes[1] = 1; 
                                } else {
                                    classes[0] = 0; 
                                    classes[1] = 8; 
                                }
                            }
                        } else {
                            if (features[4] <= 0.33522509038448334) {
                                if (features[5] <= 0.36208634078502655) {
                                    if (features[5] <= 0.15907353907823563) {
                                        if (features[5] <= 0.12557711452245712) {
                                            classes[0] = 0; 
                                            classes[1] = 31; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 6; 
                                        }
                                    } else {
                                        if (features[5] <= 0.24984056502580643) {
                                            classes[0] = 0; 
                                            classes[1] = 191; 
                                        } else {
                                            if (features[5] <= 0.2511499375104904) {
                                                classes[0] = 1; 
                                                classes[1] = 11; 
                                            } else {
                                                classes[0] = 0; 
                                                classes[1] = 100; 
                                            }
                                        }
                                    }
                                } else {
                                    classes[0] = 1; 
                                    classes[1] = 9; 
                                }
                            } else {
                                classes[0] = 0; 
                                classes[1] = 427; 
                            }
                        }
                    } else {
                        if (features[0] <= 1.0462923049926758) {
                            classes[0] = 0; 
                            classes[1] = 45; 
                        } else {
                            if (features[0] <= 1.049116611480713) {
                                classes[0] = 7; 
                                classes[1] = 3; 
                            } else {
                                if (features[5] <= 0.9287125170230865) {
                                    if (features[4] <= 0.6569904088973999) {
                                        classes[0] = 1; 
                                        classes[1] = 6; 
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 36; 
                                    }
                                } else {
                                    if (features[4] <= 1.2158856391906738) {
                                        classes[0] = 3; 
                                        classes[1] = 4; 
                                    } else {
                                        if (features[1] <= 1.1960042715072632) {
                                            classes[0] = 0; 
                                            classes[1] = 10; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 6; 
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (features[0] <= 2.359370231628418) {
                        classes[0] = 0; 
                        classes[1] = 859; 
                    } else {
                        classes[0] = 1; 
                        classes[1] = 10; 
                    }
                }
            }
        }
    
        return findMax(classes);
    };

};

if (typeof process !== 'undefined' && typeof process.argv !== 'undefined') {
    if (process.argv.length - 2 === 8) {

        // Features:
        var features = process.argv.slice(2);

        // Prediction:
        var clf = new DecisionTreeClassifier();
        var prediction = clf.predict(features);
        console.log(prediction);

    }
}