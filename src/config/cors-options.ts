import { whiteList } from "./whitelist";

export const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
