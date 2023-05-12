import { testSuite as commonTestSuite } from "./index";
import { testSuite as specificsTestSuite } from "./specifics";
import { createAdapter, createShardedAdapter } from "../lib";
import { createClient, createCluster } from "redis";
import Redis from "ioredis";
import { createClient as createClientV3 } from "redis-v3";

const clusterNodes = [
  {
    url: "redis://localhost:7000",
    host: "localhost",
    port: 7000,
  },
  {
    url: "redis://localhost:7001",
    host: "localhost",
    port: 7001,
  },
  {
    url: "redis://localhost:7002",
    host: "localhost",
    port: 7002,
  },
  {
    url: "redis://localhost:7003",
    host: "localhost",
    port: 7003,
  },
  {
    url: "redis://localhost:7004",
    host: "localhost",
    port: 7004,
  },
  {
    url: "redis://localhost:7005",
    host: "localhost",
    port: 7005,
  },
];

function testSuite(
  createAdapter: any,
  redisPackage: string = "redis@4",
  sharded = false
) {
  commonTestSuite(createAdapter);
  specificsTestSuite(createAdapter, redisPackage, sharded);
}

describe("@socket.io/redis-adapter", () => {
  describe("redis@4 standalone", () =>
    testSuite(async () => {
      const pubClient = createClient();
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      return [
        createAdapter(pubClient, subClient, {
          requestsTimeout: 1000,
        }),
        () => {
          pubClient.disconnect();
          subClient.disconnect();
        },
      ];
    }));

  describe("redis@4 standalone (specific response channel)", () =>
    testSuite(async () => {
      const pubClient = createClient();
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      return [
        createAdapter(pubClient, subClient, {
          requestsTimeout: 1000,
          publishOnSpecificResponseChannel: true,
        }),
        () => {
          pubClient.disconnect();
          subClient.disconnect();
        },
      ];
    }));

  describe("redis@4 cluster", () =>
    testSuite(async () => {
      const pubClient = createCluster({
        rootNodes: clusterNodes,
      });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      return [
        createAdapter(pubClient, subClient, {
          requestsTimeout: 1000,
        }),
        () => {
          pubClient.disconnect();
          subClient.disconnect();
        },
      ];
    }));

  describe("redis@3 standalone", () =>
    testSuite(async () => {
      const pubClient = createClientV3();
      const subClient = pubClient.duplicate();

      return [
        createAdapter(pubClient, subClient, {
          requestsTimeout: 1000,
        }),
        () => {
          pubClient.quit();
          subClient.quit();
        },
      ];
    }, "redis@3"));

  describe("ioredis standalone", () =>
    testSuite(async () => {
      const pubClient = Redis.createClient();
      const subClient = pubClient.duplicate();

      return [
        createAdapter(pubClient, subClient, {
          requestsTimeout: 1000,
        }),
        () => {
          pubClient.disconnect();
          subClient.disconnect();
        },
      ];
    }, "ioredis"));

  describe("ioredis cluster", () =>
    testSuite(async () => {
      const pubClient = new Redis.Cluster(clusterNodes);
      const subClient = pubClient.duplicate();

      return [
        createAdapter(pubClient, subClient, {
          requestsTimeout: 1000,
        }),
        () => {
          pubClient.disconnect();
          subClient.disconnect();
        },
      ];
    }, "ioredis"));

  describe("[sharded] redis@4 standalone (dynamic subscription mode)", () =>
    testSuite(
      async () => {
        const pubClient = createClient();
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        return [
          createShardedAdapter(pubClient, subClient, {
            subscriptionMode: "dynamic",
          }),
          () => {
            pubClient.disconnect();
            subClient.disconnect();
          },
        ];
      },
      "redis@4",
      true
    ));

  describe("[sharded] redis@4 standalone (static subscription mode)", () =>
    testSuite(
      async () => {
        const pubClient = createClient();
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        return [
          createShardedAdapter(pubClient, subClient, {
            subscriptionMode: "static",
          }),
          () => {
            pubClient.disconnect();
            subClient.disconnect();
          },
        ];
      },
      "redis@4",
      true
    ));

  import("./custom-parser");
});
