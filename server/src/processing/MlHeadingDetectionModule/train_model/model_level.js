export var DecisionTreeClassifier = function() {

    var findMax = function(nums) {
        var index = 0;
        for (var i = 0; i < nums.length; i++) {
            index = nums[i] > nums[index] ? i : index;
        }
        return index;
    };

    this.predict = function(features) {
        var classes = new Array(8);
            
        if (features[0] <= 7.990000009536743) {
            if (features[0] <= 7.134999990463257) {
                classes[0] = 1; 
                classes[1] = 0; 
                classes[2] = 3; 
                classes[3] = 0; 
                classes[4] = 0; 
                classes[5] = 0; 
                classes[6] = 0; 
                classes[7] = 0; 
            } else {
                if (features[2] <= 1.5) {
                    classes[0] = 0; 
                    classes[1] = 0; 
                    classes[2] = 1; 
                    classes[3] = 0; 
                    classes[4] = 5; 
                    classes[5] = 0; 
                    classes[6] = 0; 
                    classes[7] = 0; 
                } else {
                    classes[0] = 0; 
                    classes[1] = 0; 
                    classes[2] = 0; 
                    classes[3] = 0; 
                    classes[4] = 39; 
                    classes[5] = 0; 
                    classes[6] = 0; 
                    classes[7] = 0; 
                }
            }
        } else {
            if (features[0] <= 12.980000019073486) {
                if (features[1] <= 0.5) {
                    if (features[0] <= 11.980000019073486) {
                        if (features[0] <= 10.934999942779541) {
                            if (features[0] <= 10.454999923706055) {
                                if (features[0] <= 9.480000019073486) {
                                    if (features[2] <= 2.5) {
                                        if (features[0] <= 8.5) {
                                            classes[0] = 0; 
                                            classes[1] = 0; 
                                            classes[2] = 2; 
                                            classes[3] = 2; 
                                            classes[4] = 0; 
                                            classes[5] = 0; 
                                            classes[6] = 0; 
                                            classes[7] = 0; 
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 3; 
                                            classes[2] = 9; 
                                            classes[3] = 0; 
                                            classes[4] = 0; 
                                            classes[5] = 0; 
                                            classes[6] = 0; 
                                            classes[7] = 0; 
                                        }
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 3; 
                                        classes[2] = 0; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    }
                                } else {
                                    if (features[0] <= 9.980000019073486) {
                                        classes[0] = 0; 
                                        classes[1] = 0; 
                                        classes[2] = 0; 
                                        classes[3] = 1; 
                                        classes[4] = 0; 
                                        classes[5] = 1; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 1; 
                                        classes[2] = 0; 
                                        classes[3] = 0; 
                                        classes[4] = 2; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    }
                                }
                            } else {
                                classes[0] = 1; 
                                classes[1] = 0; 
                                classes[2] = 9; 
                                classes[3] = 0; 
                                classes[4] = 0; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
                            }
                        } else {
                            if (features[2] <= 1.5) {
                                classes[0] = 3; 
                                classes[1] = 0; 
                                classes[2] = 0; 
                                classes[3] = 0; 
                                classes[4] = 0; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
                            } else {
                                if (features[0] <= 10.989999771118164) {
                                    if (features[0] <= 10.96999979019165) {
                                        classes[0] = 0; 
                                        classes[1] = 2; 
                                        classes[2] = 0; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 0; 
                                        classes[2] = 0; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 2; 
                                        classes[7] = 0; 
                                    }
                                } else {
                                    if (features[2] <= 2.5) {
                                        if (features[0] <= 11.019999980926514) {
                                            classes[0] = 0; 
                                            classes[1] = 3; 
                                            classes[2] = 0; 
                                            classes[3] = 0; 
                                            classes[4] = 0; 
                                            classes[5] = 0; 
                                            classes[6] = 0; 
                                            classes[7] = 0; 
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 13; 
                                            classes[2] = 0; 
                                            classes[3] = 3; 
                                            classes[4] = 1; 
                                            classes[5] = 0; 
                                            classes[6] = 0; 
                                            classes[7] = 0; 
                                        }
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 1; 
                                        classes[2] = 0; 
                                        classes[3] = 2; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    }
                                }
                            }
                        }
                    } else {
                        if (features[2] <= 1.5) {
                            if (features[2] <= 0.5) {
                                classes[0] = 0; 
                                classes[1] = 0; 
                                classes[2] = 3; 
                                classes[3] = 0; 
                                classes[4] = 0; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
                            } else {
                                classes[0] = 2; 
                                classes[1] = 12; 
                                classes[2] = 0; 
                                classes[3] = 0; 
                                classes[4] = 0; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
                            }
                        } else {
                            if (features[2] <= 2.5) {
                                classes[0] = 1; 
                                classes[1] = 7; 
                                classes[2] = 48; 
                                classes[3] = 1; 
                                classes[4] = 0; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
                            } else {
                                classes[0] = 0; 
                                classes[1] = 13; 
                                classes[2] = 82; 
                                classes[3] = 0; 
                                classes[4] = 0; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
                            }
                        }
                    }
                } else {
                    if (features[0] <= 9.980000019073486) {
                        if (features[0] <= 9.239999771118164) {
                            if (features[2] <= 2.5) {
                                if (features[0] <= 8.5) {
                                    classes[0] = 0; 
                                    classes[1] = 0; 
                                    classes[2] = 0; 
                                    classes[3] = 2; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                } else {
                                    classes[0] = 2; 
                                    classes[1] = 11; 
                                    classes[2] = 5; 
                                    classes[3] = 2; 
                                    classes[4] = 3; 
                                    classes[5] = 0; 
                                    classes[6] = 1; 
                                    classes[7] = 0; 
                                }
                            } else {
                                classes[0] = 3; 
                                classes[1] = 1; 
                                classes[2] = 1; 
                                classes[3] = 18; 
                                classes[4] = 0; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
                            }
                        } else {
                            if (features[2] <= 2.5) {
                                classes[0] = 0; 
                                classes[1] = 0; 
                                classes[2] = 8; 
                                classes[3] = 11; 
                                classes[4] = 1; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
                            } else {
                                classes[0] = 0; 
                                classes[1] = 0; 
                                classes[2] = 5; 
                                classes[3] = 12; 
                                classes[4] = 0; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
                            }
                        }
                    } else {
                        if (features[0] <= 11.75) {
                            if (features[0] <= 10.410000324249268) {
                                if (features[0] <= 10.010000228881836) {
                                    if (features[2] <= 1.5) {
                                        classes[0] = 7; 
                                        classes[1] = 0; 
                                        classes[2] = 1; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    } else {
                                        if (features[2] <= 2.5) {
                                            classes[0] = 0; 
                                            classes[1] = 32; 
                                            classes[2] = 11; 
                                            classes[3] = 3; 
                                            classes[4] = 0; 
                                            classes[5] = 0; 
                                            classes[6] = 0; 
                                            classes[7] = 0; 
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 4; 
                                            classes[2] = 13; 
                                            classes[3] = 3; 
                                            classes[4] = 0; 
                                            classes[5] = 0; 
                                            classes[6] = 0; 
                                            classes[7] = 0; 
                                        }
                                    }
                                } else {
                                    if (features[2] <= 1.5) {
                                        classes[0] = 1; 
                                        classes[1] = 20; 
                                        classes[2] = 0; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    } else {
                                        classes[0] = 0; 
                                        classes[1] = 0; 
                                        classes[2] = 0; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 13; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    }
                                }
                            } else {
                                if (features[0] <= 10.949999809265137) {
                                    classes[0] = 0; 
                                    classes[1] = 0; 
                                    classes[2] = 11; 
                                    classes[3] = 0; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                } else {
                                    if (features[0] <= 10.989999771118164) {
                                        if (features[2] <= 1.5) {
                                            classes[0] = 0; 
                                            classes[1] = 0; 
                                            classes[2] = 0; 
                                            classes[3] = 0; 
                                            classes[4] = 3; 
                                            classes[5] = 1; 
                                            classes[6] = 0; 
                                            classes[7] = 0; 
                                        } else {
                                            classes[0] = 0; 
                                            classes[1] = 3; 
                                            classes[2] = 0; 
                                            classes[3] = 0; 
                                            classes[4] = 0; 
                                            classes[5] = 0; 
                                            classes[6] = 0; 
                                            classes[7] = 1; 
                                        }
                                    } else {
                                        if (features[2] <= 2.5) {
                                            if (features[2] <= 0.5) {
                                                classes[0] = 2; 
                                                classes[1] = 0; 
                                                classes[2] = 0; 
                                                classes[3] = 0; 
                                                classes[4] = 1; 
                                                classes[5] = 1; 
                                                classes[6] = 0; 
                                                classes[7] = 0; 
                                            } else {
                                                if (features[2] <= 1.5) {
                                                    classes[0] = 5; 
                                                    classes[1] = 0; 
                                                    classes[2] = 3; 
                                                    classes[3] = 0; 
                                                    classes[4] = 1; 
                                                    classes[5] = 0; 
                                                    classes[6] = 0; 
                                                    classes[7] = 0; 
                                                } else {
                                                    classes[0] = 10; 
                                                    classes[1] = 4; 
                                                    classes[2] = 15; 
                                                    classes[3] = 0; 
                                                    classes[4] = 5; 
                                                    classes[5] = 0; 
                                                    classes[6] = 0; 
                                                    classes[7] = 0; 
                                                }
                                            }
                                        } else {
                                            if (features[0] <= 11.269999980926514) {
                                                classes[0] = 4; 
                                                classes[1] = 4; 
                                                classes[2] = 0; 
                                                classes[3] = 0; 
                                                classes[4] = 4; 
                                                classes[5] = 1; 
                                                classes[6] = 0; 
                                                classes[7] = 0; 
                                            } else {
                                                classes[0] = 3; 
                                                classes[1] = 0; 
                                                classes[2] = 0; 
                                                classes[3] = 0; 
                                                classes[4] = 0; 
                                                classes[5] = 0; 
                                                classes[6] = 0; 
                                                classes[7] = 0; 
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if (features[2] <= 1.5) {
                                if (features[0] <= 12.480000019073486) {
                                    if (features[2] <= 0.5) {
                                        classes[0] = 1; 
                                        classes[1] = 2; 
                                        classes[2] = 0; 
                                        classes[3] = 0; 
                                        classes[4] = 1; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    } else {
                                        classes[0] = 4; 
                                        classes[1] = 14; 
                                        classes[2] = 2; 
                                        classes[3] = 0; 
                                        classes[4] = 5; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    }
                                } else {
                                    classes[0] = 0; 
                                    classes[1] = 0; 
                                    classes[2] = 0; 
                                    classes[3] = 4; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                }
                            } else {
                                if (features[2] <= 2.5) {
                                    classes[0] = 6; 
                                    classes[1] = 54; 
                                    classes[2] = 27; 
                                    classes[3] = 20; 
                                    classes[4] = 1; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                } else {
                                    classes[0] = 2; 
                                    classes[1] = 13; 
                                    classes[2] = 2; 
                                    classes[3] = 0; 
                                    classes[4] = 1; 
                                    classes[5] = 1; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                }
                            }
                        }
                    }
                }
            } else {
                if (features[0] <= 20.020000457763672) {
                    if (features[1] <= 0.5) {
                        if (features[2] <= 2.5) {
                            if (features[0] <= 14.195000171661377) {
                                if (features[2] <= 1.5) {
                                    classes[0] = 1; 
                                    classes[1] = 2; 
                                    classes[2] = 0; 
                                    classes[3] = 0; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                } else {
                                    classes[0] = 0; 
                                    classes[1] = 3; 
                                    classes[2] = 0; 
                                    classes[3] = 0; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                }
                            } else {
                                if (features[0] <= 19.0) {
                                    if (features[0] <= 17.56999969482422) {
                                        classes[0] = 4; 
                                        classes[1] = 4; 
                                        classes[2] = 1; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    } else {
                                        classes[0] = 6; 
                                        classes[1] = 0; 
                                        classes[2] = 0; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    }
                                } else {
                                    classes[0] = 1; 
                                    classes[1] = 5; 
                                    classes[2] = 0; 
                                    classes[3] = 0; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                }
                            }
                        } else {
                            classes[0] = 0; 
                            classes[1] = 29; 
                            classes[2] = 0; 
                            classes[3] = 0; 
                            classes[4] = 0; 
                            classes[5] = 0; 
                            classes[6] = 0; 
                            classes[7] = 0; 
                        }
                    } else {
                        if (features[0] <= 14.519999980926514) {
                            if (features[2] <= 1.5) {
                                classes[0] = 3; 
                                classes[1] = 0; 
                                classes[2] = 0; 
                                classes[3] = 0; 
                                classes[4] = 0; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
                            } else {
                                if (features[0] <= 14.019999980926514) {
                                    classes[0] = 0; 
                                    classes[1] = 2; 
                                    classes[2] = 0; 
                                    classes[3] = 0; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                } else {
                                    classes[0] = 0; 
                                    classes[1] = 7; 
                                    classes[2] = 0; 
                                    classes[3] = 0; 
                                    classes[4] = 1; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                }
                            }
                        } else {
                            if (features[0] <= 17.520000457763672) {
                                if (features[0] <= 15.5) {
                                    classes[0] = 0; 
                                    classes[1] = 1; 
                                    classes[2] = 1; 
                                    classes[3] = 0; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                } else {
                                    if (features[0] <= 16.010000228881836) {
                                        if (features[2] <= 2.5) {
                                            classes[0] = 16; 
                                            classes[1] = 1; 
                                            classes[2] = 6; 
                                            classes[3] = 1; 
                                            classes[4] = 0; 
                                            classes[5] = 0; 
                                            classes[6] = 0; 
                                            classes[7] = 0; 
                                        } else {
                                            classes[0] = 1; 
                                            classes[1] = 0; 
                                            classes[2] = 5; 
                                            classes[3] = 0; 
                                            classes[4] = 0; 
                                            classes[5] = 0; 
                                            classes[6] = 0; 
                                            classes[7] = 0; 
                                        }
                                    } else {
                                        classes[0] = 4; 
                                        classes[1] = 0; 
                                        classes[2] = 0; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    }
                                }
                            } else {
                                if (features[0] <= 19.0) {
                                    if (features[2] <= 2.5) {
                                        if (features[2] <= 1.0) {
                                            classes[0] = 0; 
                                            classes[1] = 2; 
                                            classes[2] = 0; 
                                            classes[3] = 0; 
                                            classes[4] = 0; 
                                            classes[5] = 0; 
                                            classes[6] = 0; 
                                            classes[7] = 0; 
                                        } else {
                                            classes[0] = 3; 
                                            classes[1] = 6; 
                                            classes[2] = 1; 
                                            classes[3] = 0; 
                                            classes[4] = 0; 
                                            classes[5] = 0; 
                                            classes[6] = 0; 
                                            classes[7] = 0; 
                                        }
                                    } else {
                                        classes[0] = 1; 
                                        classes[1] = 6; 
                                        classes[2] = 3; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    }
                                } else {
                                    classes[0] = 2; 
                                    classes[1] = 0; 
                                    classes[2] = 1; 
                                    classes[3] = 0; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                }
                            }
                        }
                    }
                } else {
                    if (features[2] <= 1.5) {
                        classes[0] = 8; 
                        classes[1] = 0; 
                        classes[2] = 0; 
                        classes[3] = 0; 
                        classes[4] = 0; 
                        classes[5] = 0; 
                        classes[6] = 0; 
                        classes[7] = 0; 
                    } else {
                        if (features[0] <= 24.395000457763672) {
                            if (features[1] <= 0.5) {
                                classes[0] = 4; 
                                classes[1] = 0; 
                                classes[2] = 0; 
                                classes[3] = 0; 
                                classes[4] = 0; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
                            } else {
                                if (features[0] <= 22.5) {
                                    classes[0] = 1; 
                                    classes[1] = 1; 
                                    classes[2] = 0; 
                                    classes[3] = 0; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                } else {
                                    classes[0] = 0; 
                                    classes[1] = 3; 
                                    classes[2] = 0; 
                                    classes[3] = 0; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                }
                            }
                        } else {
                            if (features[0] <= 48.920000076293945) {
                                if (features[0] <= 33.489999771118164) {
                                    if (features[1] <= 0.5) {
                                        classes[0] = 2; 
                                        classes[1] = 1; 
                                        classes[2] = 0; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    } else {
                                        classes[0] = 10; 
                                        classes[1] = 0; 
                                        classes[2] = 0; 
                                        classes[3] = 0; 
                                        classes[4] = 0; 
                                        classes[5] = 0; 
                                        classes[6] = 0; 
                                        classes[7] = 0; 
                                    }
                                } else {
                                    classes[0] = 3; 
                                    classes[1] = 2; 
                                    classes[2] = 0; 
                                    classes[3] = 0; 
                                    classes[4] = 0; 
                                    classes[5] = 0; 
                                    classes[6] = 0; 
                                    classes[7] = 0; 
                                }
                            } else {
                                classes[0] = 4; 
                                classes[1] = 0; 
                                classes[2] = 0; 
                                classes[3] = 0; 
                                classes[4] = 0; 
                                classes[5] = 0; 
                                classes[6] = 0; 
                                classes[7] = 0; 
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
    if (process.argv.length - 2 === 3) {

        // Features:
        var ftures = process.argv.slice(2);

        // Prediction:
        var clf = new DecisionTreeClassifier();
        var prediction = clf.predict(ftures);
        console.log(prediction);

    }
}