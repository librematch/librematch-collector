
/*
  [
      11530,
      209525, // profile_id
      "/steam/76561197995781128",
      "{\"icon\":\"PR7-041\"}",
      "aoe2companion.com",
      "AE2C",
      2818,
      416,
      1,
      0,
      null,
      "76561197995781128",
      3,
      []
    ],
 */


export function parseProfile(json: any[]) {
    return {
        profile_id: json[1],
        name: json[4],
        clan: json[5],
        steam_id: json[11],
    };
}
