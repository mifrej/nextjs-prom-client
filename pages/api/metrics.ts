import { NextApiResponse } from "next";
import { register, collectDefaultMetrics } from "prom-client";

collectDefaultMetrics({ prefix: "omnidevfrontend_" });

export default (_, res: NextApiResponse) => {
  res.setHeader("Content-type", register.contentType);
  res.send(register.metrics());
};
