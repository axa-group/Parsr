# iOS Security

### iOS 11

###### January 2018

---

## Contents

######## Page 4 Introduction
######## Page 5 System Security
Secure boot chain  
System Software Authorization  
Secure Enclave  
Touch ID  
Face ID

######## Page 12 Encryption and Data Protection

Hardware security features  
File Data Protection  
Passcodes  
Data Protection classes  
Keychain Data Protection  
Access to Safari saved passwords  
Keybags  
Security Certifications and programs

######## Page 23 App Security

App code signing  
Runtime process security  
Extensions  
App Groups  
Data Protection in apps  
Accessories  
HomeKit  
SiriKit  
HealthKit  
ReplayKit  
Secure Notes  
Shared Notes  
Apple Watch

######## Page 36 Network Security

TLS  
VPN  
Wi-Fi  
Bluetooth  
Single Sign-on  
AirDrop security  
Wi-Fi password sharing

######## Page 41 Apple Pay

Apple Pay components  
How Apple Pay uses the Secure Element  
How Apple Pay uses the NFC controller  
Credit, debit, and prepaid card provisioning  
Payment authorization

---

Transaction-specific dynamic security code  
Contactless payments with Apple Pay  
Paying with Apple Pay within apps  
Paying with Apple Pay on the web or with Handoff Rewards cards  
Apple Pay Cash  
Suica Cards  
Suspending, removing, and erasing cards

######## Page 52 Internet Services

Apple ID  
iMessage  
FaceTime  
iCloud  
iCloud Keychain  
Siri  
Continuity  
Safari Suggestions, Siri Suggestions in Search, Lookup, \#images, News App, and News Widget in Non-News Countries

######## Page 68 Device Controls

Passcode protection  
iOS pairing model  
Configuration enforcement  
Mobile device management (MDM)  
Shared iPad  
Apple School Manager  
Device Enrollment  
Apple Configurator 2  
Supervision  
Restrictions  
Remote Wipe  
Lost Mode  
Activation Lock

######## Page 75 Privacy Controls

Location Services  
Access to personal data  
Privacy policy

######## Page 77 Apple Security Bounty

######## Page 78 Conclusion

A commitment to security

######## Page 79 Glossary

######## Page 81 Document Revision History

---

Security architecture diagram of iOS provides a visual overview of the different technologies discussed in this document.

## Introduction

Apple designed the iOS platform with security at its core. When we set out to create the best possible mobile platform, we drew from decades of experience to build an entirely new architecture. We thought about the security hazards of the desktop environment, and established a new approach to security in the design of iOS. We developed and incorporated innovative features that tighten mobile security and protect the entire system by default. As a result, iOS is a major leap forward in security for mobile devices.

Every iOS device combines software, hardware, and services designed to work together for maximum security and a transparent user experience. iOS protects not only the device and its data at rest, but the entire ecosystem, including everything users do locally, on networks, and with key Internet services.

iOS and iOS devices provide advanced security features, and yet they’re also easy to use. Many of these features are enabled by default, so IT departments don’t need to perform extensive configurations. And key security features like device encryption aren’t configurable, so users can’t disable them by mistake. Other features, such as Face ID, enhance the user experience by making it simpler and more intuitive to secure the device.

This document provides details about how security technology and features are implemented within the iOS platform. It will also help organizations combine iOS platform security technology and features with their own policies and procedures to meet their specific security needs.

This document is organized into the following topic areas:
- **System security:** The integrated and secure software and hardware that are the platform for iPhone, iPad, and iPod touch.
- **Encryption and data protection:** The architecture and design that protects user data if the device is lost or stolen, or if an unauthorized person attempts to use or modify it.
- **App security:** The systems that enable apps to run securely and without compromising platform integrity.
- **Network security:** Industry-standard networking protocols that provide secure authentication and encryption of data in transmission.
- **Apple Pay:** Apple’s implementation of secure payments.
- **Internet services:** Apple’s network-based infrastructure for messaging, syncing, and backup.
- **Device controls:** Methods that allow management of iOS devices, prevent unauthorized use, and enable remote wipe if a device is lost or stolen.
- **Privacy controls:** Capabilities of iOS that can be used to control access to Location Services and user data.

---

########### Entering Device Firmware Upgrade (DFU) mode

Restoring a device after it enters DFU mode returns it to a known good state with the certainty that only unmodified Apple-signed code is present. DFU mode can be entered manually.

First connect the device to a computer using a USB cable.

Then:

On iPhone X, iPhone 8, or iPhone 8 Plus—Press and quickly release the Volume Up button. Press and quickly release the Volume Down button. Then, press and hold the side button until you see the recovery mode screen.

On iPhone 7 or iPhone 7 Plus— Press and hold the side and Volume Down buttons at the same time. Keep holding them until you see the recovery mode screen.

On iPhone 6s and earlier, iPad, or iPod touch—Press and hold both the Home and the Top (or side) buttons at the same time. Keep holding them until you see the recovery mode screen.

**Note:** Nothing will be displayed on the screen when the device is in DFU mode. If the Apple logo appears, the side or Sleep/Wake button was held down too long.

## System Security

System security is designed so that both software and hardware are secure across all core components of every iOS device. This includes the boot-up process, software updates, and Secure Enclave. This architecture is central to security in iOS, and never gets in the way of device usability.

The tight integration of hardware, software, and services on iOS devices ensures that each component of the system is trusted, and validates the system as a whole. From initial boot-up to iOS software updates to third-party apps, each step is analyzed and vetted to help ensure that the hardware and software are performing optimally together and using resources properly.

##### Secure boot chain

Each step of the startup process contains components that are cryptographically signed by Apple to ensure integrity and that proceed only after verifying the chain of trust. This includes the bootloaders, kernel, kernel extensions, and baseband firmware. This secure boot chain helps ensure that the lowest levels of software aren’t tampered with.

When an iOS device is turned on, its application processor immediately executes code from read-only memory known as the Boot ROM. This immutable code, known as the hardware root of trust, is laid down during chip fabrication, and is implicitly trusted. The Boot ROM code contains the Apple Root CA public key, which is used to verify that the iBoot bootloader is signed by Apple before allowing it to load. This is the first step in the chain of trust where each step ensures that the next is signed by Apple. When the iBoot finishes its tasks, it verifies and runs the iOS kernel. For devices with an S1, A9, or earlier A-series processor, an additional Low-Level Bootloader (LLB) stage is loaded and verified by the Boot ROM and in turn loads and verifies iBoot.

A failure of the Boot ROM to load LLB (on older devices) or iBoot (on newer devices) results in the device entering DFU mode. In the case of a failure in LLB or iBoot to load or verify the next step, startup is halted and the device displays the connect to iTunes screen. This is known as recovery mode. In either case, the device must be connected to iTunes via USB and restored to factory default settings.

On devices with cellular access, the baseband subsystem also utilizes its own similar process of secure booting with signed software and keys verified by the baseband processor.

For devices with a Secure Enclave, the Secure Enclave coprocessor also utilizes a secure boot process that ensures its separate software is verified and signed by Apple. See the “Secure Enclave” section of this paper.

For more information on manually entering recovery mode, go to: [https://support.apple.com/kb/HT1808](https://support.apple.com/kb/HT1808)

---

##### System Software Authorization

Apple regularly releases software updates to address emerging security concerns and also provide new features; these updates are provided for all supported devices simultaneously. Users receive iOS update notifications on the device and through iTunes, and updates are delivered wirelessly, encouraging rapid adoption of the latest security fixes.

The startup process described previously helps ensure that only Apple- signed code can be installed on a device. To prevent devices from being downgraded to older versions that lack the latest security updates, iOS uses a process called *System Software Authorization.* If downgrades were possible, an attacker who gains possession of a device could install an older version of iOS and exploit a vulnerability that’s been fixed in the newer version.

On a device with Secure Enclave, the Secure Enclave coprocessor also utilizes System Software Authorization to ensure the integrity of its software and prevent downgrade installations. See the “Secure Enclave” section of this paper.

iOS software updates can be installed using iTunes or over the air (OTA) on the device. With iTunes, a full copy of iOS is downloaded and installed. OTA software updates download only the components required to complete an update, improving network efficiency, rather than downloading the entire OS. Additionally, software updates can be cached on a Mac running macOS High Sierra with Content Caching turned on, so that iOS devices don’t need to redownload the necessary update over the Internet. They’ll still need to contact Apple servers to complete the update process.

During an iOS upgrade, iTunes (or the device itself, in the case of OTA software updates) connects to the Apple installation authorization server and sends it a list of cryptographic measurements for each part of the installation bundle to be installed (for example, iBoot, the kernel, and OS image), a random anti-replay value (nonce), and the device’s unique ID (ECID).

The authorization server checks the presented list of measurements against versions for which installation is permitted and, if it finds a match, adds the ECID to the measurement and signs the result. The server passes a complete set of signed data to the device as part of the upgrade process. Adding the ECID “personalizes” the authorization for the requesting device. By authorizing and signing only for known measurements, the server ensures that the update takes place exactly as provided by Apple.

The boot-time chain-of-trust evaluation verifies that the signature comes from Apple and that the measurement of the item loaded from disk, combined with the device’s ECID, matches what was covered by the signature.

These steps ensure that the authorization is for a specific device and that an old iOS version from one device can’t be copied to another. The nonce prevents an attacker from saving the server’s response and using it to tamper with a device or otherwise alter the system software.

---

##### Secure Enclave

The Secure Enclave is a coprocessor fabricated in the Apple T1, Apple S2, Apple S3, Apple A7, or later A-series processors. It uses encrypted memory and includes a hardware random number generator. The Secure Enclave provides all cryptographic operations for Data Protection key management and maintains the integrity of Data Protection even if the kernel has been compromised. Communication between the Secure Enclave and the application processor is isolated to an interrupt-driven mailbox and shared memory data buffers.

The Secure Enclave runs an Apple-customized version of the L4 microkernel. This microkernel is signed by Apple, verified as part of the iOS secure boot chain, and updated through a personalized software update process.

When the device starts up, an ephemeral key is created, entangled with the device’s UID, and used to encrypt the Secure Enclave’s portion of the device’s memory space. Except on the Apple A7, the Secure Enclave’s memory is also authenticated with the ephemeral key. On the Apple A11, an integrity tree is used to prevent replay of security-critical Secure Enclave memory, authenticated by the ephemeral key and nonces stored in on-chip SRAM.

Additionally, data saved to the file system by the Secure Enclave is encrypted with a key entangled with the UID and an antireplay counter. Antireplay services on the Secure Enclave are used for revocation of data over events that mark antireplay boundaries including, but not limited to, the following:

- Passcode change
- Touch ID or Face ID enable/disable
- Fingerprint add/delete
- Face ID reset
- Apple Pay card add/remove
- Erase All Content and Settings  

The Secure Enclave is also responsible for processing fingerprint and face data from the Touch ID and Face ID sensors, determining if there’s a match, and then enabling access or purchases on behalf of the user.

##### Touch ID

Touch ID is the fingerprint sensing system that makes secure access to iPhone and iPad faster and easier. This technology reads fingerprint data from any angle and learns more about a user’s fingerprint over time, with the sensor continuing to expand the fingerprint map as additional overlapping nodes are identified with each use.

##### Face ID

With a simple glance, Face ID securely unlocks iPhone X. It provides intuitive and secure authentication enabled by the TrueDepth camera system, which uses advanced technologies to accurately map the geometry of your face. Face ID confirms attention by detecting the direction of your gaze, then uses neural networks for matching and anti-spoofing, so you can unlock your phone with a glance. Face ID automatically adapts to changes in your appearance, and carefully safeguards the privacy and security of your biometric data.

---

####### Touch ID, Face ID, and passcodes

To use Touch ID or Face ID, you must set up your device so that a passcode is required to unlock it. When Touch ID or Face ID detects a successful match, your device unlocks without asking for the device passcode. This makes using a longer, more complex passcode far more practical because you don’t need to enter it as frequently. Touch ID and Face ID don’t replace your passcode, but provide easy access to your device within thoughtful boundaries and time constraints. This is important because a strong passcode forms the foundation of your iOS device’s cryptographic protection.

You can always use your passcode instead of Touch ID or Face ID, and it’s still required under the following circumstances:

- The device has just been turned on or restarted.
- The device hasn’t been unlocked for more than 48 hours.
- The passcode hasn’t been used to unlock the device in the last 156 hours (six and a half days) and Face ID hasn’t unlocked the device in the last 4 hours.
- The device has received a remote lock command.
- After five unsuccessful attempts to match.
- After initiating power off/Emergency SOS.

When Touch ID or Face ID is enabled, the device immediately locks when the side button is pressed, and the device locks every time it goes to sleep. Touch ID and Face ID require a successful match—or optionally the passcode—at every wake.

The probability that a random person in the population could look at your iPhone X and unlock it using Face ID is approximately 1 in 1,000,000 (versus 1 in 50,000 for Touch ID). For additional protection, both Touch ID and Face ID allow only five unsuccessful match attempts before a passcode is required to obtain access to your device. With Face ID, the probability of a false match is different for twins and siblings that look like you as well as among children under the age of 13, because their distinct facial features may not have fully developed. If you’re concerned about this, Apple recommends using a passcode to authenticate.

####### Touch ID security

The fingerprint sensor is active only when the capacitive steel ring that surrounds the Home button detects the touch of a finger, which triggers the advanced imaging array to scan the finger and send the scan to the Secure Enclave. Communication between the processor and the Touch ID sensor takes place over a serial peripheral interface bus. The processor forwards the data to the Secure Enclave but can’t read it. It’s encrypted and authenticated with a session key that is negotiated using a shared key provisioned for each Touch ID sensor and its corresponding Secure Enclave at the factory. The shared key is strong, random, and different for every Touch ID sensor. The session key exchange uses AES key wrapping with both sides providing a random key that establishes the session key and uses AES-CCM transport encryption.

The raster scan is temporarily stored in encrypted memory within the Secure Enclave while being vectorized for analysis, and then it’s discarded. The analysis utilizes subdermal ridge flow angle mapping, which is a lossy process that discards minutia data that would be required to reconstruct the user’s actual fingerprint. The resulting map

---

of nodes is stored without any identity information in an encrypted format that can only be read by the Secure Enclave, and is never sent to Apple or backed up to iCloud or iTunes.

####### Face ID security

Face ID is designed to confirm user attention, provide robust authentication with a low false match rate, and mitigate both digital and physical spoofing.

The TrueDepth camera automatically looks for your face when you wake iPhone X by raising it or tapping the screen, as well as when iPhone X attempts to authenticate you to display an incoming notification or when a supported app requests Face ID authentication. When a face is detected, Face ID confirms attention and intent to unlock by detecting that your eyes are open and directed at your device; for accessibility, this is disabled when VoiceOver is activated and, if required, can be disabled separately.

Once it confirms the presence of an attentive face, the TrueDepth camera projects and reads over 30,000 infrared dots to form a depth map of the face, along with a 2D infrared image. This data is used to create a sequence of 2D images and depth maps, which are digitally signed and sent to the Secure Enclave. To counter both digital and physical spoofs, the TrueDepth camera randomizes the sequence of 2D images and depth map captures, and projects a device-specific random pattern. A portion of the A11 Bionic chip’s neural engine—protected within the Secure Enclave—transforms this data into a mathematical representation and compares that representation to the enrolled facial data. This enrolled facial data is itself a mathematical representation of your face captured across a variety of poses.

Facial matching is performed within the Secure Enclave using neural networks trained specifically for that purpose. We developed the facial matching neural networks using over a billion images, including IR and depth images collected in studies conducted with the participants’ informed consent. Apple worked with participants from around the world to include a representative group of people accounting for gender, age, ethnicity, and other factors. The studies were augmented as needed to provide a high degree of accuracy for a diverse range of users. Face ID is designed to work with hats, scarves, glasses, contact lenses, and many sunglasses. Furthermore, it’s designed to work indoors, outdoors, and even in total darkness. An additional neural network that’s trained to spot and resist spoofing defends against attempts to unlock your iPhone X with photos or masks.

Face ID data, including mathematical representations of your face, is encrypted and available only to the Secure Enclave. This data never leaves the device. It isn’t sent to Apple, nor is it included in device backups. The following Face ID data is saved, encrypted only for use by the Secure Enclave, during normal operation:

- The mathematical representations of your face calculated during enrollment.
- The mathematical representations of your face calculated during some unlock attempts if Face ID deems them useful to augment future matching.

---

Face images captured during normal operation aren’t saved, but are instead immediately discarded once the mathematical representation is calculated for either enrollment or comparison to the enrolled Face ID data.

####### How Touch ID or Face ID unlocks an iOS device

With Touch ID or Face ID disabled, when a device locks, the keys for the highest class of Data Protection—which are held in the Secure Enclave— are discarded. The files and Keychain items in that class are inaccessible until you unlock the device by entering your passcode.

With Touch ID or Face ID enabled, the keys aren’t discarded when the device locks; instead, they’re wrapped with a key that’s given to the Touch ID or Face ID subsystem inside the Secure Enclave. When you attempt to unlock the device, if the device detects a successful match, it provides the key for unwrapping the Data Protection keys, and the device is unlocked. This process provides additional protection by requiring cooperation between the Data Protection and Touch ID or Face ID subsystems to unlock the device.

When the device restarts, the keys required for Touch ID or Face ID to unlock the device are lost; they’re discarded by the Secure Enclave after any conditions are met that require passcode entry (for example, after not being unlocked for 48 hours or after five failed match attempts).

To improve unlock performance and keep pace with the natural changes of your face and look, Face ID augments its stored mathematical representation over time. Upon successful unlock, Face ID may use the newly calculated mathematical representation—if its quality is sufficient— for a finite number of additional unlocks before that data is discarded. Conversely, if Face ID fails to recognize you, but the match quality is higher than a certain threshold and you immediately follow the failure by entering your passcode, Face ID takes another capture and augments  
its enrolled Face ID data with the newly calculated mathematical representation. This new Face ID data is discarded if you stop matching against it and after a finite number of unlocks. These augmentation processes allow Face ID to keep up with dramatic changes in your facial hair or makeup use, while minimizing false acceptance.

####### Touch ID, Face ID, and Apple Pay

You can also use Touch ID and Face ID with Apple Pay to make easy and secure purchases in stores, apps, and on the web. For more information on Touch ID and Apple Pay, see the Apple Pay section of this paper.

To authorize an in-store payment with Face ID, you must first confirm intent to pay by double-clicking the side button. You then authenticate using Face ID before placing your iPhone X near the contactless payment reader. If you’d like to select a different Apple Pay payment method after Face ID authentication, you’ll need to reauthenticate, but you won’t have to double-click the side button again.

To make a payment within apps and on the web, you confirm intent to pay by double-clicking the side button, then authenticate using Face ID to authorize the payment. If your Apple Pay transaction isn’t completed within 30 seconds of double-clicking the side button, you’ll have to reconfirm intent to pay by double-clicking again.
