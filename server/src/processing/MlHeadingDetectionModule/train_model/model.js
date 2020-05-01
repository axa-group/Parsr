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
                if (features[5] <= 0.5) {
                    if (features[4] <= 6.5) {
                        if (features[3] <= 0.5) {
                            classes[0] = 1841; 
                            classes[1] = 0; 
                        } else {
                            if (features[3] <= 2.5) {
                                if (features[3] <= 1.5) {
                                    if (features[4] <= 5.5) {
                                        if (features[2] <= 0.5) {
                                            classes[0] = 31; 
                                            classes[1] = 0; 
                                        } else {
                                            if (features[4] <= 4.5) {
                                                if (features[4] <= 1.5) {
                                                    classes[0] = 34; 
                                                    classes[1] = 2; 
                                                } else {
                                                    classes[0] = 80; 
                                                    classes[1] = 0; 
                                                }
                                            } else {
                                                classes[0] = 7; 
                                                classes[1] = 2; 
                                            }
                                        }
                                    } else {
                                        classes[0] = 9; 
                                        classes[1] = 3; 
                                    }
                                } else {
                                    if (features[2] <= 0.5) {
                                        classes[0] = 96; 
                                        classes[1] = 0; 
                                    } else {
                                        if (features[6] <= 0.5) {
                                            if (features[4] <= 5.5) {
                                                if (features[4] <= 4.5) {
                                                    if (features[4] <= 3.5) {
                                                        if (features[4] <= 2.5) {
                                                            if (features[4] <= 1.5) {
                                                                classes[0] = 254; 
                                                                classes[1] = 3; 
                                                            } else {
                                                                classes[0] = 237; 
                                                                classes[1] = 5; 
                                                            }
                                                        } else {
                                                            classes[0] = 241; 
                                                            classes[1] = 2; 
                                                        }
                                                    } else {
                                                        classes[0] = 159; 
                                                        classes[1] = 3; 
                                                    }
                                                } else {
                                                    classes[0] = 123; 
                                                    classes[1] = 0; 
                                                }
                                            } else {
                                                classes[0] = 70; 
                                                classes[1] = 2; 
                                            }
                                        } else {
                                            classes[0] = 82; 
                                            classes[1] = 0; 
                                        }
                                    }
                                }
                            } else {
                                if (features[4] <= 4.5) {
                                    if (features[2] <= 0.5) {
                                        classes[0] = 67; 
                                        classes[1] = 0; 
                                    } else {
                                        if (features[4] <= 1.5) {
                                            classes[0] = 37; 
                                            classes[1] = 0; 
                                        } else {
                                            if (features[4] <= 3.5) {
                                                if (features[4] <= 2.5) {
                                                    classes[0] = 121; 
                                                    classes[1] = 1; 
                                                } else {
                                                    classes[0] = 117; 
                                                    classes[1] = 1; 
                                                }
                                            } else {
                                                classes[0] = 195; 
                                                classes[1] = 1; 
                                            }
                                        }
                                    }
                                } else {
                                    classes[0] = 556; 
                                    classes[1] = 0; 
                                }
                            }
                        }
                    } else {
                        if (features[4] <= 10.5) {
                            if (features[4] <= 8.5) {
                                classes[0] = 2400; 
                                classes[1] = 0; 
                            } else {
                                if (features[3] <= 1.5) {
                                    classes[0] = 1094; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[3] <= 2.5) {
                                        if (features[4] <= 9.5) {
                                            classes[0] = 67; 
                                            classes[1] = 0; 
                                        } else {
                                            if (features[2] <= 0.5) {
                                                classes[0] = 16; 
                                                classes[1] = 0; 
                                            } else {
                                                classes[0] = 31; 
                                                classes[1] = 1; 
                                            }
                                        }
                                    } else {
                                        if (features[4] <= 9.5) {
                                            if (features[2] <= 0.5) {
                                                classes[0] = 209; 
                                                classes[1] = 0; 
                                            } else {
                                                classes[0] = 706; 
                                                classes[1] = 1; 
                                            }
                                        } else {
                                            classes[0] = 855; 
                                            classes[1] = 0; 
                                        }
                                    }
                                }
                            }
                        } else {
                            classes[0] = 5327; 
                            classes[1] = 0; 
                        }
                    }
                } else {
                    if (features[4] <= 2.5) {
                        if (features[6] <= 0.5) {
                            if (features[3] <= 0.5) {
                                if (features[4] <= 1.5) {
                                    classes[0] = 30; 
                                    classes[1] = 2; 
                                } else {
                                    classes[0] = 1; 
                                    classes[1] = 0; 
                                }
                            } else {
                                if (features[3] <= 1.5) {
                                    if (features[4] <= 1.5) {
                                        classes[0] = 0; 
                                        classes[1] = 3; 
                                    } else {
                                        classes[0] = 1; 
                                        classes[1] = 3; 
                                    }
                                } else {
                                    if (features[3] <= 2.5) {
                                        if (features[4] <= 1.5) {
                                            classes[0] = 11; 
                                            classes[1] = 4; 
                                        } else {
                                            if (features[2] <= 0.5) {
                                                classes[0] = 2; 
                                                classes[1] = 0; 
                                            } else {
                                                classes[0] = 8; 
                                                classes[1] = 1; 
                                            }
                                        }
                                    } else {
                                        if (features[4] <= 1.5) {
                                            classes[0] = 15; 
                                            classes[1] = 0; 
                                        } else {
                                            classes[0] = 5; 
                                            classes[1] = 1; 
                                        }
                                    }
                                }
                            }
                        } else {
                            classes[0] = 16; 
                            classes[1] = 0; 
                        }
                    } else {
                        if (features[4] <= 14.5) {
                            classes[0] = 174; 
                            classes[1] = 0; 
                        } else {
                            if (features[2] <= 0.5) {
                                if (features[4] <= 18.5) {
                                    classes[0] = 3; 
                                    classes[1] = 3; 
                                } else {
                                    classes[0] = 4; 
                                    classes[1] = 0; 
                                }
                            } else {
                                classes[0] = 13; 
                                classes[1] = 0; 
                            }
                        }
                    }
                }
            } else {
                if (features[6] <= 0.5) {
                    if (features[3] <= 2.5) {
                        if (features[5] <= 0.5) {
                            if (features[3] <= 0.5) {
                                if (features[4] <= 2.5) {
                                    if (features[4] <= 1.5) {
                                        classes[0] = 10; 
                                        classes[1] = 3; 
                                    } else {
                                        classes[0] = 4; 
                                        classes[1] = 5; 
                                    }
                                } else {
                                    if (features[4] <= 7.5) {
                                        if (features[4] <= 3.5) {
                                            classes[0] = 7; 
                                            classes[1] = 2; 
                                        } else {
                                            classes[0] = 4; 
                                            classes[1] = 0; 
                                        }
                                    } else {
                                        classes[0] = 2; 
                                        classes[1] = 2; 
                                    }
                                }
                            } else {
                                if (features[4] <= 8.5) {
                                    if (features[4] <= 2.5) {
                                        if (features[3] <= 1.5) {
                                            if (features[4] <= 1.5) {
                                                classes[0] = 2; 
                                                classes[1] = 7; 
                                            } else {
                                                classes[0] = 1; 
                                                classes[1] = 11; 
                                            }
                                        } else {
                                            if (features[4] <= 1.5) {
                                                classes[0] = 19; 
                                                classes[1] = 42; 
                                            } else {
                                                classes[0] = 16; 
                                                classes[1] = 49; 
                                            }
                                        }
                                    } else {
                                        if (features[4] <= 5.5) {
                                            if (features[3] <= 1.5) {
                                                if (features[4] <= 3.5) {
                                                    classes[0] = 0; 
                                                    classes[1] = 6; 
                                                } else {
                                                    classes[0] = 2; 
                                                    classes[1] = 3; 
                                                }
                                            } else {
                                                if (features[2] <= 0.5) {
                                                    classes[0] = 1; 
                                                    classes[1] = 0; 
                                                } else {
                                                    if (features[4] <= 4.5) {
                                                        if (features[4] <= 3.5) {
                                                            classes[0] = 20; 
                                                            classes[1] = 22; 
                                                        } else {
                                                            classes[0] = 11; 
                                                            classes[1] = 12; 
                                                        }
                                                    } else {
                                                        classes[0] = 8; 
                                                        classes[1] = 9; 
                                                    }
                                                }
                                            }
                                        } else {
                                            if (features[3] <= 1.5) {
                                                classes[0] = 3; 
                                                classes[1] = 2; 
                                            } else {
                                                if (features[4] <= 7.5) {
                                                    if (features[4] <= 6.5) {
                                                        classes[0] = 1; 
                                                        classes[1] = 8; 
                                                    } else {
                                                        classes[0] = 3; 
                                                        classes[1] = 6; 
                                                    }
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 4; 
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    classes[0] = 0; 
                                    classes[1] = 11; 
                                }
                            }
                        } else {
                            if (features[4] <= 6.5) {
                                if (features[4] <= 2.5) {
                                    if (features[3] <= 1.5) {
                                        if (features[4] <= 1.5) {
                                            if (features[3] <= 0.5) {
                                                classes[0] = 2; 
                                                classes[1] = 1; 
                                            } else {
                                                classes[0] = 41; 
                                                classes[1] = 9; 
                                            }
                                        } else {
                                            classes[0] = 4; 
                                            classes[1] = 1; 
                                        }
                                    } else {
                                        if (features[4] <= 1.5) {
                                            classes[0] = 5; 
                                            classes[1] = 6; 
                                        } else {
                                            if (features[2] <= 0.5) {
                                                classes[0] = 1; 
                                                classes[1] = 1; 
                                            } else {
                                                classes[0] = 9; 
                                                classes[1] = 0; 
                                            }
                                        }
                                    }
                                } else {
                                    if (features[4] <= 5.5) {
                                        if (features[4] <= 3.5) {
                                            if (features[3] <= 0.5) {
                                                classes[0] = 1; 
                                                classes[1] = 0; 
                                            } else {
                                                if (features[2] <= 0.5) {
                                                    classes[0] = 0; 
                                                    classes[1] = 1; 
                                                } else {
                                                    classes[0] = 3; 
                                                    classes[1] = 3; 
                                                }
                                            }
                                        } else {
                                            if (features[3] <= 1.5) {
                                                classes[0] = 0; 
                                                classes[1] = 5; 
                                            } else {
                                                classes[0] = 1; 
                                                classes[1] = 1; 
                                            }
                                        }
                                    } else {
                                        if (features[3] <= 1.5) {
                                            classes[0] = 9; 
                                            classes[1] = 2; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        }
                                    }
                                }
                            } else {
                                if (features[3] <= 1.5) {
                                    classes[0] = 0; 
                                    classes[1] = 9; 
                                } else {
                                    classes[0] = 1; 
                                    classes[1] = 0; 
                                }
                            }
                        }
                    } else {
                        if (features[2] <= 0.5) {
                            if (features[5] <= 0.5) {
                                classes[0] = 9; 
                                classes[1] = 0; 
                            } else {
                                classes[0] = 0; 
                                classes[1] = 3; 
                            }
                        } else {
                            if (features[4] <= 1.5) {
                                classes[0] = 4; 
                                classes[1] = 0; 
                            } else {
                                if (features[4] <= 5.5) {
                                    if (features[5] <= 0.5) {
                                        if (features[4] <= 2.5) {
                                            classes[0] = 1; 
                                            classes[1] = 23; 
                                        } else {
                                            if (features[4] <= 4.5) {
                                                if (features[4] <= 3.5) {
                                                    classes[0] = 2; 
                                                    classes[1] = 21; 
                                                } else {
                                                    classes[0] = 2; 
                                                    classes[1] = 17; 
                                                }
                                            } else {
                                                classes[0] = 2; 
                                                classes[1] = 13; 
                                            }
                                        }
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 20; 
                                    }
                                } else {
                                    if (features[4] <= 17.5) {
                                        if (features[4] <= 14.5) {
                                            if (features[4] <= 6.5) {
                                                if (features[5] <= 0.5) {
                                                    classes[0] = 3; 
                                                    classes[1] = 2; 
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 3; 
                                                }
                                            } else {
                                                if (features[4] <= 7.5) {
                                                    classes[0] = 0; 
                                                    classes[1] = 5; 
                                                } else {
                                                    if (features[4] <= 11.5) {
                                                        if (features[4] <= 9.5) {
                                                            if (features[5] <= 0.5) {
                                                                if (features[4] <= 8.5) {
                                                                    classes[0] = 1; 
                                                                    classes[1] = 6; 
                                                                } else {
                                                                    classes[0] = 1; 
                                                                    classes[1] = 4; 
                                                                }
                                                            } else {
                                                                classes[0] = 1; 
                                                                classes[1] = 1; 
                                                            }
                                                        } else {
                                                            if (features[4] <= 10.5) {
                                                                classes[0] = 0; 
                                                                classes[1] = 4; 
                                                            } else {
                                                                classes[0] = 1; 
                                                                classes[1] = 8; 
                                                            }
                                                        }
                                                    } else {
                                                        if (features[4] <= 13.5) {
                                                            classes[0] = 1; 
                                                            classes[1] = 3; 
                                                        } else {
                                                            classes[0] = 2; 
                                                            classes[1] = 4; 
                                                        }
                                                    }
                                                }
                                            }
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 7; 
                                        }
                                    } else {
                                        classes[0] = 3; 
                                        classes[1] = 2; 
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (features[5] <= 0.5) {
                        classes[0] = 2; 
                        classes[1] = 1; 
                    } else {
                        classes[0] = 43; 
                        classes[1] = 0; 
                    }
                }
            }
        } else {
            if (features[6] <= 0.5) {
                if (features[3] <= 0.5) {
                    if (features[4] <= 2.5) {
                        if (features[5] <= 0.5) {
                            if (features[2] <= 0.5) {
                                classes[0] = 1; 
                                classes[1] = 0; 
                            } else {
                                if (features[0] <= 0.5) {
                                    if (features[4] <= 1.5) {
                                        classes[0] = 1; 
                                        classes[1] = 5; 
                                    } else {
                                        classes[0] = 1; 
                                        classes[1] = 6; 
                                    }
                                } else {
                                    classes[0] = 0; 
                                    classes[1] = 5; 
                                }
                            }
                        } else {
                            if (features[0] <= 0.5) {
                                classes[0] = 3; 
                                classes[1] = 3; 
                            } else {
                                classes[0] = 2; 
                                classes[1] = 3; 
                            }
                        }
                    } else {
                        if (features[5] <= 0.5) {
                            if (features[4] <= 8.5) {
                                if (features[2] <= 0.5) {
                                    classes[0] = 5; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[0] <= 0.5) {
                                        if (features[4] <= 4.5) {
                                            if (features[4] <= 3.5) {
                                                classes[0] = 2; 
                                                classes[1] = 1; 
                                            } else {
                                                classes[0] = 2; 
                                                classes[1] = 2; 
                                            }
                                        } else {
                                            if (features[4] <= 7.5) {
                                                if (features[4] <= 5.5) {
                                                    classes[0] = 1; 
                                                    classes[1] = 2; 
                                                } else {
                                                    if (features[4] <= 6.5) {
                                                        classes[0] = 0; 
                                                        classes[1] = 3; 
                                                    } else {
                                                        classes[0] = 1; 
                                                        classes[1] = 3; 
                                                    }
                                                }
                                            } else {
                                                classes[0] = 1; 
                                                classes[1] = 1; 
                                            }
                                        }
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 3; 
                                    }
                                }
                            } else {
                                classes[0] = 7; 
                                classes[1] = 0; 
                            }
                        } else {
                            if (features[4] <= 13.0) {
                                if (features[4] <= 5.5) {
                                    if (features[0] <= 0.5) {
                                        classes[0] = 3; 
                                        classes[1] = 2; 
                                    } else {
                                        if (features[4] <= 3.5) {
                                            classes[0] = 4; 
                                            classes[1] = 1; 
                                        } else {
                                            classes[0] = 12; 
                                            classes[1] = 0; 
                                        }
                                    }
                                } else {
                                    classes[0] = 9; 
                                    classes[1] = 0; 
                                }
                            } else {
                                classes[0] = 0; 
                                classes[1] = 2; 
                            }
                        }
                    }
                } else {
                    if (features[2] <= 0.5) {
                        if (features[0] <= 0.5) {
                            if (features[3] <= 2.5) {
                                if (features[4] <= 7.0) {
                                    if (features[4] <= 4.0) {
                                        if (features[5] <= 0.5) {
                                            if (features[4] <= 2.5) {
                                                classes[0] = 5; 
                                                classes[1] = 2; 
                                            } else {
                                                classes[0] = 0; 
                                                classes[1] = 1; 
                                            }
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                        }
                                    } else {
                                        classes[0] = 2; 
                                        classes[1] = 0; 
                                    }
                                } else {
                                    classes[0] = 0; 
                                    classes[1] = 3; 
                                }
                            } else {
                                if (features[4] <= 9.5) {
                                    classes[0] = 9; 
                                    classes[1] = 0; 
                                } else {
                                    if (features[4] <= 11.0) {
                                        classes[0] = 1; 
                                        classes[1] = 1; 
                                    } else {
                                        classes[0] = 5; 
                                        classes[1] = 0; 
                                    }
                                }
                            }
                        } else {
                            if (features[4] <= 3.5) {
                                classes[0] = 0; 
                                classes[1] = 18; 
                            } else {
                                classes[0] = 3; 
                                classes[1] = 2; 
                            }
                        }
                    } else {
                        if (features[3] <= 2.5) {
                            if (features[4] <= 10.5) {
                                if (features[0] <= 0.5) {
                                    if (features[3] <= 1.5) {
                                        if (features[5] <= 0.5) {
                                            if (features[4] <= 2.5) {
                                                if (features[4] <= 1.5) {
                                                    classes[0] = 1; 
                                                    classes[1] = 3; 
                                                } else {
                                                    classes[0] = 1; 
                                                    classes[1] = 3; 
                                                }
                                            } else {
                                                classes[0] = 0; 
                                                classes[1] = 3; 
                                            }
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 10; 
                                        }
                                    } else {
                                        if (features[4] <= 4.5) {
                                            if (features[4] <= 1.5) {
                                                if (features[5] <= 0.5) {
                                                    classes[0] = 17; 
                                                    classes[1] = 35; 
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 8; 
                                                }
                                            } else {
                                                if (features[5] <= 0.5) {
                                                    if (features[4] <= 3.5) {
                                                        if (features[4] <= 2.5) {
                                                            classes[0] = 7; 
                                                            classes[1] = 35; 
                                                        } else {
                                                            classes[0] = 4; 
                                                            classes[1] = 17; 
                                                        }
                                                    } else {
                                                        classes[0] = 3; 
                                                        classes[1] = 7; 
                                                    }
                                                } else {
                                                    if (features[4] <= 2.5) {
                                                        classes[0] = 2; 
                                                        classes[1] = 6; 
                                                    } else {
                                                        if (features[4] <= 3.5) {
                                                            classes[0] = 4; 
                                                            classes[1] = 7; 
                                                        } else {
                                                            classes[0] = 1; 
                                                            classes[1] = 1; 
                                                        }
                                                    }
                                                }
                                            }
                                        } else {
                                            if (features[4] <= 5.5) {
                                                classes[0] = 0; 
                                                classes[1] = 14; 
                                            } else {
                                                if (features[5] <= 0.5) {
                                                    if (features[4] <= 7.5) {
                                                        classes[0] = 1; 
                                                        classes[1] = 5; 
                                                    } else {
                                                        if (features[4] <= 9.0) {
                                                            classes[0] = 1; 
                                                            classes[1] = 2; 
                                                        } else {
                                                            classes[0] = 1; 
                                                            classes[1] = 3; 
                                                        }
                                                    }
                                                } else {
                                                    classes[0] = 1; 
                                                    classes[1] = 1; 
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (features[4] <= 8.5) {
                                        if (features[4] <= 1.5) {
                                            if (features[3] <= 1.5) {
                                                if (features[5] <= 0.5) {
                                                    classes[0] = 0; 
                                                    classes[1] = 20; 
                                                } else {
                                                    classes[0] = 1; 
                                                    classes[1] = 23; 
                                                }
                                            } else {
                                                if (features[5] <= 0.5) {
                                                    classes[0] = 3; 
                                                    classes[1] = 31; 
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 20; 
                                                }
                                            }
                                        } else {
                                            if (features[3] <= 1.5) {
                                                if (features[4] <= 2.5) {
                                                    if (features[5] <= 0.5) {
                                                        classes[0] = 5; 
                                                        classes[1] = 12; 
                                                    } else {
                                                        classes[0] = 2; 
                                                        classes[1] = 4; 
                                                    }
                                                } else {
                                                    if (features[4] <= 6.5) {
                                                        if (features[4] <= 3.5) {
                                                            if (features[5] <= 0.5) {
                                                                classes[0] = 1; 
                                                                classes[1] = 6; 
                                                            } else {
                                                                classes[0] = 0; 
                                                                classes[1] = 1; 
                                                            }
                                                        } else {
                                                            classes[0] = 0; 
                                                            classes[1] = 12; 
                                                        }
                                                    } else {
                                                        if (features[5] <= 0.5) {
                                                            classes[0] = 1; 
                                                            classes[1] = 4; 
                                                        } else {
                                                            classes[0] = 1; 
                                                            classes[1] = 1; 
                                                        }
                                                    }
                                                }
                                            } else {
                                                if (features[5] <= 0.5) {
                                                    if (features[4] <= 5.5) {
                                                        if (features[4] <= 2.5) {
                                                            classes[0] = 1; 
                                                            classes[1] = 33; 
                                                        } else {
                                                            classes[0] = 0; 
                                                            classes[1] = 60; 
                                                        }
                                                    } else {
                                                        if (features[4] <= 6.5) {
                                                            classes[0] = 2; 
                                                            classes[1] = 7; 
                                                        } else {
                                                            classes[0] = 0; 
                                                            classes[1] = 4; 
                                                        }
                                                    }
                                                } else {
                                                    if (features[4] <= 5.5) {
                                                        if (features[4] <= 3.5) {
                                                            if (features[4] <= 2.5) {
                                                                classes[0] = 1; 
                                                                classes[1] = 22; 
                                                            } else {
                                                                classes[0] = 1; 
                                                                classes[1] = 8; 
                                                            }
                                                        } else {
                                                            if (features[4] <= 4.5) {
                                                                classes[0] = 3; 
                                                                classes[1] = 7; 
                                                            } else {
                                                                classes[0] = 3; 
                                                                classes[1] = 13; 
                                                            }
                                                        }
                                                    } else {
                                                        classes[0] = 0; 
                                                        classes[1] = 9; 
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        if (features[5] <= 0.5) {
                                            classes[0] = 1; 
                                            classes[1] = 4; 
                                        } else {
                                            classes[0] = 2; 
                                            classes[1] = 0; 
                                        }
                                    }
                                }
                            } else {
                                classes[0] = 5; 
                                classes[1] = 0; 
                            }
                        } else {
                            if (features[5] <= 0.5) {
                                if (features[4] <= 15.5) {
                                    if (features[4] <= 6.5) {
                                        if (features[0] <= 0.5) {
                                            if (features[4] <= 2.5) {
                                                classes[0] = 8; 
                                                classes[1] = 22; 
                                            } else {
                                                if (features[4] <= 4.5) {
                                                    if (features[4] <= 3.5) {
                                                        classes[0] = 4; 
                                                        classes[1] = 27; 
                                                    } else {
                                                        classes[0] = 5; 
                                                        classes[1] = 21; 
                                                    }
                                                } else {
                                                    if (features[4] <= 5.5) {
                                                        classes[0] = 3; 
                                                        classes[1] = 8; 
                                                    } else {
                                                        classes[0] = 4; 
                                                        classes[1] = 11; 
                                                    }
                                                }
                                            }
                                        } else {
                                            if (features[4] <= 3.5) {
                                                classes[0] = 0; 
                                                classes[1] = 5; 
                                            } else {
                                                if (features[4] <= 4.5) {
                                                    classes[0] = 1; 
                                                    classes[1] = 1; 
                                                } else {
                                                    if (features[4] <= 5.5) {
                                                        classes[0] = 0; 
                                                        classes[1] = 2; 
                                                    } else {
                                                        classes[0] = 1; 
                                                        classes[1] = 5; 
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        if (features[0] <= 0.5) {
                                            if (features[4] <= 8.5) {
                                                if (features[4] <= 7.5) {
                                                    classes[0] = 2; 
                                                    classes[1] = 15; 
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 12; 
                                                }
                                            } else {
                                                if (features[4] <= 12.0) {
                                                    if (features[4] <= 9.5) {
                                                        classes[0] = 1; 
                                                        classes[1] = 4; 
                                                    } else {
                                                        if (features[4] <= 10.5) {
                                                            classes[0] = 1; 
                                                            classes[1] = 2; 
                                                        } else {
                                                            classes[0] = 1; 
                                                            classes[1] = 3; 
                                                        }
                                                    }
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 1; 
                                                }
                                            }
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 9; 
                                        }
                                    }
                                } else {
                                    classes[0] = 2; 
                                    classes[1] = 0; 
                                }
                            } else {
                                if (features[4] <= 3.5) {
                                    if (features[0] <= 0.5) {
                                        if (features[4] <= 2.5) {
                                            classes[0] = 1; 
                                            classes[1] = 8; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 9; 
                                        }
                                    } else {
                                        if (features[4] <= 2.5) {
                                            classes[0] = 1; 
                                            classes[1] = 2; 
                                        } else {
                                            classes[0] = 3; 
                                            classes[1] = 4; 
                                        }
                                    }
                                } else {
                                    if (features[4] <= 5.5) {
                                        if (features[0] <= 0.5) {
                                            if (features[4] <= 4.5) {
                                                classes[0] = 2; 
                                                classes[1] = 7; 
                                            } else {
                                                classes[0] = 2; 
                                                classes[1] = 5; 
                                            }
                                        } else {
                                            if (features[4] <= 4.5) {
                                                classes[0] = 11; 
                                                classes[1] = 4; 
                                            } else {
                                                classes[0] = 5; 
                                                classes[1] = 4; 
                                            }
                                        }
                                    } else {
                                        if (features[0] <= 0.5) {
                                            if (features[4] <= 13.0) {
                                                if (features[4] <= 6.5) {
                                                    classes[0] = 3; 
                                                    classes[1] = 5; 
                                                } else {
                                                    if (features[4] <= 11.0) {
                                                        if (features[4] <= 8.5) {
                                                            if (features[4] <= 7.5) {
                                                                classes[0] = 4; 
                                                                classes[1] = 2; 
                                                            } else {
                                                                classes[0] = 3; 
                                                                classes[1] = 1; 
                                                            }
                                                        } else {
                                                            classes[0] = 2; 
                                                            classes[1] = 3; 
                                                        }
                                                    } else {
                                                        classes[0] = 1; 
                                                        classes[1] = 0; 
                                                    }
                                                }
                                            } else {
                                                classes[0] = 0; 
                                                classes[1] = 9; 
                                            }
                                        } else {
                                            if (features[4] <= 17.5) {
                                                if (features[4] <= 7.5) {
                                                    if (features[4] <= 6.5) {
                                                        classes[0] = 1; 
                                                        classes[1] = 8; 
                                                    } else {
                                                        classes[0] = 1; 
                                                        classes[1] = 6; 
                                                    }
                                                } else {
                                                    classes[0] = 0; 
                                                    classes[1] = 11; 
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
                classes[0] = 44; 
                classes[1] = 0; 
            }
        }
    
        return findMax(classes);
    };

};

if (typeof process !== 'undefined' && typeof process.argv !== 'undefined') {
    if (process.argv.length - 2 === 7) {

        // Features:
        var features = process.argv.slice(2);

        // Prediction:
        var clf = new DecisionTreeClassifier();
        var prediction = clf.predict(features);
        console.log(prediction);

    }
}