import ky from "ky";

const kyInstance = ky.create({
  parseJson: (text) =>
    JSON.parse(text, (key, values) => {
      if (key.endsWith("At")) return new Date(values);
      return values;
    }),
});

export default kyInstance;
