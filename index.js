var http = require("http");

http
  .createServer(function (req, res) {
    var temperature;

    http
      .get(
        "http://192.168.1.87:8086/query?u=admin&p=awds&db=timeseries&" +
          'q=SELECT * FROM "temperature"',
        function (resp) {
          let data = "";

          resp.on("data", (chunk) => {
            data += chunk;
          });

          resp.on("end", () => {
            temperature = JSON.parse(data);
            distribution = { label: "Temperature ", data: [] };
            for (var sample of temperature["results"][0]["series"][0][
              "values"
            ]) {
              distribution.data.push({ x: sample[0], y: sample[1] });
            }

            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(`<html>
    <head>
    </head>
    <body>
    <div>
        <canvas id="myChart"></canvas>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.1.2/chart.umd.min.js" integrity="sha512-KTyzZ0W6S8dUq9WIt8fSflj2ArYRGcGNIU5QcB1skGGd1EPFMupHZSexEsFFX18tZK4eO0iGGSZGuyrNIqjV8g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
    <script>
    const ctx = document.getElementById('myChart');

    const data = {
        type: 'line',
        data: {
            labels: [],
            datasets: [JSON.parse('${JSON.stringify(distribution)}')],
        },
        options: {
        scales: {
            xAxes: [{
                type: 'time',
                distribution: 'linear',
              }],
        }
        }
    };
    new Chart(ctx, data);
    </script>
    </body>
    </html>`);
            res.end();
          });
        }
      )
      .on("error", (err) => {
        console.log("Error: " + err.message);
      });
  })
  .listen(8080);
