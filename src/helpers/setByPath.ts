import isNumeric from "./isNumeric";

export default function setByPath(obj: any, path: string, value: any) {
  const pList = path.split(".");
  const len = pList.length;
  for (let i = 0; i < len - 1; i++) {
    const nextElemIsArray = isNumeric(pList[i + 1]);
    const elem = pList[i];
    if (!obj[elem]) obj[elem] = nextElemIsArray ? [] : {};
    obj = obj[elem];
  }

  obj[pList[len - 1]] = value;
  return obj;
}
