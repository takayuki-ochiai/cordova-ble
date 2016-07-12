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
  console.log(error);
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


function initializeSuccess(result) {
  console.log("initializeSuccess");
  var params = {
    service: "1234",
    characteristics: [{
      uuid: "ABCD",
      permissions: {
        read: true,
        write: true,
        //readEncryptionRequired: true,
        //writeEncryptionRequired: true,
      },
      properties: {
        read: true,
        writeWithoutResponse: true,
        write: true,
        notify: true,
        indicate: true,
        //authenticatedSignedWrites: true,
        //notifyEncryptionRequired: true,
        //indicateEncryptionRequired: true,
      }
    }]
  };
  bluetoothle.addService(addServiceSuccess, handleError, params);
}

function addServiceSuccess(result) {
  console.log("addServiceSuccess");
  if (result.status === 'serviceAdded') {
    console.log(serviceAdded);
    var params = {
      "services": ["1234"], //iOS
      "service": "1234", //Android
      "name": "Hello World",
    };
    bluetoothle.startAdvertising(startAdvertisingSuccess, handleError, params);
  }
}

function startAdvertisingSuccess(result) {
  console.log(result.status)
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
    console.log("pripheral start");
    bluetoothle.initializePeripheral(initializeSuccess, handleError, {
      "request": true,
      "restoreKey": "peripheralSample"
    });
  }
};

app.initialize();
