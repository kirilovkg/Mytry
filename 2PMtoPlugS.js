let SHELLY_TARGET_IP = "192.168.0.70";  // IP на външното Shelly

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

// Проверява състоянието на двете релета и променя цвета
Timer.set(5000, true, function () {
  Shelly.call("Switch.GetStatus", { id: 0 }, function (res0) {
    let isOn0 = res0.output;

    Shelly.call("Switch.GetStatus", { id: 1 }, function (res1) {
      let isOn1 = res1.output;

      print("Реле 0:", isOn0, "| Реле 1:", isOn1);

      if (isOn0 && isOn1) {
        // Зеленo: двете включени
        sendLedConfig([0, 100, 0], [0, 100, 0]);
      } else if (isOn0 && !isOn1) {
        // Синьо: само реле 0
        sendLedConfig([0, 0, 100], [0, 0, 0]);
      } else if (!isOn0 && isOn1) {
        // Жълто: само реле 1
        sendLedConfig([0, 0, 0], [100, 100, 0]);
      } else {
        // Всичко изключено
        sendLedConfig([0, 0, 0], [0, 0, 0]);
      }
    });
  });
});
