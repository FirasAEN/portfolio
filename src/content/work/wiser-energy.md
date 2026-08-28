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
  - N-tier Architecture
tags:
  - Dev
  - Frontend
  - IoT
company: capgemini
featured: true
order: 7
---

As a consultant at Capgemini-Sogeti High Tech I built interfaces for Schneider
Electric's Wiser Energy platform: energy consumption monitoring and photovoltaic
production tracking for residential installations, shipped as both internal and
end-user applications across EMEA.

It went out as two products on two framework generations, WiserEnergy on
AngularJS and WiserOne on Angular. Working across both meant holding the shared
concepts consistent while the codebases had different idioms, different build
setups and different people's habits in them. The audiences differed too:
internal tools for people who use them daily and know the domain, end-user
applications for residents who did not choose the software and will never read
documentation. Same data, different assumptions about what the reader already
knows.

I also delivered control of BLE actuators — light bulbs and shutters — through a
web application deployed to Android and iOS with Ionic Cordova. BLE is not a
request/response transport. Devices drift out of range, pairing fails
intermittently, and an operation that succeeded a moment ago may not now. The
interface has to represent a device as *probably* in a state instead of
pretending it knows, and it has to recover without making someone restart the
app.
