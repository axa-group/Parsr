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
            
        if (features[1] <= 1.0227156281471252) {
            if (features[2] <= 0.5) {
                if (features[0] <= 1.043803334236145) {
                    if (features[1] <= 0.9897591769695282) {
                        if (features[0] <= 0.9873912334442139) {
                            if (features[0] <= 0.7054910659790039) {
                                if (features[1] <= 0.9254307150840759) {
                                    classes[0] = 84; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[1] <= 0.9334987998008728) {
                                        classes[0] = 0; 
                                        classes[1] = 25; 
                                    } else {
                                        classes[0] = 5; 
                                        classes[1] = 0; 
                                    }
                                }
                            } else {
                                if (features[4] <= 0.44949495792388916) {
                                    if (features[1] <= 0.9803041517734528) {
                                        if (features[0] <= 0.8817856907844543) {
                                            classes[0] = 10; 
                                            classes[1] = 0; 
                                        } else {
                                            if (features[3] <= 0.4642857164144516) {
                                                if (features[1] <= 0.9748193323612213) {
                                                    classes[0] = 11; 
                                                    classes[1] = 0; 
                                                } else {
                                                    if (features[4] <= 0.1458333358168602) {
                                                        classes[0] = 0; 
                                                        classes[1] = 95; 
                                                    } else {
                                                        if (features[4] <= 0.3541666716337204) {
                                                            if (features[4] <= 0.21111111342906952) {
                                                                if (features[3] <= 0.21111111342906952) {
                                                                    classes[0] = 3; 
                                                                    classes[1] = 0; 
                                                                } else {
                                                                    if (features[3] <= 0.2678571492433548) {
                                                                        if (features[4] <= 0.19090909510850906) {
                                                                            classes[0] = 1; 
                                                                            classes[1] = 19; 
                                                                        } else {
                                                                            if (features[3] <= 0.2361111119389534) {
                                                                                if (features[5] <= 0.5) {
                                                                                    classes[0] = 1; 
                                                                                    classes[1] = 0; 
                                                                                } else {
                                                                                    classes[0] = 0; 
                                                                                    classes[1] = 12; 
                                                                                }
                                                                            } else {
                                                                                classes[0] = 2; 
                                                                                classes[1] = 0; 
                                                                            }
                                                                        }
                                                                    } else {
                                                                        classes[0] = 3; 
                                                                        classes[1] = 0; 
                                                                    }
                                                                }
                                                            } else {
                                                                classes[0] = 16; 
                                                                classes[1] = 0; 
                                                            }
                                                        } else {
                                                            if (features[3] <= 0.4017857164144516) {
                                                                if (features[5] <= 0.5) {
                                                                    classes[0] = 0; 
                                                                    classes[1] = 20; 
                                                                } else {
                                                                    if (features[3] <= 0.3541666716337204) {
                                                                        classes[0] = 1; 
                                                                        classes[1] = 0; 
                                                                    } else {
                                                                        classes[0] = 0; 
                                                                        classes[1] = 17; 
                                                                    }
                                                                }
                                                            } else {
                                                                classes[0] = 1; 
                                                                classes[1] = 0; 
                                                            }
                                                        }
                                                    }
                                                }
                                            } else {
                                                if (features[5] <= 0.5) {
                                                    if (features[1] <= 0.4000000059604645) {
                                                        classes[0] = 1; 
                                                        classes[1] = 0; 
                                                    } else {
                                                        classes[0] = 0; 
                                                        classes[1] = 182; 
                                                    }
                                                } else {
                                                    if (features[3] <= 1.2916666865348816) {
                                                        if (features[0] <= 0.9748193323612213) {
                                                            classes[0] = 5; 
                                                            classes[1] = 0; 
                                                        } else {
                                                            classes[0] = 0; 
                                                            classes[1] = 10; 
                                                        }
                                                    } else {
                                                        classes[0] = 0; 
                                                        classes[1] = 25; 
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        classes[0] = 13; 
                                        classes[1] = 0; 
                                    }
                                } else {
                                    if (features[3] <= 1.162500023841858) {
                                        if (features[3] <= 0.5590277910232544) {
                                            if (features[1] <= 0.9692637622356415) {
                                                classes[0] = 28; 
                                                classes[1] = 0; 
                                            } else {
                                                if (features[3] <= 0.4652777910232544) {
                                                    classes[0] = 4; 
                                                    classes[1] = 0; 
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 15; 
                                                }
                                            }
                                        } else {
                                            classes[0] = 94; 
                                            classes[1] = 0; 
                                        }
                                    } else {
                                        if (features[1] <= 0.7224983870983124) {
                                            if (features[1] <= 0.6073525846004486) {
                                                if (features[3] <= 4.416666746139526) {
                                                    classes[0] = 2; 
                                                    classes[1] = 0; 
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 15; 
                                                }
                                            } else {
                                                classes[0] = 0; 
                                                classes[1] = 83; 
                                            }
                                        } else {
                                            if (features[4] <= 1.6071428656578064) {
                                                if (features[5] <= 0.5) {
                                                    if (features[3] <= 1.2111111283302307) {
                                                        classes[0] = 0; 
                                                        classes[1] = 18; 
                                                    } else {
                                                        classes[0] = 25; 
                                                        classes[1] = 0; 
                                                    }
                                                } else {
                                                    if (features[3] <= 1.4722222089767456) {
                                                        classes[0] = 6; 
                                                        classes[1] = 0; 
                                                    } else {
                                                        if (features[1] <= 0.7950136065483093) {
                                                            classes[0] = 5; 
                                                            classes[1] = 0; 
                                                        } else {
                                                            if (features[4] <= 0.5584415793418884) {
                                                                classes[0] = 1; 
                                                                classes[1] = 0; 
                                                            } else {
                                                                if (features[3] <= 6.75) {
                                                                    if (features[1] <= 0.9827947318553925) {
                                                                        if (features[1] <= 0.9488643109798431) {
                                                                            if (features[4] <= 0.7596153914928436) {
                                                                                classes[0] = 1; 
                                                                                classes[1] = 0; 
                                                                            } else {
                                                                                if (features[3] <= 2.75) {
                                                                                    classes[0] = 0; 
                                                                                    classes[1] = 56; 
                                                                                } else {
                                                                                    if (features[3] <= 5.25) {
                                                                                        classes[0] = 2; 
                                                                                        classes[1] = 0; 
                                                                                    } else {
                                                                                        classes[0] = 0; 
                                                                                        classes[1] = 19; 
                                                                                    }
                                                                                }
                                                                            }
                                                                        } else {
                                                                            classes[0] = 2; 
                                                                            classes[1] = 0; 
                                                                        }
                                                                    } else {
                                                                        classes[0] = 0; 
                                                                        classes[1] = 22; 
                                                                    }
                                                                } else {
                                                                    classes[0] = 1; 
                                                                    classes[1] = 0; 
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            } else {
                                                classes[0] = 30; 
                                                classes[1] = 0; 
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (features[5] <= 0.5) {
                                if (features[1] <= 0.9857544302940369) {
                                    classes[0] = 450; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[4] <= 0.375) {
                                        if (features[1] <= 0.9868838489055634) {
                                            classes[0] = 0; 
                                            classes[1] = 20; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        }
                                    } else {
                                        classes[0] = 28; 
                                        classes[1] = 0; 
                                    }
                                }
                            } else {
                                if (features[1] <= 0.9706383943557739) {
                                    if (features[4] <= 1.875) {
                                        classes[0] = 106; 
                                        classes[1] = 0; 
                                    } else {
                                        if (features[3] <= 1.25) {
                                            classes[0] = 8; 
                                            classes[1] = 0; 
                                        } else {
                                            if (features[3] <= 2.75) {
                                                classes[0] = 0; 
                                                classes[1] = 35; 
                                            } else {
                                                classes[0] = 1; 
                                                classes[1] = 0; 
                                            }
                                        }
                                    }
                                } else {
                                    if (features[4] <= 0.5576923191547394) {
                                        if (features[4] <= 0.22142858058214188) {
                                            classes[0] = 2; 
                                            classes[1] = 0; 
                                        } else {
                                            if (features[3] <= 2.5) {
                                                classes[0] = 0; 
                                                classes[1] = 62; 
                                            } else {
                                                classes[0] = 1; 
                                                classes[1] = 0; 
                                            }
                                        }
                                    } else {
                                        classes[0] = 11; 
                                        classes[1] = 0; 
                                    }
                                }
                            }
                        }
                    } else {
                        if (features[4] <= 0.5857843160629272) {
                            if (features[0] <= 0.9804284870624542) {
                                if (features[3] <= 0.75) {
                                    if (features[3] <= 0.22500000149011612) {
                                        classes[0] = 10; 
                                        classes[1] = 0; 
                                    } else {
                                        if (features[3] <= 0.4017857164144516) {
                                            if (features[0] <= 0.5843425393104553) {
                                                classes[0] = 1; 
                                                classes[1] = 0; 
                                            } else {
                                                if (features[4] <= 0.375) {
                                                    if (features[3] <= 0.2916666716337204) {
                                                        classes[0] = 0; 
                                                        classes[1] = 17; 
                                                    } else {
                                                        classes[0] = 1; 
                                                        classes[1] = 0; 
                                                    }
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 41; 
                                                }
                                            }
                                        } else {
                                            if (features[4] <= 0.19090909510850906) {
                                                classes[0] = 0; 
                                                classes[1] = 16; 
                                            } else {
                                                classes[0] = 6; 
                                                classes[1] = 0; 
                                            }
                                        }
                                    }
                                } else {
                                    classes[0] = 17; 
                                    classes[1] = 0; 
                                }
                            } else {
                                if (features[1] <= 1.0040305852890015) {
                                    if (features[5] <= 0.5) {
                                        classes[0] = 848; 
                                        classes[1] = 0; 
                                    } else {
                                        if (features[4] <= 0.4226190447807312) {
                                            if (features[3] <= 0.10555555671453476) {
                                                if (features[3] <= 0.09545454755425453) {
                                                    classes[0] = 29; 
                                                    classes[1] = 0; 
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 12; 
                                                }
                                            } else {
                                                classes[0] = 166; 
                                                classes[1] = 0; 
                                            }
                                        } else {
                                            if (features[4] <= 0.4365079402923584) {
                                                if (features[3] <= 0.800000011920929) {
                                                    classes[0] = 1; 
                                                    classes[1] = 0; 
                                                } else {
                                                    classes[0] = 1; 
                                                    classes[1] = 21; 
                                                }
                                            } else {
                                                if (features[3] <= 0.380952388048172) {
                                                    if (features[3] <= 0.2666666731238365) {
                                                        classes[0] = 7; 
                                                        classes[1] = 0; 
                                                    } else {
                                                        classes[0] = 9; 
                                                        classes[1] = 17; 
                                                    }
                                                } else {
                                                    if (features[3] <= 0.9000000059604645) {
                                                        classes[0] = 25; 
                                                        classes[1] = 0; 
                                                    } else {
                                                        if (features[3] <= 1.125) {
                                                            if (features[4] <= 0.5277777910232544) {
                                                                classes[0] = 17; 
                                                                classes[1] = 11; 
                                                            } else {
                                                                classes[0] = 2; 
                                                                classes[1] = 0; 
                                                            }
                                                        } else {
                                                            classes[0] = 7; 
                                                            classes[1] = 0; 
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (features[1] <= 1.0051206946372986) {
                                        if (features[3] <= 1.3333333134651184) {
                                            classes[0] = 0; 
                                            classes[1] = 47; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        }
                                    } else {
                                        classes[0] = 47; 
                                        classes[1] = 0; 
                                    }
                                }
                            }
                        } else {
                            if (features[3] <= 0.343137264251709) {
                                if (features[3] <= 0.32575757801532745) {
                                    classes[0] = 73; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[4] <= 1.1666666865348816) {
                                        if (features[4] <= 0.875) {
                                            classes[0] = 4; 
                                            classes[1] = 0; 
                                        } else {
                                            if (features[0] <= 0.8975591063499451) {
                                                classes[0] = 2; 
                                                classes[1] = 0; 
                                            } else {
                                                if (features[0] <= 0.9947738349437714) {
                                                    classes[0] = 0; 
                                                    classes[1] = 14; 
                                                } else {
                                                    if (features[5] <= 0.5) {
                                                        if (features[1] <= 1.01113760471344) {
                                                            classes[0] = 1; 
                                                            classes[1] = 23; 
                                                        } else {
                                                            classes[0] = 1; 
                                                            classes[1] = 0; 
                                                        }
                                                    } else {
                                                        classes[0] = 5; 
                                                        classes[1] = 0; 
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        classes[0] = 12; 
                                        classes[1] = 0; 
                                    }
                                }
                            } else {
                                if (features[0] <= 0.6414738595485687) {
                                    if (features[0] <= 0.6339712738990784) {
                                        classes[0] = 42; 
                                        classes[1] = 0; 
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 20; 
                                    }
                                } else {
                                    if (features[4] <= 2.9285714626312256) {
                                        if (features[4] <= 1.0227272510528564) {
                                            if (features[0] <= 0.9798158705234528) {
                                                if (features[0] <= 0.977789044380188) {
                                                    classes[0] = 192; 
                                                    classes[1] = 0; 
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 20; 
                                                }
                                            } else {
                                                if (features[3] <= 1.4807692170143127) {
                                                    classes[0] = 3548; 
                                                    classes[1] = 0; 
                                                } else {
                                                    if (features[3] <= 2.055555582046509) {
                                                        if (features[4] <= 0.9045454561710358) {
                                                            if (features[4] <= 0.8973684012889862) {
                                                                if (features[5] <= 0.5) {
                                                                    classes[0] = 81; 
                                                                    classes[1] = 0; 
                                                                } else {
                                                                    if (features[4] <= 0.6904762089252472) {
                                                                        classes[0] = 2; 
                                                                        classes[1] = 12; 
                                                                    } else {
                                                                        classes[0] = 4; 
                                                                        classes[1] = 0; 
                                                                    }
                                                                }
                                                            } else {
                                                                if (features[3] <= 1.649999976158142) {
                                                                    if (features[1] <= 1.0063909888267517) {
                                                                        classes[0] = 4; 
                                                                        classes[1] = 19; 
                                                                    } else {
                                                                        classes[0] = 1; 
                                                                        classes[1] = 0; 
                                                                    }
                                                                } else {
                                                                    classes[0] = 4; 
                                                                    classes[1] = 0; 
                                                                }
                                                            }
                                                        } else {
                                                            classes[0] = 155; 
                                                            classes[1] = 0; 
                                                        }
                                                    } else {
                                                        classes[0] = 348; 
                                                        classes[1] = 0; 
                                                    }
                                                }
                                            }
                                        } else {
                                            classes[0] = 3628; 
                                            classes[1] = 0; 
                                        }
                                    } else {
                                        if (features[5] <= 0.5) {
                                            if (features[0] <= 1.0020850896835327) {
                                                classes[0] = 703; 
                                                classes[1] = 0; 
                                            } else {
                                                if (features[3] <= 0.675000011920929) {
                                                    classes[0] = 0; 
                                                    classes[1] = 16; 
                                                } else {
                                                    classes[0] = 15; 
                                                    classes[1] = 0; 
                                                }
                                            }
                                        } else {
                                            if (features[4] <= 3.100000023841858) {
                                                if (features[3] <= 1.4166666865348816) {
                                                    classes[0] = 9; 
                                                    classes[1] = 0; 
                                                } else {
                                                    if (features[3] <= 1.9500000476837158) {
                                                        if (features[1] <= 1.01113760471344) {
                                                            classes[0] = 5; 
                                                            classes[1] = 26; 
                                                        } else {
                                                            classes[0] = 1; 
                                                            classes[1] = 0; 
                                                        }
                                                    } else {
                                                        classes[0] = 5; 
                                                        classes[1] = 0; 
                                                    }
                                                }
                                            } else {
                                                classes[0] = 60; 
                                                classes[1] = 0; 
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (features[0] <= 1.1026315689086914) {
                        if (features[0] <= 1.0922219157218933) {
                            if (features[4] <= 2.600000023841858) {
                                classes[0] = 15; 
                                classes[1] = 0; 
                            } else {
                                classes[0] = 0; 
                                classes[1] = 18; 
                            }
                        } else {
                            if (features[4] <= 0.1666666716337204) {
                                classes[0] = 2; 
                                classes[1] = 0; 
                            } else {
                                if (features[3] <= 7.0) {
                                    if (features[4] <= 1.5333333015441895) {
                                        if (features[4] <= 1.300000011920929) {
                                            if (features[3] <= 4.0) {
                                                classes[0] = 0; 
                                                classes[1] = 105; 
                                            } else {
                                                if (features[5] <= 0.5) {
                                                    classes[0] = 1; 
                                                    classes[1] = 0; 
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 52; 
                                                }
                                            }
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        }
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 149; 
                                    }
                                } else {
                                    classes[0] = 2; 
                                    classes[1] = 0; 
                                }
                            }
                        }
                    } else {
                        if (features[0] <= 1.4821605682373047) {
                            if (features[4] <= 3.166666626930237) {
                                classes[0] = 117; 
                                classes[1] = 0; 
                            } else {
                                if (features[4] <= 3.666666626930237) {
                                    classes[0] = 0; 
                                    classes[1] = 20; 
                                } else {
                                    classes[0] = 6; 
                                    classes[1] = 0; 
                                }
                            }
                        } else {
                            if (features[3] <= 0.38750000298023224) {
                                if (features[0] <= 1.502918303012848) {
                                    classes[0] = 1; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[1] <= 0.6564202308654785) {
                                        if (features[0] <= 2.3375236988067627) {
                                            classes[0] = 0; 
                                            classes[1] = 16; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        }
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 57; 
                                    }
                                }
                            } else {
                                if (features[4] <= 2.125) {
                                    if (features[5] <= 0.5) {
                                        classes[0] = 21; 
                                        classes[1] = 0; 
                                    } else {
                                        if (features[0] <= 1.6879671812057495) {
                                            if (features[0] <= 1.5421315431594849) {
                                                classes[0] = 2; 
                                                classes[1] = 0; 
                                            } else {
                                                classes[0] = 0; 
                                                classes[1] = 39; 
                                            }
                                        } else {
                                            classes[0] = 5; 
                                            classes[1] = 0; 
                                        }
                                    }
                                } else {
                                    if (features[4] <= 5.0) {
                                        if (features[3] <= 10.5) {
                                            classes[0] = 0; 
                                            classes[1] = 53; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        }
                                    } else {
                                        classes[0] = 1; 
                                        classes[1] = 0; 
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if (features[4] <= 0.6339285671710968) {
                    if (features[1] <= 0.6324543058872223) {
                        classes[0] = 10; 
                        classes[1] = 0; 
                    } else {
                        if (features[4] <= 0.4833333343267441) {
                            if (features[0] <= 0.8682246804237366) {
                                classes[0] = 0; 
                                classes[1] = 127; 
                            } else {
                                if (features[1] <= 0.9818584322929382) {
                                    classes[0] = 9; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[3] <= 0.11250000074505806) {
                                        classes[0] = 4; 
                                        classes[1] = 0; 
                                    } else {
                                        if (features[1] <= 0.9840269684791565) {
                                            classes[0] = 0; 
                                            classes[1] = 151; 
                                        } else {
                                            if (features[0] <= 1.0027534365653992) {
                                                if (features[3] <= 0.5833333432674408) {
                                                    classes[0] = 8; 
                                                    classes[1] = 0; 
                                                } else {
                                                    if (features[4] <= 0.38750000298023224) {
                                                        if (features[5] <= 0.5) {
                                                            classes[0] = 1; 
                                                            classes[1] = 0; 
                                                        } else {
                                                            if (features[1] <= 0.9939930438995361) {
                                                                classes[0] = 1; 
                                                                classes[1] = 0; 
                                                            } else {
                                                                if (features[1] <= 1.0048270225524902) {
                                                                    classes[0] = 0; 
                                                                    classes[1] = 43; 
                                                                } else {
                                                                    classes[0] = 1; 
                                                                    classes[1] = 0; 
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        classes[0] = 2; 
                                                        classes[1] = 0; 
                                                    }
                                                }
                                            } else {
                                                if (features[0] <= 1.0144514441490173) {
                                                    classes[0] = 0; 
                                                    classes[1] = 242; 
                                                } else {
                                                    if (features[0] <= 1.014864206314087) {
                                                        classes[0] = 5; 
                                                        classes[1] = 0; 
                                                    } else {
                                                        if (features[3] <= 1.375) {
                                                            if (features[0] <= 1.6847838759422302) {
                                                                classes[0] = 0; 
                                                                classes[1] = 76; 
                                                            } else {
                                                                classes[0] = 1; 
                                                                classes[1] = 0; 
                                                            }
                                                        } else {
                                                            classes[0] = 2; 
                                                            classes[1] = 0; 
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (features[4] <= 0.5147058963775635) {
                                if (features[1] <= 0.991230696439743) {
                                    if (features[1] <= 0.9377481639385223) {
                                        classes[0] = 1; 
                                        classes[1] = 0; 
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 30; 
                                    }
                                } else {
                                    classes[0] = 17; 
                                    classes[1] = 0; 
                                }
                            } else {
                                if (features[1] <= 0.8223931193351746) {
                                    classes[0] = 2; 
                                    classes[1] = 0; 
                                } else {
                                    classes[0] = 0; 
                                    classes[1] = 95; 
                                }
                            }
                        }
                    }
                } else {
                    if (features[1] <= 1.014864206314087) {
                        if (features[3] <= 2.100000023841858) {
                            if (features[3] <= 1.0982142686843872) {
                                if (features[3] <= 0.6568627655506134) {
                                    if (features[4] <= 0.7083333432674408) {
                                        classes[0] = 3; 
                                        classes[1] = 0; 
                                    } else {
                                        if (features[4] <= 0.9230769276618958) {
                                            classes[0] = 0; 
                                            classes[1] = 50; 
                                        } else {
                                            if (features[3] <= 0.14761904999613762) {
                                                if (features[5] <= 0.5) {
                                                    classes[0] = 0; 
                                                    classes[1] = 51; 
                                                } else {
                                                    if (features[4] <= 1.5) {
                                                        classes[0] = 3; 
                                                        classes[1] = 0; 
                                                    } else {
                                                        if (features[4] <= 2.100000023841858) {
                                                            classes[0] = 0; 
                                                            classes[1] = 32; 
                                                        } else {
                                                            classes[0] = 3; 
                                                            classes[1] = 0; 
                                                        }
                                                    }
                                                }
                                            } else {
                                                if (features[3] <= 0.5227272808551788) {
                                                    classes[0] = 13; 
                                                    classes[1] = 0; 
                                                } else {
                                                    if (features[3] <= 0.5584415793418884) {
                                                        classes[0] = 0; 
                                                        classes[1] = 13; 
                                                    } else {
                                                        classes[0] = 3; 
                                                        classes[1] = 0; 
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    classes[0] = 62; 
                                    classes[1] = 0; 
                                }
                            } else {
                                if (features[4] <= 2.625) {
                                    if (features[5] <= 0.5) {
                                        if (features[4] <= 0.6785714328289032) {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        } else {
                                            if (features[1] <= 0.9356751441955566) {
                                                if (features[1] <= 0.7873810231685638) {
                                                    classes[0] = 0; 
                                                    classes[1] = 14; 
                                                } else {
                                                    classes[0] = 1; 
                                                    classes[1] = 0; 
                                                }
                                            } else {
                                                classes[0] = 0; 
                                                classes[1] = 66; 
                                            }
                                        }
                                    } else {
                                        if (features[3] <= 1.550000011920929) {
                                            classes[0] = 8; 
                                            classes[1] = 0; 
                                        } else {
                                            if (features[4] <= 1.9166666865348816) {
                                                if (features[0] <= 0.9006929695606232) {
                                                    classes[0] = 3; 
                                                    classes[1] = 0; 
                                                } else {
                                                    if (features[1] <= 1.007248044013977) {
                                                        if (features[0] <= 1.007248044013977) {
                                                            classes[0] = 0; 
                                                            classes[1] = 66; 
                                                        } else {
                                                            if (features[3] <= 1.7083333134651184) {
                                                                classes[0] = 0; 
                                                                classes[1] = 19; 
                                                            } else {
                                                                classes[0] = 1; 
                                                                classes[1] = 0; 
                                                            }
                                                        }
                                                    } else {
                                                        classes[0] = 2; 
                                                        classes[1] = 0; 
                                                    }
                                                }
                                            } else {
                                                classes[0] = 5; 
                                                classes[1] = 0; 
                                            }
                                        }
                                    }
                                } else {
                                    classes[0] = 6; 
                                    classes[1] = 0; 
                                }
                            }
                        } else {
                            classes[0] = 15; 
                            classes[1] = 0; 
                        }
                    } else {
                        classes[0] = 0; 
                        classes[1] = 59; 
                    }
                }
            }
        } else {
            if (features[0] <= 1.020904004573822) {
                if (features[0] <= 0.9766592085361481) {
                    if (features[1] <= 1.031262993812561) {
                        classes[0] = 3; 
                        classes[1] = 0; 
                    } else {
                        if (features[3] <= 6.0) {
                            if (features[4] <= 0.9444444477558136) {
                                if (features[0] <= 0.9658730030059814) {
                                    if (features[1] <= 2.077154517173767) {
                                        if (features[1] <= 1.0818834900856018) {
                                            if (features[1] <= 1.0705872774124146) {
                                                classes[0] = 0; 
                                                classes[1] = 95; 
                                            } else {
                                                classes[0] = 1; 
                                                classes[1] = 0; 
                                            }
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 420; 
                                        }
                                    } else {
                                        if (features[1] <= 2.1513705253601074) {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 90; 
                                        }
                                    }
                                } else {
                                    if (features[2] <= 0.5) {
                                        classes[0] = 2; 
                                        classes[1] = 0; 
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 25; 
                                    }
                                }
                            } else {
                                if (features[0] <= 0.3753630220890045) {
                                    if (features[4] <= 3.666666626930237) {
                                        classes[0] = 0; 
                                        classes[1] = 237; 
                                    } else {
                                        if (features[1] <= 1.2639021277427673) {
                                            if (features[1] <= 1.0447620749473572) {
                                                classes[0] = 0; 
                                                classes[1] = 9; 
                                            } else {
                                                classes[0] = 3; 
                                                classes[1] = 0; 
                                            }
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 55; 
                                        }
                                    }
                                } else {
                                    if (features[4] <= 2.75) {
                                        if (features[3] <= 2.649999976158142) {
                                            classes[0] = 7; 
                                            classes[1] = 0; 
                                        } else {
                                            if (features[5] <= 0.5) {
                                                classes[0] = 1; 
                                                classes[1] = 0; 
                                            } else {
                                                classes[0] = 0; 
                                                classes[1] = 13; 
                                            }
                                        }
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 81; 
                                    }
                                }
                            }
                        } else {
                            classes[0] = 1; 
                            classes[1] = 0; 
                        }
                    }
                } else {
                    if (features[1] <= 1.0975769758224487) {
                        if (features[1] <= 1.0935278534889221) {
                            if (features[2] <= 0.5) {
                                if (features[1] <= 1.0781130194664001) {
                                    classes[0] = 46; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[4] <= 1.4583333432674408) {
                                        classes[0] = 5; 
                                        classes[1] = 0; 
                                    } else {
                                        if (features[4] <= 2.325000047683716) {
                                            classes[0] = 0; 
                                            classes[1] = 11; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        }
                                    }
                                }
                            } else {
                                if (features[1] <= 1.0450940132141113) {
                                    if (features[3] <= 6.25) {
                                        classes[0] = 20; 
                                        classes[1] = 0; 
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 18; 
                                    }
                                } else {
                                    if (features[1] <= 1.0508867502212524) {
                                        if (features[3] <= 0.15833333507180214) {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 80; 
                                        }
                                    } else {
                                        classes[0] = 2; 
                                        classes[1] = 0; 
                                    }
                                }
                            }
                        } else {
                            if (features[4] <= 0.6904762089252472) {
                                classes[0] = 0; 
                                classes[1] = 228; 
                            } else {
                                classes[0] = 1; 
                                classes[1] = 0; 
                            }
                        }
                    } else {
                        if (features[2] <= 0.5) {
                            if (features[1] <= 1.491103172302246) {
                                if (features[1] <= 1.1222743391990662) {
                                    if (features[1] <= 1.1153556108474731) {
                                        classes[0] = 16; 
                                        classes[1] = 0; 
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 16; 
                                    }
                                } else {
                                    classes[0] = 148; 
                                    classes[1] = 0; 
                                }
                            } else {
                                if (features[4] <= 2.125) {
                                    if (features[4] <= 0.7249999940395355) {
                                        classes[0] = 3; 
                                        classes[1] = 0; 
                                    } else {
                                        if (features[0] <= 0.9963167607784271) {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        } else {
                                            if (features[3] <= 1.4166666865348816) {
                                                if (features[0] <= 1.0003995299339294) {
                                                    if (features[4] <= 1.5) {
                                                        classes[0] = 0; 
                                                        classes[1] = 26; 
                                                    } else {
                                                        if (features[1] <= 1.6899088025093079) {
                                                            classes[0] = 1; 
                                                            classes[1] = 0; 
                                                        } else {
                                                            classes[0] = 0; 
                                                            classes[1] = 24; 
                                                        }
                                                    }
                                                } else {
                                                    classes[0] = 1; 
                                                    classes[1] = 0; 
                                                }
                                            } else {
                                                classes[0] = 1; 
                                                classes[1] = 0; 
                                            }
                                        }
                                    }
                                } else {
                                    classes[0] = 20; 
                                    classes[1] = 0; 
                                }
                            }
                        } else {
                            if (features[5] <= 0.5) {
                                classes[0] = 5; 
                                classes[1] = 0; 
                            } else {
                                if (features[3] <= 0.24038461595773697) {
                                    classes[0] = 3; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[4] <= 0.5500000007450581) {
                                        if (features[4] <= 0.09600614383816719) {
                                            classes[0] = 0; 
                                            classes[1] = 21; 
                                        } else {
                                            classes[0] = 2; 
                                            classes[1] = 0; 
                                        }
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 70; 
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if (features[4] <= 0.9642857015132904) {
                    if (features[0] <= 1.048198401927948) {
                        if (features[2] <= 0.5) {
                            classes[0] = 5; 
                            classes[1] = 0; 
                        } else {
                            if (features[3] <= 0.17424242943525314) {
                                if (features[4] <= 0.1180555559694767) {
                                    if (features[5] <= 0.5) {
                                        if (features[3] <= 0.12142857536673546) {
                                            if (features[4] <= 0.09401709586381912) {
                                                classes[0] = 1; 
                                                classes[1] = 26; 
                                            } else {
                                                classes[0] = 1; 
                                                classes[1] = 0; 
                                            }
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 33; 
                                        }
                                    } else {
                                        classes[0] = 6; 
                                        classes[1] = 0; 
                                    }
                                } else {
                                    if (features[4] <= 0.19090909510850906) {
                                        classes[0] = 0; 
                                        classes[1] = 66; 
                                    } else {
                                        if (features[3] <= 0.14358974993228912) {
                                            classes[0] = 0; 
                                            classes[1] = 27; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        }
                                    }
                                }
                            } else {
                                if (features[1] <= 1.163573443889618) {
                                    if (features[4] <= 0.8055555522441864) {
                                        if (features[3] <= 0.2928571552038193) {
                                            if (features[4] <= 0.1678321734070778) {
                                                classes[0] = 1; 
                                                classes[1] = 0; 
                                            } else {
                                                if (features[3] <= 0.2678571492433548) {
                                                    classes[0] = 0; 
                                                    classes[1] = 142; 
                                                } else {
                                                    if (features[0] <= 1.040254533290863) {
                                                        classes[0] = 0; 
                                                        classes[1] = 44; 
                                                    } else {
                                                        if (features[4] <= 0.21590909361839294) {
                                                            classes[0] = 0; 
                                                            classes[1] = 15; 
                                                        } else {
                                                            classes[0] = 1; 
                                                            classes[1] = 0; 
                                                        }
                                                    }
                                                }
                                            }
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 817; 
                                        }
                                    } else {
                                        if (features[4] <= 0.8666666448116302) {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 22; 
                                        }
                                    }
                                } else {
                                    classes[0] = 1; 
                                    classes[1] = 0; 
                                }
                            }
                        }
                    } else {
                        if (features[3] <= 0.12771739065647125) {
                            if (features[2] <= 0.5) {
                                if (features[3] <= 0.10101010277867317) {
                                    classes[0] = 3; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[4] <= 0.2380952462553978) {
                                        if (features[4] <= 0.12142857536673546) {
                                            classes[0] = 0; 
                                            classes[1] = 41; 
                                        } else {
                                            if (features[1] <= 1.0970149040222168) {
                                                classes[0] = 0; 
                                                classes[1] = 19; 
                                            } else {
                                                classes[0] = 1; 
                                                classes[1] = 0; 
                                            }
                                        }
                                    } else {
                                        classes[0] = 1; 
                                        classes[1] = 0; 
                                    }
                                }
                            } else {
                                if (features[4] <= 0.05012531392276287) {
                                    if (features[0] <= 1.16842120885849) {
                                        classes[0] = 2; 
                                        classes[1] = 0; 
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 34; 
                                    }
                                } else {
                                    classes[0] = 0; 
                                    classes[1] = 341; 
                                }
                            }
                        } else {
                            if (features[4] <= 0.32575757801532745) {
                                classes[0] = 0; 
                                classes[1] = 3055; 
                            } else {
                                if (features[5] <= 0.5) {
                                    classes[0] = 0; 
                                    classes[1] = 1214; 
                                } else {
                                    if (features[1] <= 2.0775116682052612) {
                                        if (features[1] <= 1.2880470752716064) {
                                            if (features[0] <= 1.2903213500976562) {
                                                if (features[1] <= 1.1290334463119507) {
                                                    classes[0] = 0; 
                                                    classes[1] = 267; 
                                                } else {
                                                    if (features[2] <= 0.5) {
                                                        classes[0] = 2; 
                                                        classes[1] = 0; 
                                                    } else {
                                                        classes[0] = 0; 
                                                        classes[1] = 114; 
                                                    }
                                                }
                                            } else {
                                                classes[0] = 2; 
                                                classes[1] = 0; 
                                            }
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 392; 
                                        }
                                    } else {
                                        if (features[0] <= 1.8945234417915344) {
                                            classes[0] = 2; 
                                            classes[1] = 0; 
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 38; 
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (features[2] <= 0.5) {
                        if (features[3] <= 0.9615384638309479) {
                            if (features[0] <= 1.0712564587593079) {
                                classes[0] = 3; 
                                classes[1] = 0; 
                            } else {
                                classes[0] = 0; 
                                classes[1] = 174; 
                            }
                        } else {
                            if (features[4] <= 5.5) {
                                if (features[3] <= 1.25) {
                                    if (features[0] <= 1.1131160855293274) {
                                        if (features[3] <= 1.0833333134651184) {
                                            classes[0] = 0; 
                                            classes[1] = 14; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        }
                                    } else {
                                        classes[0] = 19; 
                                        classes[1] = 0; 
                                    }
                                } else {
                                    if (features[0] <= 1.2737147808074951) {
                                        classes[0] = 6; 
                                        classes[1] = 0; 
                                    } else {
                                        if (features[1] <= 1.683381736278534) {
                                            classes[0] = 0; 
                                            classes[1] = 97; 
                                        } else {
                                            if (features[0] <= 1.7527568340301514) {
                                                classes[0] = 13; 
                                                classes[1] = 0; 
                                            } else {
                                                if (features[1] <= 2.8237756490707397) {
                                                    classes[0] = 0; 
                                                    classes[1] = 52; 
                                                } else {
                                                    classes[0] = 1; 
                                                    classes[1] = 0; 
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                classes[0] = 11; 
                                classes[1] = 0; 
                            }
                        }
                    } else {
                        if (features[1] <= 1.0490458607673645) {
                            if (features[4] <= 2.166666626930237) {
                                if (features[3] <= 1.5090909600257874) {
                                    if (features[0] <= 1.0353670716285706) {
                                        classes[0] = 2; 
                                        classes[1] = 0; 
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 12; 
                                    }
                                } else {
                                    classes[0] = 0; 
                                    classes[1] = 77; 
                                }
                            } else {
                                classes[0] = 4; 
                                classes[1] = 0; 
                            }
                        } else {
                            if (features[0] <= 1.1849892139434814) {
                                classes[0] = 0; 
                                classes[1] = 161; 
                            } else {
                                if (features[0] <= 1.2138936519622803) {
                                    classes[0] = 1; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[3] <= 3.833333373069763) {
                                        if (features[1] <= 2.1459442377090454) {
                                            classes[0] = 0; 
                                            classes[1] = 239; 
                                        } else {
                                            if (features[0] <= 1.7201589345932007) {
                                                classes[0] = 1; 
                                                classes[1] = 0; 
                                            } else {
                                                classes[0] = 0; 
                                                classes[1] = 21; 
                                            }
                                        }
                                    } else {
                                        if (features[3] <= 4.833333253860474) {
                                            classes[0] = 2; 
                                            classes[1] = 0; 
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 28; 
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    
        return findMax(classes);
    };

};

if (typeof process !== 'undefined' && typeof process.argv !== 'undefined') {
    if (process.argv.length - 2 === 6) {

        // Features:
        var features = process.argv.slice(2);

        // Prediction:
        var clf = new DecisionTreeClassifier();
        var prediction = clf.predict(features);
        console.log(prediction);

    }
}