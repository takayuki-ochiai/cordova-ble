/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
function log(msg, level) {
  level = level || "log";
  if (typeof msg === "object") {
    msg = JSON.stringify(msg, null, "  ");
  }

  console.log(msg);

  if (level === "status" || level === "error") {
    var msgDiv = document.createElement("div");
    msgDiv.textContent = msg;
    if (level === "error") {
      msgDiv.style.color = "red";
    }
    msgDiv.style.padding = "5px 0";
    msgDiv.style.borderBottom = "rgb(192,192,192) solid 1px";
    document.getElementById("output").appendChild(msgDiv);
  }
}

function handleError(error) {
  var msg;
  if (error.error && error.message) {
    var errorItems = [];
    if (error.service) {
      errorItems.push("service: " + (uuids[error.service] || error.service));
    }
    if (error.characteristic) {
      errorItems.push("characteristic: " + (uuids[error.characteristic] || error.characteristic));
    }
    msg = "Error on " + error.error + ": " + error.message + (errorItems.length && (" (" + errorItems.join(", ") + ")"));
  } else {
    msg = error;
  }
  log(msg, "error");
  if (error.error === "read" && error.service && error.characteristic) {
    reportValue(error.service, error.characteristic, "Error: " + error.message);
  }
}

function addDevice(name, address) {

  var button = document.createElement("button");
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.fontSize = "16px";
  button.textContent = name + ": " + address;

  button.addEventListener("click", function() {

    document.getElementById("services").innerHTML = "";
    connect(address);
  });

  document.getElementById("devices").appendChild(button);
}




function stopScan() {
  // new Promise(function(resolve, reject) {
  //   bluetoothle.storpScan(resolve, reject, { address: result.address });
  // }).then(stopScanSuccess, handleError);

  window.bluetoothle.stopScan(stopScanSuccess, function() {
    log("stop scan failure");
  });

}

function stopScanSuccess() {
  if (!foundDevices.length) {
    log("NO DEVICES FOUND");
  } else {
    log("Found " + foundDevices.length + " devices.", "status");
  }
}

function connectSuccess(result) {
  log("connect success");
  log("- " + result.status);
  if (result.status === "connected") {
    getDeviceServices(result.address);
  } else if (result.status === "disconnected") {
    log("Disconnected from device: " + result.address, "status");
  }
}

var foundDevices = [];

function startScanSuccess(result) {
  if (result.status === "scanStarted") {
    log("Scanning for devices (will continue to scan until you select a device)...", "status");
  } else if (result.status === "scanResult") {
    if (!foundDevices.some(function(device) {
        return device.address === result.address;
      })) {

      log('FOUND DEVICE:');
      log(result);
      foundDevices.push(result);
      addDevice(result.name, result.address);
    }
  }
};

function getDeviceServices(address) {
  log("Getting device services...", "status");
  var platform = window.cordova.platformId;
  if (platform === "android") {
    new Promise(function(resolve, reject) {
      bluetoothle.discover(resolve, reject, { address: address });
    }).then(discoverSuccess, handleError);
  } else if (platform === "windows") {
    new Promise(function(resolve, reject) {
      bluetoothle.services(resolve, reject, { address: address });
    }).then(servicesSuccess, handleError);
  } else {
    alert("ios")
    bluetoothle.services(servicesSuccess, handleError, { address: address });
  }
}

function characteristicsSuccess(result) {
  alert("characteristicsSuccess")
  if (result.status === 'characteristics') {
    console.log(result);
  }
}

function servicesSuccess(result) {
  alert("servicesSuccess is " + result.status);
  if (result.status === "services") {
    result.services.forEach(function(service) {
      bluetoothle.characteristics(characteristicsSuccess, handleError, {
        address: result.address,
        service: service,
        characteristics: []
      });
    })
  }
}


function connect(address) {
  log('Connecting to device: ' + address + "...", "status");
  if (cordova.platformId === "windows") {
    getDeviceServices(address);
  } else {
    log("stop scan");
    stopScan();
    window.bluetoothle.connect(
      connectSuccess,
      function() {
        log("connect fail")
      }, { address: address }
    )
  }
}

var app = {
  // Application Constructor
  initialize: function() {
    this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {
    document.addEventListener('deviceready', this.onDeviceReady, false);
  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    app.receivedEvent('deviceready');
  },
  // Update DOM on a Received Event
  receivedEvent: function(id) {
    window.bluetoothle.initialize(
      function() {
        window.bluetoothle.startScan(
          startScanSuccess,
          function() {
            log("Scan failure")
          }, { services: [] }
        )
      },

      function() {
        log("Init failure")
      }
    )

  }
};

app.initialize();
