import * as t from "io-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { fold } from "fp-ts/lib/Either";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";
import { NextApiResponse, NextApiRequest } from "next";
import got from "got";

import { Histogram, register } from "prom-client";

register.clear();

const hapiResponseTime = new Histogram({
  name: "omnidevfrontend_hapi_response_time",
  help: "??"
});

const client = got.extend({
  baseUrl: "https://orange.pl/",
  json: true
});

const Response = t.exact(
  t.type({
    header: t.exact(
      t.type({
        id: t.string,
        title: t.union([t.null, t.string]),
        type: t.literal("HEADER")
      })
    )
  })
);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const stop = hapiResponseTime.startTimer();
    const response = await client.get(
      `/hapi/pwa/v1/components/page/Online/${req.query.id}`
    );

    if (response.body.length === 0) {
      res.status(404).json({
        dt: new Date(),
        name: "HTTPError",
        method: "GET",
        path: `/hapi/pwa/v1/components/page/Online/${req.query.id}`,
        statusCode: 404,
        statusMessage: "Not Found"
      });
    } else {
      const validation = Response.decode(response.body);
      ThrowReporter.report(validation);
      const result = pipe(
        validation,
        fold(() => {}, x => x)
      );
      res.json(result);
    }
    stop();
  } catch (error) {
    const {
      name,
      method,
      path,
      code,
      statusCode,
      statusMessage,
      message
    } = error;
    res.status(statusCode || 500).json({
      dt: new Date(),
      name,
      method,
      path,
      code,
      statusCode,
      statusMessage,
      message
    });
  }
};
