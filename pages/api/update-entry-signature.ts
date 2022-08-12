import type { NextApiHandler } from "next";

import request from "graphql-request";
import UPDATE_ENTRY_SIGNATURE from "graphql/mutations/update-entry-signature";

const updateEntrySignature: NextApiHandler = async (req, response) => {
  const { id, txSignature, noop } = req.body;

  if (noop) return response.status(200).json({});

  if (!id || !txSignature) throw new Error("Missing required fields");

  try {
    const { update_entries } = await request({
      url: process.env.NEXT_PUBLIC_ADMIN_GRAPHQL_API_ENDPOINT!,
      document: UPDATE_ENTRY_SIGNATURE,
      variables: {
        id,
        txSignature,
      },
      requestHeaders: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    });

    if (!update_entries?.returning?.[0]?.txSignature) {
      response.status(500).json({ error: "Unkown error" });
      return;
    }
    const { returning } = update_entries;

    response.json({ signature: returning[0].txSignature });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error });
  }
};

export default updateEntrySignature;
