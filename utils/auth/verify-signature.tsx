import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";

type Props = {
  signature: string;
  message: string;
  publicKey: string;
};

const verifySignature = ({ signature, message, publicKey }: Props) => {
  return nacl.sign.detached.verify(
    decodeUTF8(message),
    Buffer.from(JSON.parse(signature).data),
    Buffer.from(JSON.parse(publicKey).data)
  );
};

export default verifySignature;
