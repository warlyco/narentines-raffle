import type { NextApiHandler } from "next";

import request from "graphql-request";
import UPDATE_ENTRY_COUNT from "graphql/mutations/update-entry-count";

const updateEntryCount: NextApiHandler = async (req, response) => {
  const { id, count, noop } = req.body;

  if (noop) return response.status(200).json({});

  if (!id || !count) throw new Error("Missing required fields");

  try {
    const { update_entries } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_ENTRY_COUNT,
      variables: {
        id,
        count,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    if (!update_entries?.returning?.[0]?.count) {
      response.status(500).json({ error: "Unkown error" });
      return;
    }
    const { returning } = update_entries;

    response.json({ count: returning[0].count });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error });
  }
};

export default updateEntryCount;
