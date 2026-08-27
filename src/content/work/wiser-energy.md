---
title: Schneider Electric — Wiser Energy
publishDate: 2019-06-01 00:00:00
diagram: ble-pairing
description: |
  Energy and photovoltaic monitoring across EMEA, plus BLE control of lights and shutters
  from a web app on Android and iOS — where a device is only ever probably in a state.
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

## Energy monitoring and BLE home automation for Schneider Electric

As a consultant at Capgemini-Sogeti High Tech, I built interfaces for Schneider
Electric's Wiser Energy platform: energy consumption monitoring and photovoltaic
production tracking for residential installations, delivered as both internal
and end-user applications across EMEA.

### Two products, two framework generations

The platform shipped as **WiserEnergy** on AngularJS and **WiserOne** on Angular.
Working across both meant keeping shared concepts consistent while the codebases
had genuinely different idioms — and it is where the case for migrating rather
than maintaining two generations stops being theoretical.

Two audiences, too: internal tools for people who use them daily and know the
domain, and end-user applications for residents who did not choose the software
and will never read documentation. The same data, presented with different
assumptions about what the reader already knows.

### Home automation over Bluetooth Low Energy

I delivered control of BLE actuators — light bulbs and shutters — through a web
application deployed to Android and iOS via Ionic Cordova.

BLE is the interesting constraint. It is not a request/response transport:
devices drift out of range, pairing fails intermittently, and an operation that
succeeded a moment ago may not now. The interface has to represent a device as
*probably* in a state rather than pretending it knows, and it has to recover
without making someone restart the app.

### Technical environment

Java 8 behind React, Angular, AngularJS and TypeScript on the front end, NodeJS,
ThreeJS for visualisation, and Ionic Cordova for the mobile build.
