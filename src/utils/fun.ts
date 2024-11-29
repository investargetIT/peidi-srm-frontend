import { isArray } from "@pureadmin/utils";

export function getLastItem(str, type) {
  if (type == "update") {
    return str ? str[0] : "";
  }
  if (str.length == 0) {
    return "";
  }
  console.log("str", str);

  const parts = str.split("/");
  return parts[parts.length - 1];
}
