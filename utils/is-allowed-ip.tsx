const isAllowedIp = (ip: string | string[]) => {
  const allowedIps = process.env.ALLOWED_IPS || [""];

  if (typeof ip === "string") {
    return allowedIps.includes(ip);
  }

  return ip.some((allowedIp) => allowedIps.includes(allowedIp));
};

export default isAllowedIp;
