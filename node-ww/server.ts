import express from "express";
import type { Response, Request } from "express";
import https from "https";
import type { IncomingMessage } from "http";
const cors = require("cors");

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Github NodeJS API app!");
});

const generateOptions = (path: string) => {
  return {
    hostname: "api.github.com",
    path,
    method: "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      "User-Agent": "Node.js", // GitHub API requires a user-agent header
      "X-GitHub-Api-Version": "2022-11-28",
    },
  };
};

app.get("/org_repos", (req: Request, res: Response) => {
  const { org } = req.query;
  const options = generateOptions(`/orgs/${org}/repos`);

  https
    .get(options, (response) => {
      let data = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        try {
          const jsonData = JSON.parse(data)
            .sort((a: { forks_count: number }, b: { forks_count: number }) => {
              const { forks_count: forks_count_a } = a;
              const { forks_count: forks_count_b } = b;
              if (forks_count_a > forks_count_b) {
                return -1;
              } else if (forks_count_b > forks_count_a) {
                return 1;
              }
              return 0;
            })
            // TODO: type this or just use octokit.js
            .map((repo: any) => {
              const {
                name,
                stargazers_count,
                watchers_count,
                forks_count, // forks seems to be a duplicated field
                open_issues_count,
                language,
                license,
                owner,
              } = repo;
              return {
                name,
                stargazers_count,
                watchers_count,
                forks_count,
                open_issues_count,
                language,
                license,
                owner: owner.login,
              };
            });
          console.log(jsonData);
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
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
