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
  console.log("エラー発生")
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

function respondSuccess(result) {
  console.log(result);
  console.log("respondSuccessEnd");
}


function initializeSuccess(result) {
  console.log(result.status);

  if (result.status === 'enabled') {
    var params = {
      service: "BD0F6577-4A38-4D71-AF1B-4E8F57708080",
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
  } else if (result.status === 'readRequested') {
    console.log("readRequested");
    console.log(result);
    var params = {
      address: result.address,
      service: result.service,
      characteristic: result.characteristic
    };
    var bytes = bluetoothle.stringToBytes("Hello Goodbye");
    var encodedString = bluetoothle.bytesToEncodedString(bytes);
    var params = {
      "requestId": result.requestId,
      "value": encodedString
    };

    bluetoothle.respond(respondSuccess, handleError, params);
    // bluetoothle.read(readSuccess, handleError, params);
    //   "status": "readRequested",
    //   "address": "5163F1E0-5341-AF9B-9F67-613E15EC83F7",
    //   "service": "1234",
    //   "characteristic": "ABCD",
    //   "requestId": 0,
    //   "offset": 0
    // }
  } else if (result.status === "subscribed") {
    console.log("subscribed result is");
    console.log(result);
    var params = {
      "service": result.service,
      "characteristic": result.characteristic,
      "value": "U3Vic2NyaWJlIEhlbGxvIFdvcmxk" //Subscribe Hello World
    };
    bluetoothle.notify(subscribeSuccess, handleError, params);
    recursiveNotify(result);

  }
}

var second = 0;

function recursiveNotify(result) {
  setTimeout(function() {
    var bytes = bluetoothle.stringToBytes(second + "sec: value is updated!!!");
    var encodedString = bluetoothle.bytesToEncodedString(bytes);
    var secondParams = {
      "service": result.service,
      "characteristic": result.characteristic,
      "value": encodedString
    };
    second += 1;
    bluetoothle.notify(subscribeSuccess, handleError, secondParams);
    recursiveNotify(result)
  }, 1000)
}


function subscribeSuccess(result) {
  console.log("SubscribeSuccess");
}

function addServiceSuccess(result) {
  console.log("addServiceSuccess");
  if (result.status === 'serviceAdded') {
    console.log(result.status);
    var params = {
      "services": ["BD0F6577-4A38-4D71-AF1B-4E8F57708080"], //iOS
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
