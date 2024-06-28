import express from "express";
import type { Response, Request } from "express";
import https from "https";
import type { IncomingMessage } from "http";
const cors = require("cors");

const app = express();
const PORT = 8080;

// const setHeaders = function (req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader("X-GitHub-Api-Version", "2022-11-28");
//   res.setHeader("Accept", "application/vnd.github+json");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE",
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "X-Requested-With,content-type",
//   );
//   res.setHeader("Access-Control-Allow-Credentials", true);
//   next(); // invokes next middlewear in the stack
// };
// app.use(setHeaders);

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Github NodeJS API app!");
});

app.get("/org_repos", (req: Request, res: Response) => {
  const { org } = req.query;
  const options = {
    hostname: "api.github.com",
    path: "/orgs/github/repos",
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      "User-Agent": "Node.js", // GitHub API requires a user-agent header
      "X-GitHub-Api-Version": "2022-11-28",
    },
  };

  https
    .get(options, (response) => {
      let data = "";

      // A chunk of data has been received.
      response.on("data", (chunk) => {
        data += chunk;
      });

      // The whole response has been received.
      response.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (err) {
          console.error("Error parsing JSON:", err);
          res.status(500).send("Error parsing JSON");
        }
      });
    })
    .on("error", (err) => {
      console.error("Error: ", err.message);
      res.status(500).send("Error fetching data from GitHub");
    });
  // https.get(options, (apiResponse: IncomingMessage) => {
  //   let data = "";
  //   apiResponse.on("data", (chunk) => {
  //     data += chunk;
  //   });

  //   apiResponse.on("end", () => {
  //     // const jsonData = JSON.parse(data);
  //     console.log("data:", data);
  //     res.json(data);
  //   });
  // });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
