import { app } from ".";

export default {
  async fetch(request: Request) {
    return app.fetch(request);
  }
};

