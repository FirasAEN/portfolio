---
title: Schneider Electric — Wiser Energy
publishDate: 2019-06-01 00:00:00
diagram: ble-pairing
description: |
  Developed energy monitoring interfaces for PV solar facilities and a BLE-based
  home automation mobile app for Schneider Electric's Wiser Energy platform.
tech:
  - Angular
  - AngularJS
  - React
  - TypeScript
  - ThreeJS
  - Ionic Cordova
  - Java
tags:
  - Dev
  - Frontend
  - IoT
featured: true
order: 3
company: capgemini
---

## Energy monitoring and home automation for Schneider Electric

As a consultant at Capgemini-Sogeti High Tech, I built front-ends for Schneider
Electric's Wiser Energy platform — energy monitoring and photovoltaic
production tracking for residential installations, delivered as internal and
end-user applications across EMEA.

### Two product front-ends

The platform shipped as two applications on different framework generations:
**WiserEnergy** on AngularJS and **WiserOne** on Angular. Working across both
meant keeping shared concepts consistent while the two codebases had genuinely
different idioms — and it is where the case for migrating rather than
maintaining two generations became concrete.

### Home automation over Bluetooth Low Energy

I delivered control of BLE actuators — light bulbs and shutters — through a web
application deployed to Android and iOS via Ionic Cordova.

BLE is the interesting constraint. It is not a request/response transport:
devices drift out of range, pairing fails intermittently, and an operation that
succeeded a moment ago may not now. The interface has to represent devices that
are *probably* in a given state rather than pretending it knows, and has to
recover without making the user restart.

### The end-user constraint

Residential software is used by people who did not choose it and will not read
documentation. That pushed the work toward defaults that are correct without
configuration, and toward failure states that explain themselves.

### Technical environment

Angular, AngularJS and React on the front end; ThreeJS for visualisation;
Ionic Cordova for the mobile build; Java 8 services behind them.
