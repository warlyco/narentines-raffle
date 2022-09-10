import DiscordConnection from "features/oauth/discord-connection";
import TwitterConnection from "features/oauth/twitter-connection";
import { User } from "types/types";

type Props = {
  user: User;
};

const Preferences = ({ user }: Props) => {
  return (
    <div className="space-y-2">
      <div>
        <DiscordConnection user={user} />
      </div>
      <div>
        <TwitterConnection user={user} />
      </div>
    </div>
  );
};

export default Preferences;
