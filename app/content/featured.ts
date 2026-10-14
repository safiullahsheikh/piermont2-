import { projectsIn, WINGS } from "./wings.ts";

/** The six pieces that rise out of the Void on the home page: the lead project of each wing. */
export const FEATURED = WINGS.map((w) => ({ wing: w, ...projectsIn(w)[0] }));
