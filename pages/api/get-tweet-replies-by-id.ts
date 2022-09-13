import axios from "axios";
import type { NextApiHandler } from "next";

const tweetsEndpoint = "https://api.twitter.com/2/tweets";
const tweetsSearchEndpoint = "https://api.twitter.com/2/tweets/search/recent";

const getTweetById: NextApiHandler = async (req, response) => {
  const { id } = req.body;
  console.log(id);

  try {
    const { data } = await axios.get(tweetsEndpoint, {
      params: {
        ids: id,
        "tweet.fields":
          "conversation_id,lang,author_id,referenced_tweets,reply_settings,in_reply_to_user_id", // Edit optional query parameters here
        "user.fields": "created_at", // Edit optional query parameters here
        expansions:
          "referenced_tweets.id,referenced_tweets.id.author_id,in_reply_to_user_id",
      },
      headers: {
        "User-Agent": "v2TweetLookupJS",
        authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });

    const { data: conversationData } = await axios.get(tweetsSearchEndpoint, {
      params: {
        query: `conversation_id:${data.data[0]?.conversation_id}`,
        "tweet.fields": "author_id",
      },
      headers: {
        "User-Agent": "v2RecentSearchJS",
        authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });

    const { data: replies, meta } = conversationData;

    response.status(200).json({ replies, meta });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error });
  }
};

export default getTweetById;
