# Trace-based Just-in-Time Type Specialization for Dynamic Languages

### Andreas Gal\*+, Brendan Eich\*, Mike Shaver\*, David Anderson\*, David Mandelin\*, Mohammad R. Haghighat$, Blake Kaplan\*, Graydon Hoare\*, Boris Zbarsky\*, Jason Orendorff\*, Jesse Ruderman\*, Edwin Smith\#, Rick Reitmaier\#, Michael Bebenita\+, Mason Chang+\#, Michael Franz+  

Mozilla Corporation\*
\{gal,brendan,shaver,danderson,dmandelin,mrbkap,graydon,bz,jorendorff,jruderman\}@mozilla.com  
Adobe Corporation\#  
\{edwsmith,rreitmai\}@adobe.com  
Intel Corporation$  
\{mohammad.r.haghighat\}@intel.com  
University of California, Irvine+  
\{mbebenit,changm,franz\}@uci.edu  

## Abstract

Dynamic languages such as JavaScript are more difﬁcult to compile than statically typed ones. Since no concrete type information is available, traditional compilers need to emit generic code that can handle all possible type combinations at runtime. We present an alternative compilation technique for dynamically-typed languages that identiﬁes frequently executed loop traces at run-time and then generates machine code on the ﬂy that is specialized for the actual dynamic types occurring on each path through the loop. Our method provides cheap inter-procedural type specialization, and an elegant and efﬁcient way of incrementally compiling lazily discovered alternative paths through nested loops. We have implemented a dynamic compiler for JavaScript based on our technique and we have measured speedups of 10x and more for certain benchmark programs.  
***Categories and Subject Descriptors*** D.3.4 [*Programming Languages*]: Processors — *Incremental compilers, code generation*.  
***General Terms*** Design, Experimentation, Measurement, Performance.  
***Keywords*** JavaScript, just-in-time compilation, trace trees.

## 1. Introduction  
*Dynamic languages* such as JavaScript, Python, and Ruby, are popular since they are expressive, accessible to non-experts, and make deployment as easy as distributing a source ﬁle. They are used for small scripts as well as for complex applications. JavaScript, for example, is the de facto standard for client-side web programming

Permission to make digital or hard copies of all or part of this work for personal or classroom use is granted without fee provided that copies are not made or distributed for proﬁt or commercial advantage and that copies bear this notice and the full citation on the ﬁrst page. To copy otherwise, to republish, to post on servers or to redistribute to lists, requires prior speciﬁc permission and/or a fee.  
*PLDI’09*,  
c? June 15–20, 2009, Dublin, Ireland.  
Copyright 2009 ACM 978-1-60558-392-1/09/06...$5.00

and is used for the application logic of browser-based productivity applications such as Google Mail, Google Docs and Zimbra Collaboration Suite. In this domain, in order to provide a ﬂuid user experience and enable a new generation of applications, virtual machines must provide a low startup time and high performance. Compilers for statically typed languages rely on type information to generate efﬁcient machine code. In a dynamically typed programming language such as JavaScript, the types of expressions may vary at runtime. This means that the compiler can no longer easily transform operations into machine instructions that operate on one speciﬁc type. Without exact type information, the compiler must emit slower generalized machine code that can deal with all potential type combinations. While compile-time static type inference might be able to gather type information to generate optimized machine code, traditional static analysis is very expensive and hence not well suited for the highly interactive environment of a web browser.  
We present a trace-based compilation technique for dynamic languages that reconciles speed of compilation with excellent performance of the generated machine code. Our system uses a mixed-mode execution approach: the system starts running JavaScript in a fast-starting bytecode interpreter. As the program runs, the system identiﬁes *hot* (frequently executed) bytecode sequences, records them, and compiles them to fast native code. We call such a sequence of instructions a *trace*.  
Unlike method-based dynamic compilers, our dynamic compiler operates at the granularity of individual loops. This design choice is based on the expectation that programs spend most of their time in hot loops. Even in dynamically typed languages, we expect hot loops to be mostly *type-stable*, meaning that the types of values are invariant. (12) For example, we would expect loop counters that start as integers to remain integers for all iterations. When both of these expectations hold, a trace-based compiler can cover the program execution with a small number of type-specialized, efficiently compiled traces.  
Each compiled trace covers one path through the program with one mapping of values to types. When the VM executes a compiled trace, it cannot guarantee that the same path will be followed or that the same types will occur in subsequent loop iterations.
