import { uuid } from "vue-uuid";
class Service {
  verifyIfEmpty(data) {
    return data === "" || data === null || data == undefined || data == []
      ? true
      : false;
  }

  verifyIfNotEmpty(data) {
    return data != "" && data != null && data != undefined && data != []
      ? true
      : false;
  }

  // JSOSN.stringify objet ----> chaine de caractère JSON
  // JSON.parse manova chaine de caractère JSON ----> JSON
  reformatJSON(data) {
    return JSON.parse(JSON.stringify(data));
  }

  removeDuplicateObject(data) {
    return [
      ...new Map(data.map((item) => [JSON.stringify(item), item])).values(),
    ];
  }

  removeFromArrayByIndex(data, index) {
    data.splice(index, 1);
  }

  getUUID() {
    return uuid.v4();
  }

  stringTrim(data) {
    return data.trim();
  }

  verifyIfEmail(data) {
    const pattern =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(data);
  }

  countChar(data) {
    return String(data).length;
  }

  verifyCharRegex(data, regex) {
    return data.test(regex);
  }

  verifyFormIfOK(data) {
    let isOK = true;
    for (let x in data) {
      if (this.verifyIfEmpty(data[x])) isOK = false;
    }
    return isOK;
  }

  concatArrays(array1, array2) {
    return [...array1, ...array2];
  }

  getMonth(id) {
    let month = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Aout",
      "Septembre",
      "Octobre",
      "Novembre",
      "Decembre",
    ];
    for (let i = 0; i < 12; i++) {
      if (i == id) {
        return month[id];
      }
    }
  }

  removeAllSpaceInString(data) {
    return String(data.split(" ").join(""));
  }

  checkIfModuleIsUsed() {
    console.log("Module service is used !");
  }

  getLastItem(data) {
    if (this.verifyIfNotEmpty(data)) return data.slice(-1)[0];
  }

  getTwoNumberAfterComma(data) {
    return Number(data).toFixed(2);
  }

  getPercentage(data, dataAll) {
    return Number((data * 100) / dataAll).toFixed(2);
  }
}

export { Service };
