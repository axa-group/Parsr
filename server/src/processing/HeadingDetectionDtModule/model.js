import logger from "../../utils/Logger";

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

        if (features[1] <= 1.0000725984573364) {
            if (features[6] <= 0.004865572787821293) {
                if (features[2] <= 0.02834733948111534) {
                    if (features[0] <= 0.9182713031768799) {
                        if (features[4] <= 1.6388888955116272) {
                            if (features[4] <= 1.3725415468215942) {
                                if (features[4] <= 0.9285714328289032) {
                                    classes[0] = 7;
                                    classes[1] = 0;
                                } else {
                                    if (features[0] <= 0.7142756581306458) {
                                        classes[0] = 0;
                                        classes[1] = 3;
                                    } else {
                                        classes[0] = 4;
                                        classes[1] = 0;
                                    }
                                }
                            } else {
                                classes[0] = 0;
                                classes[1] = 9;
                            }
                        } else {
                            classes[0] = 58;
                            classes[1] = 0;
                        }
                    } else {
                        if (features[0] <= 1.000076949596405) {
                            if (features[4] <= 1.1602563858032227) {
                                classes[0] = 1292;
                                classes[1] = 0;
                            } else {
                                if (features[4] <= 1.360098123550415) {
                                    if (features[5] <= 0.8117647171020508) {
                                        if (features[5] <= 0.7854049205780029) {
                                            classes[0] = 9;
                                            classes[1] = 0;
                                        } else {
                                            classes[0] = 3;
                                            classes[1] = 2;
                                        }
                                    } else {
                                        if (features[4] <= 1.174242377281189) {
                                            if (features[5] <= 5.833333253860474) {
                                                classes[0] = 10;
                                                classes[1] = 0;
                                            } else {
                                                classes[0] = 3;
                                                classes[1] = 1;
                                            }
                                        } else {
                                            classes[0] = 156;
                                            classes[1] = 0;
                                        }
                                    }
                                } else {
                                    classes[0] = 493;
                                    classes[1] = 0;
                                }
                            }
                        } else {
                            if (features[3] <= 0.0016248330939561129) {
                                classes[0] = 40;
                                classes[1] = 0;
                            } else {
                                classes[0] = 1;
                                classes[1] = 4;
                            }
                        }
                    }
                } else {
                    if (features[3] <= 0.9716526567935944) {
                        if (features[5] <= 0.5047846734523773) {
                            if (features[1] <= 0.9834426045417786) {
                                if (features[0] <= 1.0017645955085754) {
                                    classes[0] = 6;
                                    classes[1] = 0;
                                } else {
                                    classes[0] = 1;
                                    classes[1] = 2;
                                }
                            } else {
                                classes[0] = 0;
                                classes[1] = 5;
                            }
                        } else {
                            if (features[5] <= 4.757481098175049) {
                                if (features[1] <= 0.9798345565795898) {
                                    classes[0] = 0;
                                    classes[1] = 53;
                                } else {
                                    if (features[4] <= 0.8778626024723053) {
                                        if (features[1] <= 0.9896382987499237) {
                                            classes[0] = 1;
                                            classes[1] = 2;
                                        } else {
                                            classes[0] = 0;
                                            classes[1] = 32;
                                        }
                                    } else {
                                        if (features[4] <= 1.1981998085975647) {
                                            classes[0] = 3;
                                            classes[1] = 0;
                                        } else {
                                            if (features[0] <= 0.9989102780818939) {
                                                classes[0] = 1;
                                                classes[1] = 2;
                                            } else {
                                                classes[0] = 1;
                                                classes[1] = 4;
                                            }
                                        }
                                    }
                                }
                            } else {
                                classes[0] = 3;
                                classes[1] = 0;
                            }
                        }
                    } else {
                        classes[0] = 9;
                        classes[1] = 0;
                    }
                }
            } else {
                if (features[1] <= 0.9997901320457458) {
                    if (features[5] <= 0.7596153914928436) {
                        if (features[2] <= 0.140573188662529) {
                            if (features[4] <= 0.800708681344986) {
                                classes[0] = 34;
                                classes[1] = 0;
                            } else {
                                if (features[0] <= 0.8183038234710693) {
                                    classes[0] = 4;
                                    classes[1] = 0;
                                } else {
                                    if (features[5] <= 0.07692579180002213) {
                                        if (features[0] <= 1.0894545912742615) {
                                            classes[0] = 3;
                                            classes[1] = 1;
                                        } else {
                                            classes[0] = 3;
                                            classes[1] = 0;
                                        }
                                    } else {
                                        if (features[5] <= 0.6626620590686798) {
                                            classes[0] = 0;
                                            classes[1] = 15;
                                        } else {
                                            classes[0] = 2;
                                            classes[1] = 1;
                                        }
                                    }
                                }
                            }
                        } else {
                            if (features[5] <= 0.01123620942234993) {
                                classes[0] = 4;
                                classes[1] = 0;
                            } else {
                                if (features[1] <= 0.9791958332061768) {
                                    if (features[0] <= 1.0066574215888977) {
                                        if (features[0] <= 0.7365781664848328) {
                                            classes[0] = 0;
                                            classes[1] = 6;
                                        } else {
                                            classes[0] = 5;
                                            classes[1] = 0;
                                        }
                                    } else {
                                        classes[0] = 0;
                                        classes[1] = 14;
                                    }
                                } else {
                                    classes[0] = 0;
                                    classes[1] = 23;
                                }
                            }
                        }
                    } else {
                        if (features[5] <= 1.4984180331230164) {
                            if (features[1] <= 0.4856750816106796) {
                                if (features[2] <= 0.5) {
                                    classes[0] = 7;
                                    classes[1] = 0;
                                } else {
                                    classes[0] = 0;
                                    classes[1] = 10;
                                }
                            } else {
                                if (features[4] <= 1.4278873801231384) {
                                    if (features[4] <= 0.6380482614040375) {
                                        if (features[4] <= 0.0625) {
                                            classes[0] = 0;
                                            classes[1] = 31;
                                        } else {
                                            classes[0] = 4;
                                            classes[1] = 0;
                                        }
                                    } else {
                                        if (features[0] <= 1.9840011596679688) {
                                            if (features[0] <= 0.83385169506073) {
                                                classes[0] = 0;
                                                classes[1] = 171;
                                            } else {
                                                if (features[0] <= 0.8393438458442688) {
                                                    classes[0] = 1;
                                                    classes[1] = 2;
                                                } else {
                                                    if (features[1] <= 0.7802051901817322) {
                                                        if (features[1] <= 0.6563714444637299) {
                                                            classes[0] = 0;
                                                            classes[1] = 44;
                                                        } else {
                                                            classes[0] = 1;
                                                            classes[1] = 2;
                                                        }
                                                    } else {
                                                        classes[0] = 0;
                                                        classes[1] = 210;
                                                    }
                                                }
                                            }
                                        } else {
                                            classes[0] = 1;
                                            classes[1] = 2;
                                        }
                                    }
                                } else {
                                    if (features[5] <= 0.7974803149700165) {
                                        classes[0] = 0;
                                        classes[1] = 3;
                                    } else {
                                        classes[0] = 3;
                                        classes[1] = 0;
                                    }
                                }
                            }
                        } else {
                            if (features[3] <= 0.5) {
                                if (features[2] <= 0.5) {
                                    classes[0] = 8;
                                    classes[1] = 0;
                                } else {
                                    classes[0] = 1;
                                    classes[1] = 2;
                                }
                            } else {
                                if (features[4] <= 0.4093076288700104) {
                                    classes[0] = 3;
                                    classes[1] = 0;
                                } else {
                                    classes[0] = 0;
                                    classes[1] = 17;
                                }
                            }
                        }
                    }
                } else {
                    if (features[2] <= 0.5) {
                        if (features[0] <= 0.99994096159935) {
                            if (features[0] <= 0.9755089581012726) {
                                if (features[6] <= 0.8725175857543945) {
                                    classes[0] = 0;
                                    classes[1] = 3;
                                } else {
                                    if (features[5] <= 0.8785714209079742) {
                                        classes[0] = 3;
                                        classes[1] = 1;
                                    } else {
                                        classes[0] = 16;
                                        classes[1] = 0;
                                    }
                                }
                            } else {
                                if (features[5] <= 1.3645424246788025) {
                                    classes[0] = 0;
                                    classes[1] = 43;
                                } else {
                                    classes[0] = 1;
                                    classes[1] = 2;
                                }
                            }
                        } else {
                            if (features[4] <= 1.025963842868805) {
                                if (features[0] <= 1.0548204183578491) {
                                    if (features[3] <= 0.5) {
                                        classes[0] = 110;
                                        classes[1] = 0;
                                    } else {
                                        if (features[4] <= 0.10555555671453476) {
                                            classes[0] = 4;
                                            classes[1] = 1;
                                        } else {
                                            if (features[4] <= 0.9545454680919647) {
                                                classes[0] = 39;
                                                classes[1] = 0;
                                            } else {
                                                if (features[5] <= 0.8333333432674408) {
                                                    classes[0] = 9;
                                                    classes[1] = 0;
                                                } else {
                                                    if (features[5] <= 1.1111111044883728) {
                                                        classes[0] = 8;
                                                        classes[1] = 1;
                                                    } else {
                                                        classes[0] = 4;
                                                        classes[1] = 0;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    classes[0] = 2;
                                    classes[1] = 1;
                                }
                            } else {
                                if (features[4] <= 1.5833333134651184) {
                                    if (features[3] <= 0.5) {
                                        classes[0] = 13;
                                        classes[1] = 0;
                                    } else {
                                        if (features[5] <= 0.8403712511062622) {
                                            classes[0] = 3;
                                            classes[1] = 0;
                                        } else {
                                            if (features[5] <= 1.482829213142395) {
                                                if (features[5] <= 1.2296658158302307) {
                                                    if (features[4] <= 1.219835877418518) {
                                                        if (features[4] <= 1.0917322635650635) {
                                                            classes[0] = 1;
                                                            classes[1] = 2;
                                                        } else {
                                                            classes[0] = 0;
                                                            classes[1] = 6;
                                                        }
                                                    } else {
                                                        classes[0] = 3;
                                                        classes[1] = 0;
                                                    }
                                                } else {
                                                    classes[0] = 0;
                                                    classes[1] = 8;
                                                }
                                            } else {
                                                classes[0] = 2;
                                                classes[1] = 1;
                                            }
                                        }
                                    }
                                } else {
                                    classes[0] = 32;
                                    classes[1] = 0;
                                }
                            }
                        }
                    } else {
                        if (features[5] <= 1.9900508522987366) {
                            if (features[3] <= 0.5) {
                                if (features[0] <= 1.1937329173088074) {
                                    if (features[5] <= 1.4999839067459106) {
                                        if (features[5] <= 1.0033661723136902) {
                                            if (features[5] <= 0.9849841594696045) {
                                                if (features[5] <= 0.252325177192688) {
                                                    classes[0] = 1;
                                                    classes[1] = 2;
                                                } else {
                                                    classes[0] = 0;
                                                    classes[1] = 37;
                                                }
                                            } else {
                                                classes[0] = 2;
                                                classes[1] = 2;
                                            }
                                        } else {
                                            classes[0] = 0;
                                            classes[1] = 37;
                                        }
                                    } else {
                                        if (features[5] <= 1.5043178796768188) {
                                            classes[0] = 2;
                                            classes[1] = 2;
                                        } else {
                                            classes[0] = 0;
                                            classes[1] = 4;
                                        }
                                    }
                                } else {
                                    classes[0] = 3;
                                    classes[1] = 2;
                                }
                            } else {
                                if (features[0] <= 1.023679494857788) {
                                    classes[0] = 3;
                                    classes[1] = 0;
                                } else {
                                    classes[0] = 1;
                                    classes[1] = 2;
                                }
                            }
                        } else {
                            classes[0] = 8;
                            classes[1] = 0;
                        }
                    }
                }
            }
        } else {
            if (features[0] <= 1.000091791152954) {
                if (features[0] <= 0.9999651312828064) {
                    if (features[1] <= 1.026865839958191) {
                        classes[0] = 0;
                        classes[1] = 67;
                    } else {
                        if (features[0] <= 0.9850197434425354) {
                            if (features[2] <= 0.022024035453796387) {
                                if (features[4] <= 1.2294437885284424) {
                                    if (features[5] <= 0.2830437570810318) {
                                        classes[0] = 3;
                                        classes[1] = 0;
                                    } else {
                                        if (features[1] <= 1.30973881483078) {
                                            if (features[0] <= 0.9518934488296509) {
                                                classes[0] = 0;
                                                classes[1] = 46;
                                            } else {
                                                classes[0] = 1;
                                                classes[1] = 2;
                                            }
                                        } else {
                                            if (features[1] <= 1.900960087776184) {
                                                if (features[0] <= 0.8405362963676453) {
                                                    classes[0] = 4;
                                                    classes[1] = 0;
                                                } else {
                                                    classes[0] = 0;
                                                    classes[1] = 6;
                                                }
                                            } else {
                                                classes[0] = 0;
                                                classes[1] = 11;
                                            }
                                        }
                                    }
                                } else {
                                    classes[0] = 4;
                                    classes[1] = 0;
                                }
                            } else {
                                if (features[6] <= 0.9942930340766907) {
                                    classes[0] = 0;
                                    classes[1] = 71;
                                } else {
                                    if (features[0] <= 0.6858998239040375) {
                                        if (features[5] <= 2.6686487197875977) {
                                            classes[0] = 3;
                                            classes[1] = 1;
                                        } else {
                                            classes[0] = 0;
                                            classes[1] = 5;
                                        }
                                    } else {
                                        if (features[0] <= 0.936511367559433) {
                                            classes[0] = 0;
                                            classes[1] = 17;
                                        } else {
                                            if (features[0] <= 0.9709590971469879) {
                                                classes[0] = 1;
                                                classes[1] = 2;
                                            } else {
                                                classes[0] = 0;
                                                classes[1] = 4;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            classes[0] = 0;
                            classes[1] = 38;
                        }
                    }
                } else {
                    if (features[6] <= 0.15205053985118866) {
                        if (features[5] <= 0.3901515156030655) {
                            if (features[4] <= 0.6428571492433548) {
                                classes[0] = 7;
                                classes[1] = 0;
                            } else {
                                classes[0] = 1;
                                classes[1] = 3;
                            }
                        } else {
                            classes[0] = 46;
                            classes[1] = 0;
                        }
                    } else {
                        if (features[5] <= 1.5833333134651184) {
                            if (features[5] <= 0.768767237663269) {
                                if (features[5] <= 0.13809524476528168) {
                                    classes[0] = 0;
                                    classes[1] = 4;
                                } else {
                                    if (features[5] <= 0.2916666716337204) {
                                        classes[0] = 6;
                                        classes[1] = 0;
                                    } else {
                                        if (features[5] <= 0.45000000298023224) {
                                            if (features[1] <= 1.5394177436828613) {
                                                classes[0] = 2;
                                                classes[1] = 1;
                                            } else {
                                                classes[0] = 0;
                                                classes[1] = 3;
                                            }
                                        } else {
                                            classes[0] = 4;
                                            classes[1] = 1;
                                        }
                                    }
                                }
                            } else {
                                classes[0] = 0;
                                classes[1] = 8;
                            }
                        } else {
                            classes[0] = 5;
                            classes[1] = 0;
                        }
                    }
                }
            } else {
                if (features[5] <= 1.8333333134651184) {
                    if (features[1] <= 2.28619921207428) {
                        if (features[1] <= 1.0478315949440002) {
                            if (features[4] <= 0.16731882095336914) {
                                if (features[4] <= 0.16491913050413132) {
                                    if (features[4] <= 0.11199310421943665) {
                                        if (features[6] <= 0.5) {
                                            classes[0] = 3;
                                            classes[1] = 0;
                                        } else {
                                            if (features[4] <= 0.09840541332960129) {
                                                classes[0] = 0;
                                                classes[1] = 10;
                                            } else {
                                                classes[0] = 2;
                                                classes[1] = 1;
                                            }
                                        }
                                    } else {
                                        if (features[5] <= 0.19736013561487198) {
                                            classes[0] = 0;
                                            classes[1] = 25;
                                        } else {
                                            classes[0] = 1;
                                            classes[1] = 4;
                                        }
                                    }
                                } else {
                                    classes[0] = 4;
                                    classes[1] = 0;
                                }
                            } else {
                                if (features[5] <= 0.35892459750175476) {
                                    if (features[4] <= 0.3341929167509079) {
                                        if (features[4] <= 0.33295682072639465) {
                                            if (features[5] <= 0.15671459585428238) {
                                                if (features[5] <= 0.1512184888124466) {
                                                    classes[0] = 0;
                                                    classes[1] = 18;
                                                } else {
                                                    classes[0] = 1;
                                                    classes[1] = 2;
                                                }
                                            } else {
                                                classes[0] = 0;
                                                classes[1] = 127;
                                            }
                                        } else {
                                            if (features[5] <= 0.31387169659137726) {
                                                classes[0] = 1;
                                                classes[1] = 2;
                                            } else {
                                                classes[0] = 0;
                                                classes[1] = 3;
                                            }
                                        }
                                    } else {
                                        classes[0] = 0;
                                        classes[1] = 152;
                                    }
                                } else {
                                    if (features[1] <= 1.0316776633262634) {
                                        classes[0] = 0;
                                        classes[1] = 108;
                                    } else {
                                        if (features[2] <= 0.4478980004787445) {
                                            classes[0] = 8;
                                            classes[1] = 0;
                                        } else {
                                            if (features[6] <= 0.6384099125862122) {
                                                classes[0] = 0;
                                                classes[1] = 9;
                                            } else {
                                                classes[0] = 2;
                                                classes[1] = 1;
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (features[0] <= 1.1088764667510986) {
                                classes[0] = 0;
                                classes[1] = 426;
                            } else {
                                if (features[0] <= 1.1107061505317688) {
                                    classes[0] = 2;
                                    classes[1] = 1;
                                } else {
                                    if (features[1] <= 2.09553325176239) {
                                        if (features[1] <= 1.1766110062599182) {
                                            if (features[0] <= 1.3128044605255127) {
                                                classes[0] = 0;
                                                classes[1] = 69;
                                            } else {
                                                if (features[0] <= 1.5516636967658997) {
                                                    classes[0] = 2;
                                                    classes[1] = 1;
                                                } else {
                                                    classes[0] = 0;
                                                    classes[1] = 9;
                                                }
                                            }
                                        } else {
                                            if (features[0] <= 1.200232982635498) {
                                                if (features[0] <= 1.196443259716034) {
                                                    classes[0] = 0;
                                                    classes[1] = 68;
                                                } else {
                                                    classes[0] = 1;
                                                    classes[1] = 2;
                                                }
                                            } else {
                                                classes[0] = 0;
                                                classes[1] = 402;
                                            }
                                        }
                                    } else {
                                        classes[0] = 1;
                                        classes[1] = 2;
                                    }
                                }
                            }
                        }
                    } else {
                        if (features[0] <= 1.1975999474525452) {
                            if (features[0] <= 1.064985990524292) {
                                classes[0] = 0;
                                classes[1] = 3;
                            } else {
                                classes[0] = 1;
                                classes[1] = 2;
                            }
                        } else {
                            classes[0] = 3;
                            classes[1] = 0;
                        }
                    }
                } else {
                    if (features[4] <= 1.2666667103767395) {
                        if (features[5] <= 3.0543527603149414) {
                            classes[0] = 2;
                            classes[1] = 2;
                        } else {
                            classes[0] = 0;
                            classes[1] = 21;
                        }
                    } else {
                        classes[0] = 14;
                        classes[1] = 0;
                    }
                }
            }
        }

        return findMax(classes);
    };

};

if (typeof process !== "undefined" && typeof process.argv !== "undefined") {
    if (process.argv.length - 2 === 9) {

        // Features:
        var theFeatures = process.argv.slice(2);

        // Prediction:
        var clf = new DecisionTreeClassifier();
        var prediction = clf.predict(theFeatures);
        logger.info(prediction);

    }
}
