/**
 * Add capitalization on the first letter of a string
 * @param str The string being capped
 */
export default function capFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
