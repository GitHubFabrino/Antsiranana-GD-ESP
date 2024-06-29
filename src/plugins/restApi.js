import axios from "axios";
import { Cookies } from "./cookies";
import { URL } from "./url";

class RestApi {
  constructor() {
    this.cookies = new Cookies();
    this.url = new URL();
    this.axios = axios.create({
      baseURL: this.url.backend,
    });
  }

  getAuthorisation() {
    return {
      headers: {
        Authorization: this.cookies.get("accessToken")
          ? `Bearer ${this.cookies.get("accessToken")}`
          : "",
      },
    };
  }

  async post(path, data) {
    return await this.axios.post(path, data, this.getAuthorisation());
  }

  async get(path) {
    return await this.axios.get(path, this.getAuthorisation());
  }

  async getFile(path) {
    return await this.axios.get(path, {
      headers: {
        ...this.getAuthorisation().headers,
        responseType: "blob",
        "Content-Type": "application/pdf",
      },
    });
  }

  async put(path, data) {
    return await this.axios.put(path, data, this.getAuthorisation());
  }

  async delete(path) {
    return await this.axios.delete(path, this.getAuthorisation());
  }
}

export { RestApi };
