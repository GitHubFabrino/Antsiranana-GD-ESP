import { Service } from "@/plugins/service";
import { defineStore } from "pinia";

export const useDateStore = defineStore("date", () => {
  const service = new Service();

  function format(data) {
    let date = new Date(data);
    if (service.verifyIfEmpty(data)) return data;
    else
      return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  return {
    format,
  };
});
