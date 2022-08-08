import type { NextApiHandler } from "next";

const getIp: NextApiHandler = async (req, response) => {
  const { publicKey } = req.body;

  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    response.json({ ip });
  } catch (error) {
    response.status(500).json({ error });
  }
};

export default getIp;
