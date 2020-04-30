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

    if (features[0] <= 0.5) {
      if (features[1] <= 0.5) {
        if (features[4] <= 6.5) {
          if (features[3] <= 0.5) {
            classes[0] = 1646;
            classes[1] = 0;
          } else {
            if (features[3] <= 2.5) {
              if (features[5] <= 0.5) {
                if (features[2] <= 0.5) {
                  classes[0] = 132;
                  classes[1] = 0;
                } else {
                  if (features[4] <= 5.5) {
                    if (features[6] <= 0.5) {
                      if (features[4] <= 2.5) {
                        if (features[3] <= 1.5) {
                          if (features[4] <= 1.5) {
                            classes[0] = 24;
                            classes[1] = 2;
                          } else {
                            classes[0] = 24;
                            classes[1] = 0;
                          }
                        } else {
                          if (features[4] <= 1.5) {
                            classes[0] = 176;
                            classes[1] = 4;
                          } else {
                            classes[0] = 156;
                            classes[1] = 6;
                          }
                        }
                      } else {
                        if (features[4] <= 3.5) {
                          if (features[3] <= 1.5) {
                            classes[0] = 20;
                            classes[1] = 0;
                          } else {
                            classes[0] = 107;
                            classes[1] = 1;
                          }
                        } else {
                          if (features[3] <= 1.5) {
                            if (features[4] <= 4.5) {
                              classes[0] = 26;
                              classes[1] = 0;
                            } else {
                              classes[0] = 10;
                              classes[1] = 2;
                            }
                          } else {
                            if (features[4] <= 4.5) {
                              classes[0] = 89;
                              classes[1] = 4;
                            } else {
                              classes[0] = 89;
                              classes[1] = 0;
                            }
                          }
                        }
                      }
                    } else {
                      classes[0] = 86;
                      classes[1] = 0;
                    }
                  } else {
                    if (features[3] <= 1.5) {
                      classes[0] = 9;
                      classes[1] = 3;
                    } else {
                      classes[0] = 47;
                      classes[1] = 2;
                    }
                  }
                }
              } else {
                if (features[4] <= 2.5) {
                  classes[0] = 8;
                  classes[1] = 6;
                } else {
                  classes[0] = 8;
                  classes[1] = 0;
                }
              }
            } else {
              if (features[4] <= 4.5) {
                if (features[5] <= 0.5) {
                  if (features[4] <= 2.5) {
                    classes[0] = 117;
                    classes[1] = 0;
                  } else {
                    if (features[2] <= 0.5) {
                      classes[0] = 34;
                      classes[1] = 0;
                    } else {
                      if (features[4] <= 3.5) {
                        classes[0] = 88;
                        classes[1] = 1;
                      } else {
                        classes[0] = 169;
                        classes[1] = 1;
                      }
                    }
                  }
                } else {
                  classes[0] = 12;
                  classes[1] = 1;
                }
              } else {
                classes[0] = 446;
                classes[1] = 0;
              }
            }
          }
        } else {
          if (features[5] <= 0.5) {
            if (features[3] <= 2.5) {
              if (features[3] <= 1.5) {
                classes[0] = 3139;
                classes[1] = 0;
              } else {
                if (features[4] <= 9.5) {
                  classes[0] = 130;
                  classes[1] = 0;
                } else {
                  if (features[4] <= 10.5) {
                    if (features[2] <= 0.5) {
                      classes[0] = 11;
                      classes[1] = 0;
                    } else {
                      classes[0] = 19;
                      classes[1] = 1;
                    }
                  } else {
                    classes[0] = 122;
                    classes[1] = 0;
                  }
                }
              }
            } else {
              classes[0] = 5696;
              classes[1] = 0;
            }
          } else {
            if (features[4] <= 14.5) {
              classes[0] = 76;
              classes[1] = 0;
            } else {
              if (features[2] <= 0.5) {
                classes[0] = 7;
                classes[1] = 3;
              } else {
                classes[0] = 17;
                classes[1] = 0;
              }
            }
          }
        }
      } else {
        if (features[3] <= 0.5) {
          if (features[4] <= 2.5) {
            classes[0] = 3;
            classes[1] = 4;
          } else {
            if (features[4] <= 10.5) {
              classes[0] = 18;
              classes[1] = 0;
            } else {
              classes[0] = 6;
              classes[1] = 1;
            }
          }
        } else {
          if (features[2] <= 0.5) {
            if (features[4] <= 5.5) {
              classes[0] = 6;
              classes[1] = 1;
            } else {
              classes[0] = 11;
              classes[1] = 1;
            }
          } else {
            if (features[6] <= 0.5) {
              if (features[4] <= 11.5) {
                if (features[4] <= 1.5) {
                  classes[0] = 23;
                  classes[1] = 35;
                } else {
                  if (features[4] <= 6.5) {
                    if (features[4] <= 2.5) {
                      if (features[5] <= 0.5) {
                        if (features[3] <= 2.5) {
                          classes[0] = 7;
                          classes[1] = 27;
                        } else {
                          classes[0] = 6;
                          classes[1] = 24;
                        }
                      } else {
                        classes[0] = 2;
                        classes[1] = 9;
                      }
                    } else {
                      if (features[3] <= 1.5) {
                        classes[0] = 0;
                        classes[1] = 12;
                      } else {
                        if (features[5] <= 0.5) {
                          if (features[4] <= 5.5) {
                            if (features[3] <= 2.5) {
                              if (features[4] <= 4.5) {
                                if (features[4] <= 3.5) {
                                  classes[0] = 5;
                                  classes[1] = 16;
                                } else {
                                  classes[0] = 1;
                                  classes[1] = 7;
                                }
                              } else {
                                classes[0] = 0;
                                classes[1] = 11;
                              }
                            } else {
                              if (features[4] <= 3.5) {
                                classes[0] = 2;
                                classes[1] = 33;
                              } else {
                                if (features[4] <= 4.5) {
                                  classes[0] = 3;
                                  classes[1] = 17;
                                } else {
                                  classes[0] = 2;
                                  classes[1] = 6;
                                }
                              }
                            }
                          } else {
                            classes[0] = 2;
                            classes[1] = 9;
                          }
                        } else {
                          if (features[4] <= 4.5) {
                            if (features[4] <= 3.5) {
                              classes[0] = 3;
                              classes[1] = 11;
                            } else {
                              classes[0] = 2;
                              classes[1] = 5;
                            }
                          } else {
                            classes[0] = 1;
                            classes[1] = 11;
                          }
                        }
                      }
                    }
                  } else {
                    if (features[4] <= 7.5) {
                      if (features[5] <= 0.5) {
                        classes[0] = 3;
                        classes[1] = 6;
                      } else {
                        classes[0] = 3;
                        classes[1] = 4;
                      }
                    } else {
                      if (features[4] <= 8.5) {
                        classes[0] = 1;
                        classes[1] = 6;
                      } else {
                        classes[0] = 6;
                        classes[1] = 11;
                      }
                    }
                  }
                }
              } else {
                classes[0] = 7;
                classes[1] = 2;
              }
            } else {
              classes[0] = 10;
              classes[1] = 0;
            }
          }
        }
      }
    } else {
      if (features[6] <= 0.5) {
        if (features[1] <= 0.5) {
          if (features[3] <= 0.5) {
            if (features[4] <= 1.5) {
              classes[0] = 10;
              classes[1] = 5;
            } else {
              if (features[4] <= 3.5) {
                classes[0] = 4;
                classes[1] = 6;
              } else {
                classes[0] = 5;
                classes[1] = 3;
              }
            }
          } else {
            if (features[4] <= 2.5) {
              if (features[3] <= 1.5) {
                if (features[4] <= 1.5) {
                  classes[0] = 1;
                  classes[1] = 10;
                } else {
                  classes[0] = 2;
                  classes[1] = 10;
                }
              } else {
                if (features[3] <= 2.5) {
                  if (features[5] <= 0.5) {
                    if (features[4] <= 1.5) {
                      classes[0] = 17;
                      classes[1] = 42;
                    } else {
                      classes[0] = 15;
                      classes[1] = 31;
                    }
                  } else {
                    if (features[4] <= 1.5) {
                      classes[0] = 2;
                      classes[1] = 8;
                    } else {
                      classes[0] = 8;
                      classes[1] = 1;
                    }
                  }
                } else {
                  classes[0] = 5;
                  classes[1] = 21;
                }
              }
            } else {
              if (features[2] <= 0.5) {
                classes[0] = 5;
                classes[1] = 4;
              } else {
                if (features[4] <= 13.5) {
                  if (features[4] <= 6.5) {
                    if (features[3] <= 2.5) {
                      if (features[4] <= 4.5) {
                        if (features[3] <= 1.5) {
                          classes[0] = 3;
                          classes[1] = 10;
                        } else {
                          if (features[4] <= 3.5) {
                            classes[0] = 5;
                            classes[1] = 18;
                          } else {
                            classes[0] = 2;
                            classes[1] = 12;
                          }
                        }
                      } else {
                        if (features[4] <= 5.5) {
                          classes[0] = 1;
                          classes[1] = 12;
                        } else {
                          classes[0] = 1;
                          classes[1] = 9;
                        }
                      }
                    } else {
                      if (features[5] <= 0.5) {
                        if (features[4] <= 4.5) {
                          if (features[4] <= 3.5) {
                            classes[0] = 3;
                            classes[1] = 12;
                          } else {
                            classes[0] = 0;
                            classes[1] = 10;
                          }
                        } else {
                          classes[0] = 5;
                          classes[1] = 13;
                        }
                      } else {
                        classes[0] = 0;
                        classes[1] = 19;
                      }
                    }
                  } else {
                    if (features[3] <= 2.5) {
                      classes[0] = 0;
                      classes[1] = 25;
                    } else {
                      if (features[4] <= 8.5) {
                        classes[0] = 2;
                        classes[1] = 7;
                      } else {
                        classes[0] = 1;
                        classes[1] = 9;
                      }
                    }
                  }
                } else {
                  classes[0] = 5;
                  classes[1] = 12;
                }
              }
            }
          }
        } else {
          if (features[5] <= 0.5) {
            if (features[4] <= 5.5) {
              if (features[4] <= 4.5) {
                if (features[3] <= 2.5) {
                  if (features[4] <= 2.5) {
                    if (features[3] <= 1.5) {
                      if (features[4] <= 1.5) {
                        classes[0] = 0;
                        classes[1] = 10;
                      } else {
                        classes[0] = 5;
                        classes[1] = 11;
                      }
                    } else {
                      if (features[4] <= 1.5) {
                        classes[0] = 5;
                        classes[1] = 27;
                      } else {
                        classes[0] = 1;
                        classes[1] = 30;
                      }
                    }
                  } else {
                    if (features[3] <= 1.5) {
                      classes[0] = 1;
                      classes[1] = 10;
                    } else {
                      classes[0] = 0;
                      classes[1] = 31;
                    }
                  }
                } else {
                  classes[0] = 3;
                  classes[1] = 5;
                }
              } else {
                classes[0] = 0;
                classes[1] = 23;
              }
            } else {
              if (features[3] <= 2.5) {
                if (features[3] <= 1.5) {
                  classes[0] = 1;
                  classes[1] = 6;
                } else {
                  classes[0] = 4;
                  classes[1] = 11;
                }
              } else {
                classes[0] = 1;
                classes[1] = 9;
              }
            }
          } else {
            if (features[4] <= 3.5) {
              if (features[3] <= 1.5) {
                classes[0] = 1;
                classes[1] = 9;
              } else {
                classes[0] = 0;
                classes[1] = 65;
              }
            } else {
              if (features[3] <= 2.5) {
                classes[0] = 1;
                classes[1] = 14;
              } else {
                if (features[4] <= 5.5) {
                  classes[0] = 2;
                  classes[1] = 10;
                } else {
                  classes[0] = 1;
                  classes[1] = 10;
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

    return findMax(classes);
  };
};

if (typeof process !== 'undefined' && typeof process.argv !== 'undefined') {
  if (process.argv.length - 2 === 7) {
    // Features:
    var ftures = process.argv.slice(2);

    // Prediction:
    var clf = new DecisionTreeClassifier();
    var prediction = clf.predict(ftures);
    console.log(prediction);
  }
}
