let SHELLY_TARGET_IP = "Shelly_2PM_IP";  // IP target Shelly Plug S

function sendLedConfig(rgb0, rgb1) {
  let payload = {
    leds: {
      mode: "switch",
      colors: {
        "switch:0": {
          on: { rgb: rgb0, brightness: 100 },
          off: { rgb: rgb0, brightness: 100 }
        },
        "switch:1": {
          on: { rgb: rgb1, brightness: 100 },
          off: { rgb: rgb1, brightness: 100 }
        },
        power: { brightness: 100 }
      }
    }
  };

  Shelly.call(
    "http.request",
    {
      method: "POST",
      url: "http://" + SHELLY_TARGET_IP + "/rpc/PLUGS_UI.SetConfig",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: payload }),
      timeout: 5
    },
    function (res, err) {
      if (res) {
        print("LED конфигурация изпратена:", JSON.stringify(res));
      } else {
        print("ГРЕШКА при LED конфигурация:", JSON.stringify(err));
      }
    }
  );
}

// Check 2 relays current status
Timer.set(5000, true, function () {
  Shelly.call("Switch.GetStatus", { id: 0 }, function (res0) {
    let isOn0 = res0.output;

    Shelly.call("Switch.GetStatus", { id: 1 }, function (res1) {
      let isOn1 = res1.output;

      print("Реле 0:", isOn0, "| Реле 1:", isOn1);

      if (isOn0 && isOn1) {
        // Green 2 relas ON
        sendLedConfig([0, 100, 0], [0, 100, 0]);
      } else if (isOn0 && !isOn1) {
        // Blue relay 0 ON
        sendLedConfig([0, 0, 100], [0, 0, 0]);
      } else if (!isOn0 && isOn1) {
        // Yellow relay 1 ON
        sendLedConfig([0, 0, 0], [100, 100, 0]);
      } else {
        // Red all relay OFF
        sendLedConfig([0, 0, 0], [0, 0, 0]);
      }
    });
  });
});
