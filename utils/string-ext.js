/* eslint-disable func-names */

const capitalizeFirstLetter = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Transliterate a name by Russian standard 2022
 * (https://www.gosuslugi.ru/help/faq/foreign_passport/100359)
 * @param {string} str FIO
 */

// prettier-ignore
const translitMap = {
  // eslint-disable-next-line prettier/prettier
  'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ё':'e', 'ж':'zh', 'з':'z', 'и':'i', 'й':'i', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o',
  // eslint-disable-next-line prettier/prettier
  'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'кh', 'ц':'ts', 'ч':'сh', 'ш':'sh', 'щ':'shch', 'ы':'y', 'ъ':'ie', 'э':'e', 'ю':'iu', 'я':'ia'
}

const translitRusToZagran = function (str) {
  const arr = str.split("").map((c) => {
    if (/[а-я]/.test(c)) {
      return translitMap[c] ?? "";
    }
    if (/[А-Я]/.test(c)) {
      return capitalizeFirstLetter(translitMap[c.toLowerCase()] ?? "");
    }
    return c;
  });
  return "".concat(...arr);
};

module.exports = { capitalizeFirstLetter, translitRusToZagran };
