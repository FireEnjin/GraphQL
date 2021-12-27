/**
 * Remove capitalization of the first letter of a string
 * @param str The string being uncapped
 */
export default function uncapFirstLetter(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
