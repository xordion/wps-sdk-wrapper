export const getFileSuffix = (fileName: string, withPoint = true) => {
  const suffix = fileName.split(".").pop() as string;
  if (suffix === fileName) {
    return "";
  }

  return withPoint ? `.${suffix}` : suffix;
};
export const fileType = (names?: string) =>
  names?.match(/\.([a-z]+)$/i)?.[1]?.toLowerCase() || "";
export const getType = (name: string) => {
  const fields = [
    ["w", "doc", "dot", "wps", "wpt", "docx", "dotx", "docm", "dotm", "rtf"],
    ["s", "xls", "xlt", "et", "xlsx", "xltx", "csv", "xlsm", "xlsm"],
    ["p", "ppt", "pptx", "pptm", "ppsx", "ppsm", "pps", "potx", "dpt", "dps"],
    ["f", "pdf"],
    ["o", "otl", "ots"],
    ["d", "dbt"],
  ];
  return fields.find((item) => item.includes(fileType(name)))?.[0] || "w";
};