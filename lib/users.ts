import request from "request";

const FETCH_INTERVAL = 60;

var users: PrivateUser[] = null;
var lastUpdated: number = null;

export class PublicUser {
  id: string;
  created: Date;
  username: string;
  picture: string;
  packages: string[];

  constructor() {
    this.id = undefined;
    this.created = undefined;
    this.username = undefined;
    this.picture = undefined;
    this.packages = undefined;
  }
}

export class PrivateUser extends PublicUser {
  email: string;
  email_verified: boolean;
  access_token?: string;
}

const createPublicUser = (privateUser: PrivateUser): PublicUser => {
  let publicUser = new PublicUser();
  for (const [key, value] of Object.entries(privateUser)) {
    if (publicUser.hasOwnProperty(key)) {
      publicUser[key] = value;
    }
  }
  return Object.assign(publicUser);
};

function fetchUsers(): Promise<PrivateUser[]> {
  var tokenRequestOptions = {
    method: "POST",
    url: "https://dev-bzktuxhd.us.auth0.com/oauth/token",
    headers: { "content-type": "application/json" },
    body: '{"client_id":"r5daVUntoRGE5eIFFDXRctt9Yd7g2Wf8","client_secret":"Y8gLlia4gXLyVJN_BeIDy5ukF_nXW4mXL07SjAme-DFBlsewABCvv_yiCCShq2Bh","audience":"https://dev-bzktuxhd.us.auth0.com/api/v2/","grant_type":"client_credentials"}',
  };

  return new Promise((resolve, reject) =>
    request(tokenRequestOptions, (error, response, body) => {
      if (error) {
        return reject(error);
      }

      var userRequestOptions = {
        method: "GET",
        url: `https://dev-bzktuxhd.us.auth0.com/api/v2/users`,
        headers: {
          authorization: `Bearer ${JSON.parse(body).access_token}`,
        },
      };

      request(userRequestOptions, (error, response, body) => {
        if (error) {
          return reject(error);
        }

        const users = JSON.parse(body).map((user) => {
          const user_metadata = user.user_metadata || {};
          const app_metadata = user.app_metadata || {};
          const publicUser: PublicUser = {
            id: user.user_id,
            created: new Date(user.created_at),
            username: user.username,
            picture: user.picture,
            packages: app_metadata.packages || [],
          };

          if (user_metadata.hasOwnProperty("access_token"))
            publicUser["access_token"] = user_metadata.access_token;
          publicUser["email"] = user.email;
          publicUser["email_verified"] = user.email_verified;

          return publicUser;
        });

        resolve(users);
      });
    })
  );
}

export const getPublicUsers = async (): Promise<PublicUser[]> => {
  const privateUsers = await getPrivateUsers();
  return privateUsers.map((privateUser) => createPublicUser(privateUser));
};

export const getPrivateUsers = async (): Promise<PrivateUser[]> => {
  const secondsSinceEpoch = Math.round(new Date().getTime() / 1000);
  if (!users || secondsSinceEpoch - lastUpdated > FETCH_INTERVAL) {
    users = await fetchUsers();
    lastUpdated = secondsSinceEpoch;
  }

  return users;
};
