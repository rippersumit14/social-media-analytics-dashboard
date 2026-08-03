import {
  refreshCreatorNews,
} from "../services/creatorNewsService.js";
import logger from "../utils/logger.js";

const runCreatorNewsJob = async () => {
  logger.info("Creator news refresh job started");

  const results =
    await refreshCreatorNews();

  logger.info("Creator news refresh job completed", {
    results,
  });

  return results;
};

export default runCreatorNewsJob;
