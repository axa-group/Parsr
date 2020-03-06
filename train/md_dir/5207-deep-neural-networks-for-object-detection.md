## Deep Neural Networks for Object Detection

###### Christian Szegedy Alexander Toshev Dumitru Erhan  
Google Inc.  
\{szegedy, toshev, dumitru\}@google.com  

#### Abstract

Deep Neural Networks (DNNs) have recently shown outstanding performance on image classiﬁcation tasks [14]. In this paper we go one step further and address the problem of object detection using DNNs, that is not only classifying but also precisely localizing objects of various classes. We present a simple and yet powerful formulation of object detection as a regression problem to object bounding box masks. We deﬁne a multi-scale inference procedure which is able to produce high-resolution object detections at a low cost by a few network applications. State-of-the-art performance of the approach is shown on Pascal VOC.

#### 1 Introduction

As we move towards more complete image understanding, having more precise and detailed object recognition becomes crucial. In this context, one cares not only about classifying images, but also about precisely estimating estimating the class and location of objects contained within the images, a problem known as object detection.

The main advances in object detection were achieved thanks to improvements in object representa- tions and machine learning models. A prominent example of a state-of-the-art detection system is the Deformable Part-based Model (DPM) [9]. It builds on carefully designed representations and kinematically inspired part decompositions of objects, expressed as a graphical model. Using dis- criminative learning of graphical models allows for building high-precision part-based models for variety of object classes.

Manually engineered representations in conjunction with shallow discriminatively trained models have been among the best performing paradigms for the related problem of object classiﬁcation as well [17]. In the last years, however, Deep Neural Networks (DNNs) [12] have emerged as a powerful machine learning model.

DNNs exhibit major differences from traditional approaches for classiﬁcation. First, they are deep architectures which have the capacity to learn more complex models than shallow ones [2]. This expressivity and robust training algorithms allow for learning powerful object representations without the need to hand design features. This has been empirically demonstrated on the challenging ImageNet classiﬁcation task [5] across thousands of classes [14, 15].

In this paper, we exploit the power of DNNs for the problem of object detection, where we not only classify but also try to *precisely localize objects*. The problem we are address here is challenging, since we want to detect a *potentially large number object instances with varying sizes in the same image* using a limited amount of computing resources.

We present a formulation which is capable of predicting the bounding boxes of multiple objects in a given image. More precisely, we formulate a DNN-based regression which outputs a binary mask of the object bounding box (and portions of the box as well), as shown in Fig. 1. Additionally, we employ a simple bounding box inference to extract detections from the masks. To increase localization precision, we apply the DNN mask generation in a multi-scale fashion on the full image as well as on a small number of large image crops, followed by a reﬁnement step (see Fig. 2).

---

In this way, only through a few dozen DNN-regressions we can achieve state-of-art bounding box localization.

In this paper, we demonstrate that DNN-based regression is capable of learning features which are not only good for classiﬁcation, but also capture *strong geometric information*. We use the general architecture introduced for classiﬁcation by [14] and replace the last layer with a regression layer. The somewhat surprising but powerful insight is that networks which to some extent encode translation invariance, can capture object locations as well.

Second, we introduce a multi-scale box inference followed by a reﬁnement step to produce precise detections. In this way, we are able to apply a DNN which predicts a low-resolution mask, limited by the output layer size, to pixel-wise precision at a low cost – the network is a applied only a few dozen times per input image.

In addition, the presented method is quite simple. There is no need to hand design a model which captures parts and their relations explicitly. This simplicity has the advantage of easy applicability to wide range of classes, but also show better detection performance across a wider range of objects - rigid ones as well as deformable ones. This is presented together with state-of-the-art detection results on Pascal VOC challenge [7] in Sec. 7.

##### 2 Related Work

One of the most heavily studied paradigms for object detection is the deformable part-based model, with [9] being the most prominent example. This method combines a set of discriminatively trained parts in a star model called pictorial structure. It can be considered as a 2-layer model – parts being the ﬁrst layer and the star model being the second layer. Contrary to DNNs, whose layers are generic, the work by [9] exploits domain knowledge – the parts are based on manually designed Histogram of Gradients (HOG) descriptors [4] and the structure of the parts is kinematically motivated.

Deep architectures for object detection and parsing have been motivated by part-based models and traditionally are called compositional models, where the object is expressed as layered composition of image primitives. A notable example is the *And/Or* graph [20], where an object is modeled by a tree with *And*-nodes representing different parts and *Or*-nodes representing different modes of the same part. Similarly to DNNs, the *And/Or* graph consists of multiple layers, where lower layers represent small generic image primitives, while higher layers represent object parts. Such compositional models are easier to interpret than DNNs. On the other hand, they require inference while the DNN models considered in this paper are purely feed-forward with no latent variables to be inferred.

Further examples of compositional models for detection are based on segments as primitives [1], focus on shape [13], use Gabor ﬁlters [10] or larger HOG ﬁlters [19]. These approaches are traditionally challenged by the difﬁculty of training and use specially designed learning procedures. Moreover, at inference time they combine bottom-up and top-down processes.

Neural networks (NNs) can be considered as compositional models where the nodes are more generic and less interpretable than the above models. Applications of NNs to vision problems are decades old, with Convolutional NNs being the most prominent example [16]. It was not until recently than these models emerged as highly successful on large-scale image classiﬁcation tasks [14, 15] in the form of DNNs. Their application to detection, however, is limited. Scene parsing, as a more detailed form of detection, has been attempted using multi-layer Convolutional NNs [8]. Segmentation of medical imagery has been addressed using DNNs [3]. Both approaches, however, use the NNs as local or semi-local classiﬁers either over superpixels or at each pixel location. Our approach, however, uses the full image as an input and performs localization through regression. As such, it is a more efﬁcient application of NNs.

Perhaps the closest approach to ours is [18] which has similar high level objective but use much smaller network with a different features, loss function and without a machinery to distinguish between multiple instances of the same class.