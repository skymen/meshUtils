export const config = {
  highlight: false,
  deprecated: false,
  returnType: "number",
  description: "Convert a world X position to a local X position",
  params: [
    {
      id: "uid",
      name: "UID",
      desc: "The UID of the object to use",
      type: "number",
    },
    {
      id: "x",
      name: "X",
      desc: "The X position to convert",
      type: "number",
    },
    {
      id: "y",
      name: "Y",
      desc: "The Y position to convert",
      type: "number",
    },
  ],
};

export const expose = false;

export default function (uid, x, y) {
  return this.worldToLocalFromUID(uid, x, y)[0];
}
