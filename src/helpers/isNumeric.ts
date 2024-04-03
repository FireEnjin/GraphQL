export default function isNumeric(value: any) {
  return /^-?\d+$/.test(value);
}
