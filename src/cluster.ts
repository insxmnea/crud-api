import cluster from "cluster";
import os from "os";
import { createServer } from "http";
import { requestHandler } from "./app";
import dotenv from "dotenv";
import usersService from "./services/usersService";

dotenv.config();

const PORT = parseInt(process.env.PORT || "4000");
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  const workers: any[] = [];
  let currentWorker = 0;

  for (let i = 0; i < numCPUs - 1; i++) {
    const worker = cluster.fork();
    workers.push(worker);

    worker.on("message", (msg: any) => {
      if (msg?.type === "sync") {
        worker.send({
          type: "state",
          data: Array.from(usersService["users"].entries()),
        });
      } else if (msg?.type === "updateState") {
        const { data } = msg;
        usersService["users"] = new Map(data);
        for (const w of workers) {
          w.send({
            type: "state",
            data: Array.from(usersService["users"].entries()),
          });
        }
      }
    });
  }

  createServer((req, res) => {
    if (workers.length === 0) {
      res.writeHead(500);
      res.end("No workers available");
      return;
    }

    const worker = workers[currentWorker];
    currentWorker = (currentWorker + 1) % workers.length;

    const proxyReq = require("http").request(
      {
        host: "localhost",
        port: PORT + (worker.id || 1),
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes: any) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    req.pipe(proxyReq);
  }).listen(PORT, () => {
    console.log(`Load balancer running on port ${PORT}`);
  });

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    const newWorker = cluster.fork();
    workers.push(newWorker);
  });
} else {
  const workerPort = PORT + (cluster.worker?.id || 1);
  const server = createServer(requestHandler);

  process.send?.({ type: "sync" });

  process.on("message", (msg: any) => {
    if (msg?.type === "state") {
      if (Array.isArray(msg.data)) {
        usersService["users"] = new Map(msg.data.filter(Boolean));
      }
    }
  });

  const syncAfter = () =>
    process.send?.({
      type: "updateState",
      data: Array.from(usersService["users"].entries()),
    });

  const wrap = <T extends (...args: any[]) => any>(fn: T): T =>
    ((...args: any[]) => {
      const result = fn(...args);
      syncAfter();
      return result;
    }) as T;

  usersService.createUser = wrap(usersService.createUser.bind(usersService));
  usersService.updateUser = wrap(usersService.updateUser.bind(usersService));
  usersService.deleteUser = wrap(usersService.deleteUser.bind(usersService));

  server.listen(workerPort, () => {
    console.log(`Worker ${process.pid} started on port ${workerPort}`);
  });
}
